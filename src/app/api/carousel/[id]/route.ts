import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Carousel from "@/models/Carousel";
import { handleError, requireAdmin } from "@/lib/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const slide = await Carousel.findByIdAndUpdate(id, body, { returnDocument: "after" });
    if (!slide) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(slide);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    await connectDB();
    const { id } = await params;
    await Carousel.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
