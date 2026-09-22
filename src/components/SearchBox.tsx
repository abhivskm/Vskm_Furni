"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSiteData } from "@/context/SiteDataContext";
import { useResource } from "@/lib/useResource";
import type { Group, Section } from "@/lib/types";

interface Hit {
  section: Section;
  item: Group;
}

const norm = (s: string) => s.toLowerCase().trim();

/** Navbar search: matches every card (across all sections) by name / description and links to its page. */
export default function SearchBox({ onNavigate, className = "" }: { onNavigate?: () => void; className?: string }) {
  const { text } = useSiteData();
  const router = useRouter();
  const { data: sections } = useResource<Section[]>("/api/sections");
  const { data: groups } = useResource<Group[]>("/api/groups");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const hits = useMemo<Hit[]>(() => {
    const q = norm(query);
    if (!q) return [];
    const bySection = new Map((sections ?? []).map((s) => [s._id, s]));
    return (groups ?? [])
      .filter((g) => norm(g.name).includes(q) || norm(g.description).includes(q))
      .map((item) => ({ section: bySection.get(item.section), item }))
      .filter((h): h is Hit => Boolean(h.section))
      .slice(0, 8);
  }, [query, sections, groups]);

  // Close when clicking anywhere outside the box.
  useEffect(() => {
    const onDown = (e: MouseEvent) => !boxRef.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (hit: Hit) => {
    setQuery("");
    setOpen(false);
    onNavigate?.();
    router.push(`/${hit.section.slug}/${hit.item.slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      go(hits[active]);
    }
  };

  const showList = open && query.trim().length > 0;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 rounded-full border border-sand-dark bg-white px-3 py-1.5 text-sm focus-within:border-wood-500 focus-within:ring-2 focus-within:ring-wood-500/20">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-muted">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={text("nav.searchPlaceholder")}
          aria-label="Search"
          className="w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-muted/70"
        />
      </div>

      {showList && (
        <div className="fade-in absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-sand-dark bg-cream shadow-xl">
          {hits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">{text("nav.searchEmpty")}</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {hits.map((h, i) => (
                <li key={h.item._id}>
                  <Link
                    href={`/${h.section.slug}/${h.item.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(h);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm ${i === active ? "bg-sand" : ""}`}
                  >
                    <span className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-sand-dark">
                      {h.item.image && <img src={h.item.image} alt="" className="h-full w-full object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-wood-900">{h.item.name}</span>
                      {h.item.description && <span className="block truncate text-xs text-muted">{h.item.description}</span>}
                    </span>
                    <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-wood-500">
                      {h.section.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
