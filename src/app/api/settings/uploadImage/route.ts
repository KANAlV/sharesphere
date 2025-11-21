import { NextResponse } from "next/server";
import { sql } from "@/lib/db"; // adjust path to your db lib

export async function POST(req: Request) {
  try {
    const { image, userId } = await req.json();
    if (!image || !userId)
      return NextResponse.json(
        { error: "No image or user ID provided" },
        { status: 400 }
      );

    // Send to ImgBB
    const form = new FormData();
    form.append("image", image.split(",")[1]); // remove "data:image/jpeg;base64,"

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: "POST",
        body: form,
      }
    );

    const data = await res.json();

    if (!data?.data?.url) {
      console.error("ImgBB upload failed:", data);
      return NextResponse.json(
        { error: "ImgBB upload failed" },
        { status: 500 }
      );
    }

    const imageUrl = data.data.url;

    // --- Store in database ---
    await sql`
      UPDATE userdata
      SET profile = ${imageUrl}
      WHERE id = ${userId}
    `;

    return NextResponse.json({ url: imageUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}