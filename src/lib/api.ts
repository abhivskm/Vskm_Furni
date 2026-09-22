"use client";

import { ADMIN_HEADER } from "./admin";

export const ADMIN_KEY_STORAGE = "fp_admin_key";

export function getStoredKey() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ADMIN_KEY_STORAGE);
  } catch {
    return null;
  }
}

/** fetch wrapper that attaches the admin key (when present) and unwraps JSON / errors. */
export async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const key = getStoredKey();
  if (key) headers.set(ADMIN_HEADER, key);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...options, headers, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { url } = await api<{ url: string }>("/api/upload", { method: "POST", body: form });
  return url;
}
