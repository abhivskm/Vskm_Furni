"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useSiteData } from "@/context/SiteDataContext";
import { useResource } from "@/lib/useResource";
import { api } from "@/lib/api";
import GroupForm from "@/components/admin/GroupForm";
import EditableText from "@/components/editable/EditableText";
import type { Group, Section } from "@/lib/types";

interface SectionGridProps {
  section: Section;
  index: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onSectionChanged: () => void;
}

/** One home-page section: its heading plus a row of cards. Admin can edit the text inline and manage cards. */
export default function SectionGrid({ section, index, total, onEdit, onDelete, onMove, onSectionChanged }: SectionGridProps) {
  const { isAdmin } = useAdmin();
  const { text } = useSiteData();
  const { data: groups, loading, error, refresh } = useResource<Group[]>(`/api/groups?section=${section._id}`);
  const [editing, setEditing] = useState<Group | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const noun = section.label.toLowerCase();

  const openForm = (g: Group | null) => {
    setEditing(g);
    setFormOpen(true);
  };

  const remove = async (g: Group) => {
    if (!confirm(`Delete "${g.name}"? Its products stay, they just won't be listed under it.`)) return;
    await api(`/api/groups/${g._id}`, { method: "DELETE" });
    refresh();
  };

  /** Saves one field of the section (used by the inline heading editors). */
  const saveField = (field: "title" | "eyebrow") => async (value: string) => {
    await api(`/api/sections/${section._id}`, { method: "PUT", body: JSON.stringify({ [field]: value }) });
    onSectionChanged();
  };

  return (
    <section id={section.slug} className={`relative scroll-mt-20 ${index % 2 === 1 ? "bg-white/60" : ""}`}>
      {isAdmin && (
        <div className="admin-controls">
          <button className="admin-chip" onClick={() => onMove(-1)} disabled={index === 0} title="Move up">↑</button>
          <button className="admin-chip" onClick={() => onMove(1)} disabled={index === total - 1} title="Move down">↓</button>
          <button className="admin-chip" onClick={onEdit}>Edit section</button>
          <button className="admin-chip text-red-600" onClick={onDelete}>Delete section</button>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <EditableText value={section.eyebrow} onSave={saveField("eyebrow")} label={`${section.label} · small text`} as="p" className="text-xs font-semibold uppercase tracking-[0.2em] text-wood-500" />
            <EditableText value={section.title} onSave={saveField("title")} label={`${section.label} · heading`} as="h2" className="mt-2 block text-3xl font-semibold text-wood-900 sm:text-4xl" />
          </div>
          {isAdmin && <button className="btn-admin" onClick={() => openForm(null)}>+ Add {noun}</button>}
        </div>

        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <span>Could not load: {error}</span>
            <button className="btn-secondary py-1" onClick={refresh}>Retry</button>
          </div>
        )}

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-sand" />)}
          </div>
        )}

        {!loading && groups?.length === 0 && (
          <p className="rounded-2xl border border-dashed border-sand-dark p-10 text-center text-muted">
            <EditableText k="sections.empty" />
            {isAdmin && ` Use “Add ${noun}” to create the first one.`}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups?.map((g) => (
            <div key={g._id} className="group relative">
              <Link href={`/${section.slug}/${g.slug}`} className="block overflow-hidden rounded-2xl bg-sand shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-[4/3] overflow-hidden">
                  {g.image ? (
                    <img src={g.image} alt={g.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="wood-texture flex h-full items-center justify-center text-cream/40">No image</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-wood-900">{g.name}</h3>
                  {g.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{g.description}</p>}
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-wood-500">
                    {section.cardCta || text("sections.allPrefix")}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                  </span>
                </div>
              </Link>
              {isAdmin && (
                <div className="admin-controls">
                  <button className="admin-chip" onClick={() => openForm(g)}>Edit</button>
                  <button className="admin-chip text-red-600" onClick={() => remove(g)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isAdmin && <GroupForm section={section} open={formOpen} onClose={() => setFormOpen(false)} onSaved={refresh} group={editing} />}
    </section>
  );
}
