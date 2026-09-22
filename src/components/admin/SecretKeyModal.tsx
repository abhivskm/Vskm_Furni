"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useAdmin } from "@/context/AdminContext";

export default function SecretKeyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAdmin();
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const ok = await login(key);
    setBusy(false);
    if (ok) {
      setKey("");
      onClose();
    } else {
      setError("Incorrect secret key.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Admin access" size="sm">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted">Enter the secret key to manage the portfolio.</p>
        <div>
          <label className="label" htmlFor="secret-key">Secret key</label>
          <input
            id="secret-key"
            type="password"
            className="input"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoFocus
            autoComplete="off"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy || !key}>{busy ? "Checking..." : "Unlock"}</button>
        </div>
      </form>
    </Modal>
  );
}
