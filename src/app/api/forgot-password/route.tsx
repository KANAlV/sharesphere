import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { neon } from "@neondatabase/serverless";

// Temporary in-memory OTP store
const otpStore: Record<string, { otp: string; expires: number }> = {};

// Generate random 6-character OTP
function generateOTP(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();
    const sql = neon(process.env.DATABASE_URL!);

    // --- STEP 1: SEND OTP ---
    if (email && !otp && !newPassword) {
      // 🔍 Check if email exists first
      const existingUser = await sql`SELECT email FROM users WHERE email = ${email}`;
      if (existingUser.length === 0) {
        return NextResponse.json({ error: "Email not found. Please check again." }, { status: 404 });
      }

      // Generate and store OTP
      const generatedOTP = generateOTP();
      otpStore[email] = { otp: generatedOTP, expires: Date.now() + 5 * 60 * 1000 }; // 5 mins

      const user = process.env.EMAIL_USER;
      const pass = process.env.EMAIL_PASS;

      // 🧩 Development fallback: logs OTP if email credentials are missing
      if (!user || !pass) {
        console.log(`📩 OTP for ${email}: ${generatedOTP}`);
        return NextResponse.json({
          message: "OTP logged to console (development mode)",
          otp: generatedOTP,
        });
      }

     
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user, pass },
      });

            await transporter.sendMail({
  from: `"ShareSphere Support" <${user}>`,
  to: email,
  subject: "ShareSphere - One Time Password (OTP) Verification",
  html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 25px; border: 1px solid #e1e4e8;">
      <h2 style="color: #1a1a1a; text-align: center;">Verify Your Email Address</h2>
      <p style="font-size: 15px; color: #333;">
        To verify your email address, please use the following One-Time Password (OTP):
      </p>
      <div style="text-align: center; margin: 25px 0;">
        <span style="font-size: 26px; font-weight: bold; letter-spacing: 3px; color: #007bff;">
          ${generatedOTP}
        </span>
      </div>
      <p style="font-size: 14px; color: #555; line-height: 1.6;">
        Do not share this OTP with anyone. <strong>ShareSphere</strong> takes your account security very seriously.
        Our support team will <strong>never</strong> ask you to disclose or verify your account password or OTP.
      </p>
      <p style="font-size: 14px; color: #555; line-height: 1.6;">
        If you receive a suspicious email asking you to update your account information,
        do not click any links. Instead, please report the email to ShareSphere Support for investigation.
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">
        ⚠️ Do not reply to this email. This is an automatic message from ShareSphere Support.
      </p>
    </div>
  </div>
  `,
});


      return NextResponse.json({ message: "OTP sent successfully" });
    }


    if (email && otp && !newPassword) {
      const record = otpStore[email];
      if (!record)
        return NextResponse.json({ error: "No OTP found for this email" }, { status: 400 });
      if (Date.now() > record.expires)
        return NextResponse.json({ error: "OTP expired" }, { status: 400 });
      if (record.otp !== otp)
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });

      return NextResponse.json({ message: "OTP verified" });
    }

    if (email && otp && newPassword) {
      const record = otpStore[email];
      if (!record)
        return NextResponse.json({ error: "No OTP found for this email" }, { status: 400 });
      if (record.otp !== otp)
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      if (Date.now() > record.expires)
        return NextResponse.json({ error: "OTP expired" }, { status: 400 });

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await sql`
        UPDATE users
        SET password_hash = ${hashedPassword}
        WHERE email = ${email};
      `;

      delete otpStore[email]; 
      return NextResponse.json({ message: "Password reset successful" });
    }

   
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  } catch (err: any) {
    console.error("❌ Forgot Password Error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
