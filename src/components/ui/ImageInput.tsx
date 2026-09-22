"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/api";

interface ImageInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspect?: string;
}

/** Lets the admin either upload a file from their device or paste an image URL. */
export default function ImageInput({ value, onChange, label = "Image", aspect = "aspect-video" }: ImageInputProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <span className="label">{label}</span>
      <div
        className={`relative ${aspect} w-full overflow-hidden rounded-xl border-2 border-dashed border-sand-dark bg-white`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-sm text-muted">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
            <span>Drag & drop or choose a file</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm font-semibold text-wood-700">Uploading...</div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
          Upload file
        </button>
        {value && (
          <button type="button" className="btn-secondary" onClick={() => onChange("")}>
            Remove
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
      <input
        className="input mt-2"
        placeholder="...or paste an image URL (https://...)"
        value={value.startsWith("/api/images/") ? "" : value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
