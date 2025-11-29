import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const loginOtpStore: Record<
  string,
  { otp: string; expires: number }
> = {};

function generateOTP() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

async function sendOTPEmail(email: string, otp: string) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.log(`📩 LOGIN OTP for ${email}: ${otp}`);
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
  subject: "🔐 Your ShareSphere Login Verification Code",
  html: `
    <div style="font-family:Arial, sans-serif; background:#f4f4f7; padding:20px;">
      <div style="max-width:480px; margin:auto; background:white; padding:25px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">

        <h2 style="color:#1E1E3F; text-align:center; margin-bottom:10px;">
          ShareSphere Login Verification
        </h2>

        <p style="font-size:15px; color:#444;">
          Dear User,  
          <br><br>
          We received a request to log in to your ShareSphere account.  
          Please use the One-Time Password (OTP) below to verify your identity:
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
          This verification code is valid for <strong>5 minutes</strong>.  
          Do not share this code with anyone. ShareSphere staff will never ask for your OTP.
        </p>

        <hr style="border:none; border-top:1px solid #e5e5e5; margin:25px 0;" />

        <p style="font-size:12px; color:#777; text-align:center;">
          If you did not attempt to log in, you can safely ignore this message.
        </p>

      </div>
    </div>
  `,
});
}

export async function POST(req: Request) {
  try {
    const { usernameEmail, password } = await req.json();

    if (!usernameEmail || !password) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    const users = await sql`
      SELECT * FROM users
      WHERE email = ${usernameEmail} OR username = ${usernameEmail}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 400 }
      );
    }

    const user = users[0];

    if (!user.password_hash) {
      return NextResponse.json(
        {
          error: "This account uses Google Sign-In. Please log in with Google."
        },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    if (user.auth === true || user.auth === "TRUE")
 {
      const otp = generateOTP();

      loginOtpStore[user.email] = {
        otp,
        expires: Date.now() + 5 * 60 * 1000, // 5 min
      };

      await sendOTPEmail(user.email, otp);

      return NextResponse.json(
        {
          auth: true,
          email: user.email,
          message: "OTP sent to email"
        },
        { status: 200 }
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        udata: "0",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "3h" }
    );

    await sql`SELECT ensure_user_exists(${user.id});`;

    const res = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
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
    console.error("❌ Login Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { email, otp } = await req.json();

    const record = loginOtpStore[email];
    if (!record) {
      return NextResponse.json(
        { error: "No OTP request found" },
        { status: 400 }
      );
    }

    if (Date.now() > record.expires) {
      delete loginOtpStore[email];
      return NextResponse.json(
        { error: "OTP expired" },
        { status: 400 }
      );
    }

    if (record.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    const users = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;

    const user = users[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        udata: "0",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    delete loginOtpStore[email];

    await sql`SELECT ensure_user_exists(${user.id});`;

    const res = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
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
    console.error("❌ OTP Verify Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !loginOtpStore[email]) {
      return NextResponse.json(
        { error: "No OTP session found for this email" },
        { status: 400 }
      );
    }

    const newOTP = generateOTP();
    loginOtpStore[email] = {
      otp: newOTP,
      expires: Date.now() + 5 * 60 * 1000,
    };

    await sendOTPEmail(email, newOTP);

    return NextResponse.json(
      { message: "New OTP sent" },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Resend OTP Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
