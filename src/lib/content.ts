/**
 * Every editable string / decorative image on the site lives here with its default.
 * Values the admin changes are stored in the settings document under `content`,
 * keyed by these names, so the site still renders fully on an empty database.
 */
export const DEFAULT_CONTENT = {
  // Browser tab / SEO
  "seo.title": "Shri Vishwakarma Furniture | Handcrafted Wooden Furniture",
  "seo.description":
    "Portfolio of a professional carpenter - custom beds, wardrobes, sofas, doors, modular kitchens and more, handcrafted in solid wood.",

  // Navbar
  "nav.logo": "",
  "nav.home": "Home",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.searchPlaceholder": "Search...",
  "nav.searchEmpty": "Nothing matches that. Try another word.",

  // Hero carousel
  "hero.badge": "years of craftsmanship",
  "hero.primaryCta": "View our work",
  "hero.secondaryCta": "Contact us",
  "hero.fallbackImage": "",

  // Home-page sections (headings etc. live on each section itself)
  "sections.empty": "No cards here yet.",
  "sections.noProducts": "Nothing here yet.",
  "sections.allPrefix": "All",

  // About section
  "about.eyebrow": "About the craftsman",
  "about.yearsLabel": "Years of experience",
  "about.stat1Value": "100%",
  "about.stat1Label": "Solid wood",
  "about.stat2Value": "Custom",
  "about.stat2Label": "Made to measure",

  // Contact / footer
  "contact.eyebrow": "Get in touch",
  "contact.heading": "Let's build something for your home",
  "contact.body": "Share your idea, room size or a reference photo. Custom orders, repairs and polishing are all welcome.",
  "contact.whatsappCta": "WhatsApp us",
  "contact.callCta": "Call now",
  "contact.empty": "Contact details coming soon.",
  "contact.labelPhone": "Phone",
  "contact.labelWhatsapp": "WhatsApp",
  "contact.labelEmail": "Email",
  "contact.labelAddress": "Workshop",
  "contact.labelHours": "Hours",
  "footer.copyright": "All rights reserved.",

  // Product modal
  "product.enquire": "Enquire on WhatsApp",
} as const;

export type ContentKey = keyof typeof DEFAULT_CONTENT;
export type ContentMap = Partial<Record<ContentKey, string>>;

export const CONTENT_KEYS = Object.keys(DEFAULT_CONTENT) as ContentKey[];

/** Keys whose value is an image URL rather than text. */
export const IMAGE_KEYS: ContentKey[] = ["nav.logo", "hero.fallbackImage"];

/** Keys that need a multi-line editor. */
export const MULTILINE_KEYS: ContentKey[] = ["seo.description", "contact.body"];

/** Human-friendly labels for the "Edit all text" panel, grouped by section. */
export const CONTENT_GROUPS: { title: string; keys: ContentKey[] }[] = [
  { title: "Browser tab / search engines", keys: ["seo.title", "seo.description"] },
  { title: "Navigation", keys: ["nav.logo", "nav.home", "nav.about", "nav.contact", "nav.searchPlaceholder", "nav.searchEmpty"] },
  { title: "Hero banner", keys: ["hero.badge", "hero.primaryCta", "hero.secondaryCta", "hero.fallbackImage"] },
  { title: "About section", keys: ["about.eyebrow", "about.yearsLabel", "about.stat1Value", "about.stat1Label", "about.stat2Value", "about.stat2Label"] },
  { title: "Contact & footer", keys: ["contact.eyebrow", "contact.heading", "contact.body", "contact.whatsappCta", "contact.callCta", "contact.labelPhone", "contact.labelWhatsapp", "contact.labelEmail", "contact.labelAddress", "contact.labelHours", "contact.empty", "footer.copyright"] },
  { title: "Home-page sections & product popup", keys: ["sections.empty", "sections.noProducts", "sections.allPrefix", "product.enquire"] },
];

export function labelFor(key: ContentKey) {
  const name = key.split(".")[1];
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/Cta$/, "button")
    .replace(/Stat(\d) Value/, "Stat $1 number")
    .replace(/Stat(\d) Label/, "Stat $1 label");
}

/**
 * MongoDB stores `content.work.heading` as nested objects ({ work: { heading } }),
 * while the app uses flat "work.heading" keys. Normalise whatever comes back.
 */
export function flattenContent(raw: unknown): ContentMap {
  const out: ContentMap = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [section, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value && typeof value === "object") {
      for (const [name, v] of Object.entries(value as Record<string, unknown>)) {
        const key = `${section}.${name}`;
        if (key in DEFAULT_CONTENT && typeof v === "string") out[key as ContentKey] = v;
      }
    } else if (section in DEFAULT_CONTENT && typeof value === "string") {
      out[section as ContentKey] = value; // already flat
    }
  }
  return out;
}
