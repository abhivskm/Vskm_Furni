"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useResource } from "@/lib/useResource";
import { api } from "@/lib/api";
import SectionForm from "@/components/admin/SectionForm";
import SectionGrid from "./SectionGrid";
import type { Section } from "@/lib/types";

/** All home-page sections in order, plus the admin's "Add section" control. */
export default function SectionsList() {
  const { isAdmin } = useAdmin();
  const { data: sections, loading, refresh } = useResource<Section[]>("/api/sections");
  const [editing, setEditing] = useState<Section | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const openForm = (s: Section | null) => {
    setEditing(s);
    setFormOpen(true);
  };

  const remove = async (s: Section) => {
    if (!confirm(`Delete the "${s.title || s.pluralLabel}" section and all of its cards? Products are kept.`)) return;
    await api(`/api/sections/${s._id}`, { method: "DELETE" });
    refresh();
  };

  // Swap `order` with the neighbour so the list re-sorts.
  const move = async (index: number, dir: -1 | 1) => {
    if (!sections) return;
    const a = sections[index];
    const b = sections[index + dir];
    if (!b) return;
    await Promise.all([
      api(`/api/sections/${a._id}`, { method: "PUT", body: JSON.stringify({ order: index + dir }) }),
      api(`/api/sections/${b._id}`, { method: "PUT", body: JSON.stringify({ order: index }) }),
    ]);
    refresh();
  };

  return (
    <div id="work">
      {loading && <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><div className="h-10 w-64 animate-pulse rounded bg-sand" /></div>}

      {sections?.map((s, i) => (
        <SectionGrid
          key={s._id}
          section={s}
          index={i}
          total={sections.length}
          onEdit={() => openForm(s)}
          onDelete={() => remove(s)}
          onMove={(dir) => move(i, dir)}
          onSectionChanged={refresh}
        />
      ))}

      {!loading && sections?.length === 0 && !isAdmin && null}

      {isAdmin && (
        <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <button onClick={() => openForm(null)} className="w-full rounded-2xl border-2 border-dashed border-amber/60 p-8 text-center font-semibold text-wood-700 transition hover:bg-amber/10">
            + Add a new section (e.g. Category, Space, Wood type, Style)
          </button>
        </div>
      )}

      {isAdmin && <SectionForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={refresh} section={editing} />}
    </div>
  );
}
