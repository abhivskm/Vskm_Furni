"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import ImageInput from "@/components/ui/ImageInput";
import { api } from "@/lib/api";
import { useResource } from "@/lib/useResource";
import type { Group, Product, Section } from "@/lib/types";

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Pre-selected when adding from a card's page. */
  defaultGroupId?: string;
  product?: Product | null;
}

const EMPTY = { title: "", description: "", images: [""] as string[], material: "", dimensions: "", year: "", price: "" };

/** Add or edit a product. It gets one dropdown per section so it can be tagged e.g. Category: Sofa + Space: Hall. */
export default function ProductForm({ open, onClose, onSaved, defaultGroupId, product }: ProductFormProps) {
  const { data: sections } = useResource<Section[]>(open ? "/api/sections" : null);
  const { data: groups } = useResource<Group[]>(open ? "/api/groups" : null);
  const [form, setForm] = useState(EMPTY);
  /** sectionId -> chosen groupId ("" = none) */
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupsBySection = useMemo(() => {
    const map: Record<string, Group[]> = {};
    for (const g of groups ?? []) (map[g.section] ??= []).push(g);
    return map;
  }, [groups]);

  useEffect(() => {
    if (!open) return;
    setForm(
      product
        ? {
            title: product.title,
            description: product.description,
            images: product.images.length ? product.images : [""],
            material: product.material,
            dimensions: product.dimensions,
            year: product.year,
            price: product.price,
          }
        : EMPTY
    );
  }, [open, product]);

  // Once groups are known, map the product's group ids (or the page default) onto their sections.
  useEffect(() => {
    if (!open || !groups) return;
    const ids = product ? product.groups : defaultGroupId ? [defaultGroupId] : [];
    const next: Record<string, string> = {};
    for (const id of ids) {
      const g = groups.find((x) => x._id === id);
      if (g) next[g.section] = g._id;
    }
    setPicked(next);
  }, [open, groups, product, defaultGroupId]);

  const setImage = (i: number, url: string) =>
    setForm((f) => ({ ...f, images: f.images.map((img, idx) => (idx === i ? url : img)) }));
  const removeImage = (i: number) =>
    setForm((f) => ({ ...f, images: f.images.length > 1 ? f.images.filter((_, idx) => idx !== i) : [""] }));

  const chosenGroups = Object.values(picked).filter(Boolean);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { ...form, groups: chosenGroups, images: form.images.filter(Boolean) };
      if (product) await api(`/api/products/${product._id}`, { method: "PUT", body: JSON.stringify(body) });
      else await api("/api/products", { method: "POST", body: JSON.stringify(body) });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const text = (key: keyof typeof EMPTY, label: string, placeholder = "") => (
    <div>
      <label className="label" htmlFor={`product-${key}`}>{label}</label>
      <input id={`product-${key}`} className="input" value={form[key] as string} placeholder={placeholder} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={product ? "Edit product" : "Add product"} size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-3">
          {form.images.map((img, i) => (
            <div key={i} className="relative">
              <ImageInput label={i === 0 ? "Photos (first one is the cover)" : `Photo ${i + 1}`} value={img} onChange={(url) => setImage(i, url)} aspect="aspect-[4/3]" />
              {form.images.length > 1 && (
                <button type="button" className="absolute right-0 top-0 text-xs font-semibold text-red-600 hover:underline" onClick={() => removeImage(i)}>
                  Remove photo
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={() => setForm((f) => ({ ...f, images: [...f.images, ""] }))}>
            + Add another photo
          </button>
        </div>

        {text("title", "Title", "Teak king-size bed")}

        <fieldset className="rounded-xl border border-sand-dark p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">Where it appears</legend>
          {sections?.length === 0 && <p className="text-sm text-muted">Create a section on the home page first.</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            {sections?.map((s) => (
              <div key={s._id}>
                <label className="label" htmlFor={`product-section-${s._id}`}>{s.label}</label>
                <select
                  id={`product-section-${s._id}`}
                  className="input"
                  value={picked[s._id] ?? ""}
                  onChange={(e) => setPicked((p) => ({ ...p, [s._id]: e.target.value }))}
                >
                  <option value="">Not in this section</option>
                  {(groupsBySection[s._id] ?? []).map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
              </div>
            ))}
          </div>
          {chosenGroups.length === 0 && sections && sections.length > 0 && (
            <p className="mt-2 text-xs text-red-600">Pick at least one, or the product won&apos;t show anywhere.</p>
          )}
        </fieldset>

        <div>
          <label className="label" htmlFor="product-description">Description</label>
          <textarea id="product-description" className="input min-h-24" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("material", "Material", "Solid teak")}
          {text("dimensions", "Dimensions", "6ft x 6ft")}
          {text("year", "Year made", "2024")}
          {text("price", "Price (optional)", "On request")}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy || !form.title.trim() || chosenGroups.length === 0}>{busy ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
}
