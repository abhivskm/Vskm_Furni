import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { handleError, requireAdmin } from "@/lib/admin";

/** GET /api/products?group=<groupId>  (optional; no param = all products) */
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const group = searchParams.get("group");
    const filter = group ? { groups: group } : {};
    const products = await Product.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json(products);
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
    if (!body.title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    const groups = Array.isArray(body.groups) ? body.groups.filter(Boolean) : [];
    if (groups.length === 0) return NextResponse.json({ error: "Pick at least one section for this product" }, { status: 400 });
    const product = await Product.create({
      groups,
      title: body.title.trim(),
      description: body.description ?? "",
      images: Array.isArray(body.images) ? body.images.filter(Boolean) : [],
      material: body.material ?? "",
      dimensions: body.dimensions ?? "",
      year: body.year ?? "",
      price: body.price ?? "",
      order: body.order ?? 0,
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
