import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Section from "@/models/Section";
import { handleError, requireAdmin, slugify } from "@/lib/admin";

const RESERVED = new Set(["api", "admin", "_next"]);

export async function GET() {
  try {
    await connectDB();
    const sections = await Section.find().sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json(sections);
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
    const label = String(body.label ?? "").trim();
    if (!label) return NextResponse.json({ error: "Label is required" }, { status: 400 });
    const pluralLabel = String(body.pluralLabel ?? "").trim() || `${label}s`;

    // Slug becomes the first URL segment (/category/sofa), so keep it unique and safe.
    const base = slugify(label) || "section";
    let slug = RESERVED.has(base) ? `${base}-1` : base;
    let i = 2;
    while (await Section.exists({ slug })) slug = `${base}-${i++}`;

    const count = await Section.countDocuments();
    const section = await Section.create({
      slug,
      label,
      pluralLabel,
      title: body.title ?? `Browse by ${label.toLowerCase()}`,
      eyebrow: body.eyebrow ?? "",
      cardCta: body.cardCta ?? "View collection",
      order: body.order ?? count,
    });
    return NextResponse.json(section, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
