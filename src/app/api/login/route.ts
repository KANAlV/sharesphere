import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { usernameEmail, password } = await req.json();

    if (!usernameEmail || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

  
    const users = await sql`
      SELECT * FROM users 
      WHERE email = ${usernameEmail} OR username = ${usernameEmail}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "User does not exist" }, { status: 400 });
    }

    const user = users[0];

    
    if (!user.password_hash) {
      return NextResponse.json(
        { error: "This account uses Google Sign-In. Please log in with Google." },
        { status: 400 }
      );
    }

   
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, udata: "0" },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    
    const res = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        udata: "0",
      },
    }, { status: 200 });

    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return res;

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}