import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ error: "No image file" }, { status: 400 });
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    // Convert incoming file → Base64
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // MUST use FormData for Imgbb
    const uploadForm = new FormData();
    uploadForm.append("key", apiKey);
    uploadForm.append("image", base64);

    const uploadRes = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: uploadForm,
    });

    const json = await uploadRes.json();

    if (!json.success) {
      console.error("IMGBB FAILED:", json);
      return NextResponse.json({ error: "Upload failed", json }, { status: 500 });
    }

    return NextResponse.json({
      url: json.data.url,
      display_url: json.data.display_url,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}