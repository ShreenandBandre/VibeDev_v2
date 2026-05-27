// filepath: /src/components/ui/create-org-modal.tsx
"use client";

import React, { useState } from "react";
import { createOrganization } from "@/app/actions/create-organization";
import { Loader2, X } from "lucide-react";

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateOrgModal({ isOpen, onClose, onSuccess }: CreateOrgModalProps) {
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsPending(true);
    setError("");

    try {
      const res = await createOrganization({ name: name.trim() });
      if (res.success) {
        setName("");
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong building your team space");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-6 rounded-xl shadow-2xl text-zinc-200 font-sans">
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold tracking-wider font-mono text-zinc-100 uppercase">Create Workspace Organization</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Organization Name</label>
            <input
              type="text"
              required
              disabled={isPending}
              placeholder="e.g., VibeDev Core Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition"
            />
          </div>

          {error && <p className="text-[11px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 p-2 rounded">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="h-8 px-4 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 size={12} className="animate-spin" />}
              Provision Space
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}