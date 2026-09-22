"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ADMIN_KEY_STORAGE, getStoredKey } from "@/lib/api";

interface AdminContextValue {
  isAdmin: boolean;
  ready: boolean;
  login: (key: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  ready: false,
  login: async () => false,
  logout: () => {},
});

async function verify(key: string) {
  const res = await fetch("/api/admin/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  return res.ok;
}

/**
 * Admin mode is unlocked by entering the secret key in the hidden popup.
 * The key is stored in localStorage and re-verified on every page load, so a
 * refresh keeps the admin interface active until "Exit admin" is clicked.
 */
export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const key = getStoredKey();
    if (!key) {
      setReady(true);
      return;
    }
    verify(key)
      .then((ok) => {
        if (!ok) localStorage.removeItem(ADMIN_KEY_STORAGE);
        setIsAdmin(ok);
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (key: string) => {
    const ok = await verify(key.trim());
    if (ok) {
      localStorage.setItem(ADMIN_KEY_STORAGE, key.trim());
      setIsAdmin(true);
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    setIsAdmin(false);
  }, []);

  return <AdminContext.Provider value={{ isAdmin, ready, login, logout }}>{children}</AdminContext.Provider>;
}

export const useAdmin = () => useContext(AdminContext);
