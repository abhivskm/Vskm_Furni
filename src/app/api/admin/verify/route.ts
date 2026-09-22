import { NextResponse } from "next/server";
import { isValidKey } from "@/lib/admin";

/** POST { key } -> { ok: true } if the secret key matches. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (isValidKey(body?.key)) return NextResponse.json({ ok: true });
  return NextResponse.json({ ok: false, error: "Invalid secret key" }, { status: 401 });
}
