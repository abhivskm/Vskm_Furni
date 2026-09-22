"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import SecretKeyModal from "./SecretKeyModal";

/**
 * A small craft emblem in the footer's copyright row. It looks like decoration,
 * but clicking it opens the secret key popup. The admin knows where it is.
 */
export default function HiddenAdminButton() {
  const { isAdmin } = useAdmin();
  const [open, setOpen] = useState(false);

  if (isAdmin) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Admin"
        title=""
        className="group flex h-8 w-8 items-center justify-center rounded-full border border-cream/20 text-cream/50 transition hover:border-amber hover:text-amber"
      >
        {/* Crossed hammer + chisel: reads as a "handcrafted" emblem in the footer */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 6l4 4M3 21l8-8" />
          <path d="M9 7l3-3 6 6-3 3-6-6z" />
          <path d="M13 21l8-8" />
        </svg>
      </button>
      <SecretKeyModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
