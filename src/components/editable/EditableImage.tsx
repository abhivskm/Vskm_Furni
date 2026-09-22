"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { patchFor, useSiteData, type EditableKey } from "@/context/SiteDataContext";
import Modal from "@/components/ui/Modal";
import ImageInput from "@/components/ui/ImageInput";

interface EditableImageProps {
  k: EditableKey;
  alt?: string;
  className?: string;
  /** Shown when no image is set. */
  placeholder?: React.ReactNode;
  /** Where to put the "Change image" chip. */
  chipPosition?: "top-right" | "bottom-right" | "center";
  /** For small images (logo, avatar): no chip; the image itself is outlined and clickable. */
  compact?: boolean;
}

const chipPos = { "top-right": "right-3 top-3", "bottom-right": "bottom-3 right-3", center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" };

/**
 * Renders an image from a settings/content key. In admin mode a "Change image"
 * chip overlays it; the chip opens the upload/URL picker and saves on confirm.
 */
export default function EditableImage({ k, alt = "", className = "", placeholder, chipPosition = "top-right", compact = false }: EditableImageProps) {
  const { isAdmin } = useAdmin();
  const { text, save } = useSiteData();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = text(k);
  const image = value ? <img src={value} alt={alt} className={className} /> : placeholder ?? null;

  if (!isAdmin) return <>{image}</>;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await save(patchFor(k, draft));
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const begin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraft(value);
    setOpen(true);
  };

  return (
    <>
      {compact ? (
        <span className="editable absolute inset-0 z-20 block" onClick={begin} title="Click to change image" role="button" />
      ) : null}
      {image}
      {!compact && (
        <button type="button" className={`admin-chip absolute z-20 ${chipPos[chipPosition]}`} onClick={begin}>
          {value ? "Change image" : "Add image"}
        </button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Edit image">
        <div className="space-y-4">
          <p className="text-xs text-muted">
            Field: <code className="rounded bg-sand px-1">{k}</code>
          </p>
          <ImageInput label="Image" value={draft} onChange={setDraft} aspect="aspect-[4/3]" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button type="button" className="btn-primary" disabled={busy} onClick={submit}>{busy ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
