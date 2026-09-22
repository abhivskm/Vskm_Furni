import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Image from "@/models/Image";

type Ctx = { params: Promise<{ id: string }> };

/** Streams an uploaded image out of MongoDB. */
export async function GET(_req: Request, { params }: Ctx) {
  try {
    await connectDB();
    const { id } = await params;
    const image = await Image.findById(id).lean();
    if (!image) return new NextResponse("Not found", { status: 404 });

    const rawData = image.data as unknown;
    const imageBuffer = Buffer.isBuffer(rawData)
      ? rawData
      : Buffer.from((rawData as { buffer: Uint8Array }).buffer);

    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        "Content-Type": image.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Error", { status: 500 });
  }
}