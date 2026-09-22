"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { api } from "@/lib/api";
import type { Section } from "@/lib/types";

interface SectionFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  section?: Section | null;
}

const EMPTY = { label: "", pluralLabel: "", title: "", eyebrow: "", cardCta: "View collection" };

/** Create or edit a home-page section ("Browse by category", "Browse by space", ...). */
export default function SectionForm({ open, onClose, onSaved, section }: SectionFormProps) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setForm(section ? { label: section.label, pluralLabel: section.pluralLabel, title: section.title, eyebrow: section.eyebrow, cardCta: section.cardCta } : EMPTY);
  }, [open, section]);

  const set = (key: keyof typeof EMPTY, value: string) => setForm((f) => ({ ...f, [key]: value }));

  // Auto-suggest the plural and heading while typing a new section's label.
  const setLabel = (label: string) =>
    setForm((f) => ({
      ...f,
      label,
      pluralLabel: section || (f.pluralLabel && f.pluralLabel !== `${f.label}s`) ? f.pluralLabel : label ? `${label}s` : "",
      title: section || (f.title && f.title !== `Browse by ${f.label.toLowerCase()}`) ? f.title : label ? `Browse by ${label.toLowerCase()}` : "",
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (section) await api(`/api/sections/${section._id}`, { method: "PUT", body: JSON.stringify(form) });
      else await api("/api/sections", { method: "POST", body: JSON.stringify(form) });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={section ? "Edit section" : "Add section"}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted">
          A section is one way of grouping your products, shown as a row of cards on the home page. Examples: Category (Sofa, Bed), Space (Hall, Kitchen), Wood (Teak, Sheesham).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="section-label">Name of one item</label>
            <input id="section-label" className="input" value={form.label} onChange={(e) => setLabel(e.target.value)} placeholder="Category" required />
          </div>
          <div>
            <label className="label" htmlFor="section-plural">Name of many</label>
            <input id="section-plural" className="input" value={form.pluralLabel} onChange={(e) => set("pluralLabel", e.target.value)} placeholder="Categories" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="section-title">Section heading</label>
          <input id="section-title" className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Browse by category" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="section-eyebrow">Small text above heading</label>
            <input id="section-eyebrow" className="input" value={form.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} placeholder="Our work" />
          </div>
          <div>
            <label className="label" htmlFor="section-cta">Link text on each card</label>
            <input id="section-cta" className="input" value={form.cardCta} onChange={(e) => set("cardCta", e.target.value)} placeholder="View collection" />
          </div>
        </div>
        {section && <p className="text-xs text-muted">Web address stays <code className="rounded bg-sand px-1">/{section.slug}/...</code> so shared links keep working.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy || !form.label.trim()}>{busy ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
}
