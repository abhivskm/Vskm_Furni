"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DEFAULT_CONTENT, type ContentKey, type ContentMap } from "@/lib/content";
import type { SiteSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: SiteSettings = {
  name: "Shri Vishwakarma Furniture",
  tagline: "Handcrafted wooden furniture, built to last generations.",
  about: "",
  yearsExperience: "15+",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  instagram: "",
  facebook: "",
  workingHours: "",
  profileImage: "",
  content: {},
};

/** Fields on the settings doc (other than `content`) that can be edited inline. */
export type SettingsField = Exclude<keyof SiteSettings, "content">;
/** Anything EditableText / EditableImage can point at. */
export type EditableKey = SettingsField | ContentKey;

export type SettingsPatch = Partial<Record<SettingsField, string>> & { content?: ContentMap };

interface SiteDataValue {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  /** Resolve any editable key to its current value (falls back to the built-in default). */
  text: (key: EditableKey) => string;
  /** Persist a partial update and reflect it immediately. */
  save: (patch: SettingsPatch) => Promise<void>;
}

const SiteDataContext = createContext<SiteDataValue>({
  settings: DEFAULT_SETTINGS,
  loading: true,
  error: null,
  refreshSettings: async () => {},
  text: (key) => (key in DEFAULT_CONTENT ? DEFAULT_CONTENT[key as ContentKey] : ""),
  save: async () => {},
});

export const isContentKey = (key: string): key is ContentKey => key in DEFAULT_CONTENT;

/** Site-wide settings + all editable page copy. Needed by nearly every section. */
export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await api<SiteSettings>("/api/settings");
      setSettings({ ...DEFAULT_SETTINGS, ...data, content: data.content ?? {} });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const text = useCallback(
    (key: EditableKey) => {
      if (isContentKey(key)) return settings.content[key] ?? DEFAULT_CONTENT[key];
      return settings[key] ?? "";
    },
    [settings]
  );

  const save = useCallback(async (patch: SettingsPatch) => {
    const data = await api<SiteSettings>("/api/settings", { method: "PUT", body: JSON.stringify(patch) });
    setSettings({ ...DEFAULT_SETTINGS, ...data, content: data.content ?? {} });
  }, []);

  return (
    <SiteDataContext.Provider value={{ settings, loading, error, refreshSettings, text, save }}>{children}</SiteDataContext.Provider>
  );
}

export const useSiteData = () => useContext(SiteDataContext);

/** Build the PUT body for a single editable key. */
export function patchFor(key: EditableKey, value: string): SettingsPatch {
  return isContentKey(key) ? { content: { [key]: value } } : { [key]: value };
}
