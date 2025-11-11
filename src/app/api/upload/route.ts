import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image") as Blob;

  const imgbbForm = new FormData();
  imgbbForm.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
    method: "POST",
    body: imgbbForm,
  });

  const data = await res.json();
  return NextResponse.json(data);
}