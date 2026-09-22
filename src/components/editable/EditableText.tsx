"use client";

import { useState, type ElementType } from "react";
import { useAdmin } from "@/context/AdminContext";
import { patchFor, useSiteData, type EditableKey } from "@/context/SiteDataContext";
import { MULTILINE_KEYS } from "@/lib/content";
import Modal from "@/components/ui/Modal";

type EditableTextProps = {
  as?: ElementType;
  className?: string;
  /** Force a textarea; long settings fields (about, address) get one automatically. */
  multiline?: boolean;
} & (
  | { k: EditableKey; value?: never; onSave?: never; label?: never }
  /** Text that lives elsewhere (e.g. a section heading): pass the value and how to save it. */
  | { k?: never; value: string; onSave: (value: string) => Promise<void>; label: string }
);

const LONG_FIELDS = new Set(["about", "address"]);

/**
 * Renders a piece of site copy. In admin mode it gets a dashed outline and a
 * click opens a small editor that saves straight to the settings document.
 */
export default function EditableText({ k, value: external, onSave, label, as: Tag = "span", className = "", multiline }: EditableTextProps) {
  const { isAdmin } = useAdmin();
  const { text, save } = useSiteData();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = k ? text(k) : external;
  const isLong = multiline ?? (k ? MULTILINE_KEYS.includes(k as never) || LONG_FIELDS.has(k) : false);

  if (!isAdmin) return <Tag className={className}>{value}</Tag>;

  const begin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraft(value);
    setError(null);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (k) await save(patchFor(k, draft));
      else await onSave(draft);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Tag
        className={`${className} editable`}
        onClick={begin}
        title="Click to edit"
        role="button"
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && begin(e as unknown as React.MouseEvent)}
      >
        {value || <span className="italic opacity-50">(empty)</span>}
      </Tag>
      <Modal open={open} onClose={() => setOpen(false)} title="Edit text" size="md">
        <form onSubmit={submit} className="space-y-4">
          <p className="text-xs text-muted">
            Field: <code className="rounded bg-sand px-1">{k ?? label}</code>
          </p>
          {isLong ? (
            <textarea className="input min-h-32" value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
          ) : (
            <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
