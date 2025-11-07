import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { adminName, password } = await req.json();

    if (!adminName || !password) {
      return NextResponse.json(
        { success: false, message: "Missing credentials" },
        { status: 400 }
      );
    }

    console.log("🔍 Checking admin:", adminName);

    // Fetch admin data
    const admin = await sql`
      SELECT 
        "adminID" AS id, 
        "adminName" AS name, 
        password_hash 
      FROM admins 
      WHERE "adminName" = ${adminName}
    `;

    if (admin.length === 0) {
      console.log("❌ Admin not found");
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, admin[0].password_hash);

    if (!isPasswordValid) {
      console.log("❌ Invalid password");
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    console.log("✅ Login successful:", admin[0].name);

    return NextResponse.json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin[0].id,
        name: admin[0].name,
      },
    });
  } catch (error) {
    console.error("🔥 Server error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
