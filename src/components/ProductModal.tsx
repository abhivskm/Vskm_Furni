"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { useSiteData } from "@/context/SiteDataContext";
import type { Product } from "@/lib/types";

/** Full-size view of a product with an image gallery and a WhatsApp enquiry link. */
export default function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { settings, text } = useSiteData();
  const [active, setActive] = useState(0);

  useEffect(() => setActive(0), [product]);

  if (!product) return null;

  const specs = [
    ["Material", product.material],
    ["Dimensions", product.dimensions],
    ["Year", product.year],
    ["Price", product.price],
  ].filter(([, v]) => v);

  const enquiry = settings.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in "${product.title}".`)}`
    : null;

  return (
    <Modal open onClose={onClose} title={product.title} size="xl">
      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-sand">
            {product.images[active] && <img src={product.images[active]} alt={product.title} className="h-full w-full object-contain" />}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? "border-amber" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          {product.description && <p className="whitespace-pre-line leading-relaxed text-ink/80">{product.description}</p>}
          {specs.length > 0 && (
            <dl className="mt-5 divide-y divide-sand-dark border-y border-sand-dark text-sm">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-medium text-wood-900">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {enquiry && (
            <a href={enquiry} target="_blank" rel="noreferrer" className="btn-primary mt-6 w-full">
              {text("product.enquire")}
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}
