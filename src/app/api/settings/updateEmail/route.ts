import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { sql } from "@/lib/db";

const otpStore: Record<
  string,
  {
    otp: string;
    newEmail: string;
    username: string;
    expires: number;
  }
> = {};

function generateOTP(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

{/*Post OTP*/ }
export async function POST(req: Request) {
  try {
    const { userId, password, newEmail, otp } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

   {/*Request OTP*/ }
    if (password && newEmail && !otp) {
      const rows = await sql`
        SELECT id, username, email, password_hash
        FROM users
        WHERE id = ${userId}
      `;

      if (rows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const user = rows[0];

      // Verify password
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
      }

      // Generate OTP
      const generatedOTP = generateOTP();

      otpStore[userId] = {
        otp: generatedOTP,
        newEmail,
        username: user.username,
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      };

      await sendOTPEmail(newEmail, user.username, generatedOTP);

      return NextResponse.json({
        status: "otp_sent",
        message: "OTP sent to new email",
      });
    }

    {/*Verify OTP*/ }
    if (otp) {
      const record = otpStore[userId];

      if (!record) {
        return NextResponse.json({ error: "No OTP request found" }, { status: 400 });
      }

      if (Date.now() > record.expires) {
        delete otpStore[userId];
        return NextResponse.json({ error: "OTP expired" }, { status: 400 });
      }

      if (otp !== record.otp) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }

      // Update email in Neon PostgreSQL
      await sql`
        UPDATE users
        SET email = ${record.newEmail}
        WHERE id = ${userId}
      `;

      delete otpStore[userId];

      return NextResponse.json({
        status: "email_updated",
        newEmail: record.newEmail,
      });
    }

    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  } catch (err: unknown) {
    console.error("❌ Update Email Error:", err);
    return NextResponse.json({ error: (err as Error).message || "Server error" }, { status: 500 });
  }
}

{/*Resend OTP*/ }
export async function PUT(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId || !otpStore[userId]) {
      return NextResponse.json(
        { error: "No email change in progress" },
        { status: 400 }
      );
    }

    const record = otpStore[userId];

    const newOTP = generateOTP();
    otpStore[userId] = {
      ...record,
      otp: newOTP,
      expires: Date.now() + 5 * 60 * 1000,
    };

    await sendOTPEmail(record.newEmail, record.username, newOTP);

    return NextResponse.json({ message: "A new OTP has been sent." });
  } catch (err: unknown) {
    console.error("❌ Resend OTP Error:", err);
    return NextResponse.json({ error: (err as Error).message || "Server error" }, { status: 500 });
  }
}

{/*Helper: Send OTP Email*/ }
async function sendOTPEmail(email: string, username: string, otp: string) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.log(`📩 OTP for ${email}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"ShareSphere Security" <${user}>`,
    to: email,
    subject: "Confirm Email Change — OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 25px; border: 1px solid #e1e4e8;">
          <h2 style="color: #111; text-align: center;">Email Change Verification</h2>
          <p>Hello <b>${username}</b>,</p>
          <p>You requested to change your email. Use this OTP to verify:</p>
          <div style="text-align: center; margin: 25px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #007bff;">
              ${otp}
            </span>
          </div>
          <p>This OTP is valid for 5 minutes.</p>
          <p style="font-size: 12px; color: #888; text-align: center;">Previous OTPs are now invalid.</p>
        </div>
      </div>
    `,
  });
}
