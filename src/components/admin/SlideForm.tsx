"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import ImageInput from "@/components/ui/ImageInput";
import { api } from "@/lib/api";
import type { CarouselSlide } from "@/lib/types";

interface SlideFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  slide?: CarouselSlide | null;
}

const EMPTY = { image: "", title: "", subtitle: "" };

/** Add or edit a hero carousel slide. */
export default function SlideForm({ open, onClose, onSaved, slide }: SlideFormProps) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setForm(slide ? { image: slide.image, title: slide.title, subtitle: slide.subtitle } : EMPTY);
  }, [open, slide]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (slide) await api(`/api/carousel/${slide._id}`, { method: "PUT", body: JSON.stringify(form) });
      else await api("/api/carousel", { method: "POST", body: JSON.stringify(form) });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={slide ? "Edit slide" : "Add slide"}>
      <form onSubmit={submit} className="space-y-4">
        <ImageInput label="Slide image" value={form.image} onChange={(image) => setForm((f) => ({ ...f, image }))} aspect="aspect-[21/9]" />
        <div>
          <label className="label" htmlFor="slide-title">Heading</label>
          <input id="slide-title" className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Handcrafted in solid teak" />
        </div>
        <div>
          <label className="label" htmlFor="slide-subtitle">Sub-heading</label>
          <input id="slide-subtitle" className="input" value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Beds, wardrobes, sofas and more" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy || !form.image}>{busy ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
}
