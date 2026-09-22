"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useSiteData } from "@/context/SiteDataContext";
import { useResource } from "@/lib/useResource";
import { api } from "@/lib/api";
import SlideForm from "@/components/admin/SlideForm";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import type { CarouselSlide } from "@/lib/types";

const INTERVAL = 5000;

export default function HeroCarousel() {
  const { isAdmin } = useAdmin();
  const { settings } = useSiteData();
  const { data: slides, loading, refresh } = useResource<CarouselSlide[]>("/api/carousel");
  const [index, setIndex] = useState(0);
  const [editing, setEditing] = useState<CarouselSlide | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const count = slides?.length ?? 0;

  // Auto-advance; pauses while the admin form is open.
  useEffect(() => {
    if (count < 2 || formOpen) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearInterval(t);
  }, [count, formOpen]);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  const remove = async (slide: CarouselSlide) => {
    if (!confirm("Delete this slide?")) return;
    await api(`/api/carousel/${slide._id}`, { method: "DELETE" });
    refresh();
  };

  const openForm = (slide: CarouselSlide | null) => {
    setEditing(slide);
    setFormOpen(true);
  };

  const current = slides?.[index];

  return (
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden bg-wood-900 text-cream">
      {slides?.map((s, i) => (
        <div key={s._id} className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}>
          <img src={s.image} alt={s.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-wood-900/90 via-wood-900/30 to-transparent" />
        </div>
      ))}

      {/* Fallback when no slides exist: an editable background image (or the wood texture) */}
      {!loading && count === 0 && (
        <div className="wood-texture absolute inset-0">
          <EditableImage k="hero.fallbackImage" className="h-full w-full object-cover opacity-60" chipPosition="bottom-right" />
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col justify-center">
        <div className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber">
            <EditableText k="yearsExperience" /> <EditableText k="hero.badge" />
          </p>
          {/* Slide text is edited via the slide form; the fallbacks are the site name/tagline */}
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            {current?.title || <EditableText k="name" />}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-cream/85">{current?.subtitle || <EditableText k="tagline" />}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#work" className="btn-admin"><EditableText k="hero.primaryCta" /></a>
            <a href="#contact" className="btn border border-cream/40 text-cream hover:bg-cream/10"><EditableText k="hero.secondaryCta" /></a>
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides!.map((s, i) => (
            <button
              key={s._id}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-amber" : "w-2 bg-cream/50 hover:bg-cream"}`}
            />
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="admin-controls">
          {current && (
            <>
              <button className="admin-chip" onClick={() => openForm(current)}>Edit slide</button>
              <button className="admin-chip text-red-600" onClick={() => remove(current)}>Delete</button>
            </>
          )}
          <button className="admin-chip bg-amber" onClick={() => openForm(null)}>+ Add slide</button>
        </div>
      )}

      {isAdmin && <SlideForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={refresh} slide={editing} />}
    </section>
  );
}
