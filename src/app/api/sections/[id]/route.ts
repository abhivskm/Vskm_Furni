import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Section from "@/models/Section";
import Group from "@/models/Group";
import Product from "@/models/Product";
import { handleError, requireAdmin } from "@/lib/admin";

type Ctx = { params: Promise<{ id: string }> };

/** GET by id OR slug. */
export async function GET(_req: Request, { params }: Ctx) {
  try {
    await connectDB();
    const { id } = await params;
    const query = /^[a-f\d]{24}$/i.test(id) ? { _id: id } : { slug: id };
    const section = await Section.findOne(query).lean();
    if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(section);
  } catch (err) {
    return handleError(err);
  }
}

/** Slug stays fixed so links keep working; everything else is editable. */
export async function PUT(req: Request, { params }: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const update: Record<string, unknown> = {};
    for (const k of ["label", "pluralLabel", "title", "eyebrow", "cardCta"] as const) {
      if (typeof body[k] === "string") update[k] = body[k];
    }
    if (typeof body.order === "number") update.order = body.order;
    const section = await Section.findByIdAndUpdate(id, update, { returnDocument: "after" });
    if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(section);
  } catch (err) {
    return handleError(err);
  }
}

/** Deleting a section removes its cards and untags them from products (products themselves are kept). */
export async function DELETE(req: Request, { params }: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    await connectDB();
    const { id } = await params;
    const groupIds = (await Group.find({ section: id }).select("_id").lean()).map((g) => g._id);
    await Product.updateMany({ groups: { $in: groupIds } }, { $pull: { groups: { $in: groupIds } } });
    await Group.deleteMany({ section: id });
    await Section.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
