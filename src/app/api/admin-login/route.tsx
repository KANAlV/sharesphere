import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// OTP store
const adminOtpStore: Record<string, { otp: string; expires: number }> = {};

// OTP generator
function generateOTP() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// Email sender
async function sendAdminOTP(email: string, otp: string, username: string) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.log(`📩 ADMIN LOGIN OTP for ${email}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"ShareSphere Security Team" <${user}>`,
    to: email,
    subject: "🔐 Admin Login Verification Code",
    html: `
      <div style="font-family:Arial, sans-serif; background:#f4f4f7; padding:20px;">
        <div style="max-width:480px; margin:auto; background:white; padding:25px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">

          <h2 style="color:#1E1E3F; text-align:center; margin-bottom:10px;">
            ShareSphere Admin Login Verification
          </h2>

          <p style="font-size:15px; color:#444;">
            Hello <strong>${username}</strong>,<br><br>
            Use the One-Time Password below to verify your admin login attempt:
          </p>

          <div style="margin:25px 0; text-align:center;">
            <span style="
              font-size:32px; 
              font-weight:bold; 
              letter-spacing:10px; 
              color:#1E1E3F;
              display:inline-block;
            ">
              ${otp}
            </span>
          </div>

          <p style="font-size:14px; color:#444;">
            This OTP is valid for <strong>5 minutes</strong>.  
            Never share this code with anyone.
          </p>

          <hr style="border:none; border-top:1px solid #e5e5e5; margin:25px 0;" />

          <p style="font-size:12px; color:#777; text-align:center;">
            If this was not you, please ignore this email.
          </p>

        </div>
      </div>
    `,
  });
}

/* POST - ADMIN LOGIN (Password Check + OTP Send) */
export async function POST(req: Request) {
  try {
    const { usernameEmail, password } = await req.json();

    if (!usernameEmail || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    // Lookup admin in users table
    const users = await sql`
      SELECT * FROM users
      WHERE email = ${usernameEmail} OR username = ${usernameEmail}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 400 });
    }

    const user = users[0];

    // Verify admin exists in admins table
    const adminCheck = await sql`
      SELECT EXISTS(
        SELECT 1 FROM admins WHERE admin_id = ${user.id}
      ) AS "exists"
    `;

    if (!adminCheck[0].exists) {
      return NextResponse.json({ error: "You are not an admin" }, { status: 403 });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // IF admin auth = false → NO OTP
    if (user.auth === false || user.auth === 0) {
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          udata: "1",
        },
        process.env.JWT_SECRET!,
        { expiresIn: "3h" }
      );

      const res = NextResponse.json(
        {
          success: true,
          otp_required: false,
          message: "Login successful",
        },
        { status: 200 }
      );

      res.cookies.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 3 *  60 * 60,
      });

      return res;
    }

    // IF admin auth = true → SEND OTP
    const otp = generateOTP();

    adminOtpStore[user.email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    await sendAdminOTP(user.email, otp, user.username);

    return NextResponse.json(
      {
        success: false,
        otp_required: true,
        email: user.email,
        message: "OTP sent to admin email",
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("❌ Admin Login Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* PUT - VERIFY OTP */
export async function PUT(req: Request) {
  try {
    const { email, otp } = await req.json();

    const record = adminOtpStore[email];

    if (!record) {
      return NextResponse.json({ error: "No OTP session found" }, { status: 400 });
    }

    if (Date.now() > record.expires) {
      delete adminOtpStore[email];
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    if (record.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Load admin from users table
    const adminData = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;

    const admin = adminData[0];

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        udata: "1",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "3h" }
    );

    delete adminOtpStore[email];

    const res = NextResponse.json(
      {
        message: "Admin login successful",
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          udata: "1",
        },
      },
      { status: 200 }
    );

    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 3 * 60 * 60,
    });

    return res;

  } catch (err) {
    console.error("❌ Admin OTP Verify Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

  /* PATCH - RESEND OTP */
export async function PATCH(req: Request) {
  try {
    const { email } = await req.json();

    if (!adminOtpStore[email]) {
      return NextResponse.json(
        { error: "No OTP session found" },
        { status: 400 }
      );
    }

    const newOTP = generateOTP();

    adminOtpStore[email] = {
      otp: newOTP,
      expires: Date.now() + 5 * 60 * 1000,
    };

    const userData = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    const user = userData[0];

    await sendAdminOTP(email, newOTP, user.username);

    return NextResponse.json({ message: "New OTP sent" }, { status: 200 });

  } catch (err) {
    console.error("❌ Admin Resend OTP Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
