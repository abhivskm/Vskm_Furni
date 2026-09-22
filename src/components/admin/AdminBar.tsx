"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import SettingsForm from "./SettingsForm";
import ContentForm from "./ContentForm";

/** Sticky strip shown only in admin mode so the admin always knows they're editing live. */
export default function AdminBar() {
  const { isAdmin, logout } = useAdmin();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  if (!isAdmin) return null;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-[90] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-full bg-wood-900 px-4 py-2 text-sm text-cream shadow-2xl ring-2 ring-amber">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber" />
          Admin mode
        </span>
        <span className="hidden text-cream/50 sm:inline">- click any text or image to edit</span>
        <button onClick={() => setSettingsOpen(true)} className="rounded-full bg-cream/15 px-3 py-1 text-xs font-semibold hover:bg-cream/25">
          Site info
        </button>
        <button onClick={() => setContentOpen(true)} className="rounded-full bg-cream/15 px-3 py-1 text-xs font-semibold hover:bg-cream/25">
          All text
        </button>
        <button onClick={logout} className="rounded-full bg-amber px-3 py-1 text-xs font-semibold text-wood-900 hover:bg-yellow-400">
          Exit admin
        </button>
      </div>
      <SettingsForm open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ContentForm open={contentOpen} onClose={() => setContentOpen(false)} />
    </>
  );
}
