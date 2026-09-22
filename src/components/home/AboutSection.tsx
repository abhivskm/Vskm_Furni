"use client";

import { useSiteData } from "@/context/SiteDataContext";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";

export default function AboutSection() {
  const { settings } = useSiteData();

  return (
    <section id="about" className="scroll-mt-20 bg-sand/60">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <EditableText k="about.eyebrow" as="p" className="text-xs font-semibold uppercase tracking-[0.2em] text-wood-500" />
          <EditableText k="name" as="h2" className="mt-2 block text-3xl font-semibold text-wood-900 sm:text-4xl" />
          <EditableText k="about" as="p" className="mt-4 block whitespace-pre-line leading-relaxed text-ink/80" />
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/70 p-4 text-center">
              <EditableText k="yearsExperience" as="div" className="font-serif text-2xl font-semibold text-wood-700" />
              <EditableText k="about.yearsLabel" as="div" className="mt-1 text-xs uppercase tracking-wide text-muted" />
            </div>
            <div className="rounded-xl bg-white/70 p-4 text-center">
              <EditableText k="about.stat1Value" as="div" className="font-serif text-2xl font-semibold text-wood-700" />
              <EditableText k="about.stat1Label" as="div" className="mt-1 text-xs uppercase tracking-wide text-muted" />
            </div>
            <div className="rounded-xl bg-white/70 p-4 text-center">
              <EditableText k="about.stat2Value" as="div" className="font-serif text-2xl font-semibold text-wood-700" />
              <EditableText k="about.stat2Label" as="div" className="mt-1 text-xs uppercase tracking-wide text-muted" />
            </div>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
            <EditableImage
              k="profileImage"
              alt={settings.name}
              className="h-full w-full object-cover"
              placeholder={<div className="wood-texture flex h-full items-center justify-center text-cream/40">Workshop photo</div>}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
