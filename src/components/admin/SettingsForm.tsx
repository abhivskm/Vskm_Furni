"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import ImageInput from "@/components/ui/ImageInput";
import { useSiteData } from "@/context/SiteDataContext";
import type { SiteSettings } from "@/lib/types";

type Field = Exclude<keyof SiteSettings, "content">;
type FormState = Record<Field, string>;

const FIELDS: { key: Field; label: string; textarea?: boolean; placeholder?: string }[] = [
  { key: "name", label: "Business name" },
  { key: "tagline", label: "Tagline" },
  { key: "yearsExperience", label: "Years of experience", placeholder: "15+" },
  { key: "about", label: "About", textarea: true },
  { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
  { key: "whatsapp", label: "WhatsApp number", placeholder: "919876543210" },
  { key: "email", label: "Email" },
  { key: "address", label: "Workshop address", textarea: true },
  { key: "workingHours", label: "Working hours", placeholder: "Mon-Sat, 9am - 7pm" },
  { key: "instagram", label: "Instagram URL" },
  { key: "facebook", label: "Facebook URL" },
];

/** Edits the single site-wide settings document (name, about, contact details). */
export default function SettingsForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, save } = useSiteData();
  const [form, setForm] = useState<FormState>(settings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setForm(settings);
  }, [open, settings]);

  const set = (key: Field, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await save(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Site details" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <ImageInput label="Profile / workshop photo" value={form.profileImage} onChange={(v) => set("profileImage", v)} aspect="aspect-[4/3]" />
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map(({ key, label, textarea, placeholder }) => (
            <div key={key} className={textarea ? "sm:col-span-2" : undefined}>
              <label className="label" htmlFor={`settings-${key}`}>{label}</label>
              {textarea ? (
                <textarea id={`settings-${key}`} className="input min-h-24" value={form[key]} placeholder={placeholder} onChange={(e) => set(key, e.target.value)} />
              ) : (
                <input id={`settings-${key}`} className="input" value={form[key]} placeholder={placeholder} onChange={(e) => set(key, e.target.value)} />
              )}
            </div>
          ))}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
}
