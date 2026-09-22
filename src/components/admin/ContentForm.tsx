"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import ImageInput from "@/components/ui/ImageInput";
import { useSiteData } from "@/context/SiteDataContext";
import { CONTENT_GROUPS, DEFAULT_CONTENT, IMAGE_KEYS, MULTILINE_KEYS, labelFor, type ContentKey, type ContentMap } from "@/lib/content";

/** One place to edit every piece of page copy / decorative image at once. */
export default function ContentForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, save } = useSiteData();
  const [form, setForm] = useState<ContentMap>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setForm({ ...DEFAULT_CONTENT, ...settings.content });
  }, [open, settings.content]);

  const set = (k: ContentKey, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await save({ content: form });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="All page text & images" size="lg">
      <form onSubmit={submit} className="space-y-8">
        <p className="text-sm text-muted">Tip: you can also click any text or image directly on the page while in admin mode.</p>
        {CONTENT_GROUPS.map((g) => (
          <fieldset key={g.title} className="space-y-3">
            <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-wood-700">{g.title}</legend>
            {g.keys.map((k) =>
              IMAGE_KEYS.includes(k) ? (
                <ImageInput key={k} label={labelFor(k)} value={form[k] ?? ""} onChange={(v) => set(k, v)} aspect="aspect-[3/1]" />
              ) : (
                <div key={k}>
                  <label className="label" htmlFor={`content-${k}`}>{labelFor(k)}</label>
                  {MULTILINE_KEYS.includes(k) ? (
                    <textarea id={`content-${k}`} className="input min-h-20" value={form[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
                  ) : (
                    <input id={`content-${k}`} className="input" value={form[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
                  )}
                </div>
              )
            )}
          </fieldset>
        ))}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-sand-dark bg-cream pt-4">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Saving..." : "Save all"}</button>
        </div>
      </form>
    </Modal>
  );
}
