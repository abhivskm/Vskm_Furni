"use client";

import Link from "next/link";
import { useState } from "react";
import { useSiteData } from "@/context/SiteDataContext";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import SearchBox from "@/components/SearchBox";
import { useResource } from "@/lib/useResource";
import type { Section } from "@/lib/types";

export default function Navbar() {
  const { settings, text } = useSiteData();
  const { data: sections } = useResource<Section[]>("/api/sections");
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: text("nav.home") },
    // One link per home-page section, e.g. "Categories", "Spaces"
    ...(sections ?? []).map((s) => ({ href: `/#${s.slug}`, label: s.pluralLabel })),
    { href: "/#about", label: text("nav.about") },
    { href: "/#contact", label: text("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-sand-dark/60 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">        
        <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
        <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-wood-700 text-cream">
          <EditableImage
            k="nav.logo"
            alt={settings.name}
            className="h-full w-full object-cover"
            compact
            placeholder={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
              </svg>
            }
          />
        </span>
        <EditableText k="name" className="font-serif text-lg font-semibold leading-tight text-wood-900 sm:text-xl" />
      </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-wood-700 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-amber">
              {l.label}
            </Link>
          ))}
          <SearchBox className="w-56 xl:w-64" />
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg p-2 text-wood-900 hover:bg-sand"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="fade-in border-t border-sand-dark/60 bg-cream lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            <SearchBox className="my-2" onNavigate={() => setMenuOpen(false)} />
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="border-b border-sand py-3 text-sm font-medium text-wood-900 last:border-0">
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
