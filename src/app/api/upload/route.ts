import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Image from "@/models/Image";
import { handleError, requireAdmin } from "@/lib/admin";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

/** POST multipart/form-data { file } -> { url } */
export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });

    await connectDB();
    const buffer = Buffer.from(await file.arrayBuffer());
    const image = await Image.create({ data: buffer, contentType: file.type, filename: file.name, size: file.size });
    return NextResponse.json({ url: `/api/images/${image._id}` }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
