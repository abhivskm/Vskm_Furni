import { NextResponse } from "next/server";

export const ADMIN_HEADER = "x-admin-key";

export function getSecretKey() {
  return process.env.ADMIN_SECRET_KEY || "shrivishwakarmafurniture";
}

export function isValidKey(key: string | null | undefined) {
  return typeof key === "string" && key.length > 0 && key === getSecretKey();
}

/** Returns a 401 response if the request does not carry a valid admin key, otherwise null. */
export function requireAdmin(req: Request) {
  if (!isValidKey(req.headers.get(ADMIN_HEADER))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function handleError(err: unknown) {
  console.error(err);
  const message = err instanceof Error ? err.message : "Something went wrong";
  return NextResponse.json({ error: message }, { status: 500 });
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
