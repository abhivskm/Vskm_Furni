import type { ContentMap } from "./content";

export interface CarouselSlide {
  _id: string;
  image: string;
  title: string;
  subtitle: string;
  order: number;
}

/** A home-page section: one way of grouping products ("Browse by category", "Browse by space", ...). */
export interface Section {
  _id: string;
  slug: string;
  label: string;
  pluralLabel: string;
  title: string;
  eyebrow: string;
  cardCta: string;
  order: number;
}

/** A card inside a section (Sofa, Hall, Teak, ...). */
export interface Group {
  _id: string;
  section: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
}

export interface Product {
  _id: string;
  /** One group per section the product is tagged in. */
  groups: string[];
  title: string;
  description: string;
  images: string[];
  material: string;
  dimensions: string;
  year: string;
  price: string;
  order: number;
  createdAt?: string;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  about: string;
  yearsExperience: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  workingHours: string;
  profileImage: string;
  /** Every other editable string / image on the site, see lib/content.ts */
  content: ContentMap;
}
