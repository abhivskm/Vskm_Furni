import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import Section from "@/models/Section";
import { handleError, requireAdmin, slugify } from "@/lib/admin";

/** GET /api/groups?section=<id or slug>&slug=<groupSlug>  (both optional; no params = every card of every section) */
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section");
    const slug = searchParams.get("slug");
    const filter: Record<string, unknown> = {};
    if (section) {
      const sec = /^[a-f\d]{24}$/i.test(section) ? { _id: section } : await Section.findOne({ slug: section }).select("_id").lean();
      if (!sec) return NextResponse.json([]);
      filter.section = sec._id;
    }
    if (slug) filter.slug = slug;
    const groups = await Group.find(filter).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json(groups);
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
    if (!body.name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!body.section) return NextResponse.json({ error: "Section is required" }, { status: 400 });

    // Slug only needs to be unique within its section (/category/sofa vs /space/sofa is fine).
    const base = slugify(body.name) || "item";
    let slug = base;
    let i = 2;
    while (await Group.exists({ section: body.section, slug })) slug = `${base}-${i++}`;

    const count = await Group.countDocuments({ section: body.section });
    const group = await Group.create({
      section: body.section,
      name: body.name.trim(),
      slug,
      description: body.description ?? "",
      image: body.image ?? "",
      order: body.order ?? count,
    });
    return NextResponse.json(group, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
