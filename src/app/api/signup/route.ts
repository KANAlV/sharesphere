import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { neon } from "@neondatabase/serverless";

// Temporary in-memory OTP store
const otpStore: Record<
  string,
  { otp: string; username: string; hashedPassword: string; expires: number }
> = {};

// Generate random 6-character OTP
function generateOTP(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: Request) {
  try {
    const { username, email, password, otp } = await req.json();
    const sql = neon(process.env.DATABASE_URL!);

    // --- STEP 1: SEND OTP ---
    if (username && email && password && !otp) {
      // Check if email already exists
      const existing = await sql`SELECT email FROM users WHERE email = ${email}`;
      if (existing.length > 0) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const generatedOTP = generateOTP();
      otpStore[email] = {
        otp: generatedOTP,
        username,
        hashedPassword,
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      };

      const user = process.env.EMAIL_USER;
      const pass = process.env.EMAIL_PASS;

      // Development fallback
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
        subject: "ShareSphere - Verify Your Email",
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 25px; border: 1px solid #e1e4e8;">
            <h2 style="color: #1a1a1a; text-align: center;">Verify Your Email</h2>
            <p style="font-size: 15px; color: #333;">
              Welcome to <strong>ShareSphere</strong>! Please use the OTP below to complete your registration:
            </p>
            <div style="text-align: center; margin: 25px 0;">
              <span style="font-size: 26px; font-weight: bold; letter-spacing: 3px; color: #007bff;">
                ${generatedOTP}
              </span>
            </div>
            <p style="font-size: 14px; color: #555;">This OTP will expire in 5 minutes.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">
              ⚠️ Do not share this OTP with anyone. This is an automated message from ShareSphere.
            </p>
          </div>
        </div>
      `,
      });

      return NextResponse.json({ message: "OTP sent to your email" });
    }

    // --- STEP 2: VERIFY OTP AND CREATE ACCOUNT ---
    if (email && otp) {
      const record = otpStore[email];
      if (!record) {
        return NextResponse.json({ error: "No OTP found for this email" }, { status: 400 });
      }
      if (Date.now() > record.expires) {
        delete otpStore[email];
        return NextResponse.json({ error: "OTP expired" }, { status: 400 });
      }
      if (record.otp !== otp) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }

      // Insert new verified user
      await sql`
        INSERT INTO users (username, email, password_hash)
        VALUES (${record.username}, ${email}, ${record.hashedPassword})
      `;

      // Cleanup OTP record
      delete otpStore[email];

      return NextResponse.json({ message: "Account created successfully" });
    }

    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  } catch (err: unknown) {
    console.error("❌ Signup Error:", err);
    return NextResponse.json({ error: (err as Error).message || "Server error" }, { status: 500 });
  }
}
