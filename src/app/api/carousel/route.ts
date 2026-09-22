import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Carousel from "@/models/Carousel";
import { handleError, requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    await connectDB();
    const slides = await Carousel.find().sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json(slides);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();
    if (!body.image) return NextResponse.json({ error: "Image is required" }, { status: 400 });
    const count = await Carousel.countDocuments();
    const slide = await Carousel.create({
      image: body.image,
      title: body.title ?? "",
      subtitle: body.subtitle ?? "",
      order: body.order ?? count,
    });
    return NextResponse.json(slide, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
