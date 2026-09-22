"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import ImageInput from "@/components/ui/ImageInput";
import { api } from "@/lib/api";
import type { Group, Section } from "@/lib/types";

interface GroupFormProps {
  section: Section;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  group?: Group | null;
}

const EMPTY = { name: "", description: "", image: "" };

/** Add or edit a card inside a section (e.g. "Sofa" under Category, "Hall" under Space). */
export default function GroupForm({ section, open, onClose, onSaved, group }: GroupFormProps) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setForm(group ? { name: group.name, description: group.description, image: group.image } : EMPTY);
  }, [open, group]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (group) await api(`/api/groups/${group._id}`, { method: "PUT", body: JSON.stringify(form) });
      else await api("/api/groups", { method: "POST", body: JSON.stringify({ ...form, section: section._id }) });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const noun = section.label.toLowerCase();

  return (
    <Modal open={open} onClose={onClose} title={group ? `Edit ${noun}` : `Add ${noun}`}>
      <form onSubmit={submit} className="space-y-4">
        <ImageInput label="Cover image" value={form.image} onChange={(image) => setForm((f) => ({ ...f, image }))} aspect="aspect-[4/3]" />
        <div>
          <label className="label" htmlFor="group-name">Name</label>
          <input id="group-name" className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label" htmlFor="group-description">Description</label>
          <textarea id="group-description" className="input min-h-20" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy || !form.name.trim()}>{busy ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
}
