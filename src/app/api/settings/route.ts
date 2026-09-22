import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { handleError, requireAdmin } from "@/lib/admin";
import { DEFAULT_CONTENT, flattenContent } from "@/lib/content";

const ALLOWED = [
  "name", "tagline", "about", "yearsExperience", "phone", "whatsapp", "email",
  "address", "instagram", "facebook", "workingHours", "profileImage",
] as const;

export async function GET() {
  try {
    await connectDB();
    // Create the single settings doc with defaults on first access.
    const settings = await Settings.findOneAndUpdate(
      { key: "site" },
      { $setOnInsert: { key: "site" } },
      { returnDocument: "after", upsert: true }
    ).lean();
    return NextResponse.json({ ...settings, content: flattenContent(settings?.content) });
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    await connectDB();
    const body = await req.json();
    const update: Record<string, string> = {};
    for (const k of ALLOWED) if (typeof body[k] === "string") update[k] = body[k];
    // Partial content updates use dotted paths so unrelated keys are left untouched.
    if (body.content && typeof body.content === "object") {
      for (const [k, v] of Object.entries(body.content)) {
        if (k in DEFAULT_CONTENT && typeof v === "string") update[`content.${k}`] = v;
      }
    }
    const settings = await Settings.findOneAndUpdate({ key: "site" }, { $set: update }, { returnDocument: "after", upsert: true }).lean();
    return NextResponse.json({ ...settings, content: flattenContent(settings?.content) });
  } catch (err) {
    return handleError(err);
  }
}
