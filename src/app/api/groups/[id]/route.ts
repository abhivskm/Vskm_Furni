import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import Product from "@/models/Product";
import { handleError, requireAdmin } from "@/lib/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await connectDB();
    const { id } = await params;
    const group = await Group.findById(id).lean();
    if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(group);
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
    const { name, description, image, order } = await req.json();
    const group = await Group.findByIdAndUpdate(
      id,
      { ...(name !== undefined && { name }), ...(description !== undefined && { description }), ...(image !== undefined && { image }), ...(order !== undefined && { order }) },
      { returnDocument: "after" }
    );
    if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(group);
  } catch (err) {
    return handleError(err);
  }
}

/** Deleting a card untags it from products; the products stay. */
export async function DELETE(req: Request, { params }: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    await connectDB();
    const { id } = await params;
    await Product.updateMany({ groups: id }, { $pull: { groups: id } });
    await Group.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
