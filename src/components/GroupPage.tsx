"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useSiteData } from "@/context/SiteDataContext";
import { useResource } from "@/lib/useResource";
import { api } from "@/lib/api";
import GroupForm from "@/components/admin/GroupForm";
import ProductForm from "@/components/admin/ProductForm";
import ProductModal from "@/components/ProductModal";
import EditableText from "@/components/editable/EditableText";
import type { Group, Product, Section } from "@/lib/types";

/** Lists the products tagged with one card, e.g. /category/sofa or /space/hall. */
export default function GroupPage({ sectionSlug, groupSlug }: { sectionSlug: string; groupSlug: string }) {
  const { isAdmin } = useAdmin();
  const { text } = useSiteData();
  const { data: section, error: sectionError } = useResource<Section>(`/api/sections/${sectionSlug}`);
  const { data: groupList, loading: groupLoading, refresh: refreshGroup } = useResource<Group[]>(
    section ? `/api/groups?section=${section._id}&slug=${encodeURIComponent(groupSlug)}` : null
  );
  const group = groupList?.[0] ?? null;
  const { data: products, loading, refresh } = useResource<Product[]>(group ? `/api/products?group=${group._id}` : null);

  const [viewing, setViewing] = useState<Product | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [groupFormOpen, setGroupFormOpen] = useState(false);

  const openProductForm = (p: Product | null) => {
    setEditing(p);
    setProductFormOpen(true);
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    await api(`/api/products/${p._id}`, { method: "DELETE" });
    refresh();
  };

  const notFound = sectionError || (!groupLoading && groupList && !group);
  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold text-wood-900">Page not found</h1>
        <p className="mt-3 text-muted">This link may have been removed.</p>
        <Link href="/" className="btn-primary mt-6">Back to home</Link>
      </div>
    );
  }

  const busy = groupLoading || loading || !section;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link href={`/#${section?.slug ?? ""}`} className="inline-flex items-center gap-1 text-sm font-medium text-wood-500 hover:text-amber">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m6 6-6-6 6-6" /></svg>
        {text("sections.allPrefix")} {section?.pluralLabel.toLowerCase() ?? ""}
      </Link>

      <div className="relative mt-4 overflow-hidden rounded-3xl bg-wood-900 text-cream">
        {group?.image && <img src={group.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />}
        <div className="relative px-6 py-14 sm:px-10">
          {!group ? (
            <div className="h-10 w-48 animate-pulse rounded bg-cream/20" />
          ) : (
            <>
              {section && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber">{section.label}</p>}
              <h1 className="text-4xl font-semibold sm:text-5xl">{group.name}</h1>
              {group.description && <p className="mt-3 max-w-2xl text-cream/80">{group.description}</p>}
            </>
          )}
        </div>
        {isAdmin && group && section && (
          <div className="admin-controls">
            <button className="admin-chip" onClick={() => setGroupFormOpen(true)}>Edit {section.label.toLowerCase()}</button>
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <p className="text-sm text-muted">{products ? `${products.length} piece${products.length === 1 ? "" : "s"}` : ""}</p>
        {isAdmin && group && <button className="btn-admin" onClick={() => openProductForm(null)}>+ Add product</button>}
      </div>

      {busy && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-sand" />)}
        </div>
      )}

      {!busy && products?.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-sand-dark p-10 text-center text-muted">
          <EditableText k="sections.noProducts" />
          {isAdmin && " Use “Add product” to upload your first piece."}
        </p>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((p) => (
          <div key={p._id} className="group relative">
            <button onClick={() => setViewing(p)} className="block w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="aspect-[4/3] overflow-hidden bg-sand">
                {p.images[0] ? (
                  <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted">No photo</div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-wood-900">{p.title}</h3>
                <p className="mt-1 text-sm text-muted">{[p.material, p.dimensions, p.year].filter(Boolean).join(" · ")}</p>
                {p.price && <p className="mt-2 text-sm font-semibold text-wood-700">{p.price}</p>}
              </div>
            </button>
            {isAdmin && (
              <div className="admin-controls">
                <button className="admin-chip" onClick={() => openProductForm(p)}>Edit</button>
                <button className="admin-chip text-red-600" onClick={() => remove(p)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <ProductModal product={viewing} onClose={() => setViewing(null)} />

      {isAdmin && group && section && (
        <>
          <ProductForm open={productFormOpen} onClose={() => setProductFormOpen(false)} onSaved={refresh} defaultGroupId={group._id} product={editing} />
          <GroupForm section={section} open={groupFormOpen} onClose={() => setGroupFormOpen(false)} onSaved={refreshGroup} group={group} />
        </>
      )}
    </div>
  );
}
