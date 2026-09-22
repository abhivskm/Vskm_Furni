import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { handleError, requireAdmin } from "@/lib/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id).lean();
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    if (Array.isArray(body.images)) body.images = body.images.filter(Boolean);
    if (Array.isArray(body.groups)) {
      body.groups = body.groups.filter(Boolean);
      if (body.groups.length === 0) return NextResponse.json({ error: "Pick at least one section for this product" }, { status: 400 });
    }
    const product = await Product.findByIdAndUpdate(id, body, { returnDocument: "after" });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
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
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
