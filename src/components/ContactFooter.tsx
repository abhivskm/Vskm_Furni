"use client";

import { useSiteData } from "@/context/SiteDataContext";
import { useAdmin } from "@/context/AdminContext";
import HiddenAdminButton from "@/components/admin/HiddenAdminButton";
import EditableText from "@/components/editable/EditableText";

const whatsappLink = (n: string) => `https://wa.me/${n.replace(/\D/g, "")}`;

/** Contact section + footer. Also hosts the hidden admin emblem. */
export default function ContactFooter() {
  const { settings } = useSiteData();
  const { isAdmin } = useAdmin();

  // Each row: which content key holds the label, which settings field holds the value, and how to link it.
  const rows = [
    { label: "contact.labelPhone", field: "phone", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    { label: "contact.labelWhatsapp", field: "whatsapp", value: settings.whatsapp, href: whatsappLink(settings.whatsapp) },
    { label: "contact.labelEmail", field: "email", value: settings.email, href: `mailto:${settings.email}` },
    { label: "contact.labelAddress", field: "address", value: settings.address },
    { label: "contact.labelHours", field: "workingHours", value: settings.workingHours },
  ] as const;
  // Visitors only see filled-in rows; the admin sees all of them so empty ones can be filled.
  const visible = isAdmin ? rows : rows.filter((r) => r.value);

  return (
    <footer id="contact" className="wood-texture relative mt-16 text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
        <div>
          <EditableText k="contact.eyebrow" as="p" className="text-xs font-semibold uppercase tracking-[0.2em] text-amber" />
          <EditableText k="contact.heading" as="h2" className="mt-2 block text-3xl font-semibold sm:text-4xl" />
          <EditableText k="contact.body" as="p" className="mt-4 block max-w-md text-cream/75" />
          <div className="mt-6 flex flex-wrap gap-3">
            {settings.whatsapp && (
              <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="btn-admin">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" /></svg>
                <EditableText k="contact.whatsappCta" />
              </a>
            )}
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="btn border border-cream/30 text-cream hover:bg-cream/10">
                <EditableText k="contact.callCta" />
              </a>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {visible.length === 0 && <EditableText k="contact.empty" as="p" className="text-cream/60" />}
          {visible.map((r) => (
            <div key={r.field} className="flex gap-4 border-b border-cream/10 pb-3">
              <EditableText k={r.label} className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-amber" />
              {"href" in r && r.value && !isAdmin ? (
                <a href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="whitespace-pre-line hover:text-amber">
                  {r.value}
                </a>
              ) : (
                <EditableText k={r.field} className="whitespace-pre-line text-cream/85" />
              )}
            </div>
          ))}
          {(settings.instagram || settings.facebook) && (
            <div className="flex gap-4 pt-2 text-sm">
              {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer" className="hover:text-amber">Instagram</a>}
              {settings.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" className="hover:text-amber">Facebook</a>}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-xs text-cream/50 sm:px-6">
          <span>
            &copy; {new Date().getFullYear()} <EditableText k="name" /> <EditableText k="footer.copyright" />
          </span>
          <HiddenAdminButton />
        </div>
      </div>
    </footer>
  );
}
