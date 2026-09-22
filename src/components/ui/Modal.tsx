"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-5xl" };

export default function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  // Portal target is only available after mount (avoids SSR mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  // Rendered into <body>: a modal inside the sticky navbar (backdrop-blur) or a
  // transformed card would otherwise be positioned relative to that element and clipped.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      // React events bubble through the component tree even across the portal, so a click
      // in here would reach whatever opened the modal (e.g. a <Link>, which preventDefaults
      // and would block the form submit). Keep every interaction inside the modal.
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onSubmit={(e) => e.stopPropagation()}
    >
      <div className={`fade-in w-full ${sizes[size]} max-h-[92vh] overflow-y-auto rounded-2xl bg-cream shadow-2xl`}>
        {title && (
          <div className="flex items-center justify-between border-b border-sand-dark px-6 py-4">
            <h3 className="text-xl font-semibold text-wood-900">{title}</h3>
            <button onClick={onClose} className="rounded-full p-1 text-muted hover:bg-sand hover:text-ink" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
