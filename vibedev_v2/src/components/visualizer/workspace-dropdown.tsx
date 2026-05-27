// filepath: /src/components/visualizer/workspace-dropdown.tsx
"use client";

import React from "react";
import { ChevronDown, Building2, UserCheck, Layers } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  type: string;
}

interface WorkspaceDropdownProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeWorkspace: Workspace | null;
  availableWorkspaces: Workspace[];
  setActiveWorkspace: (ws: Workspace) => void;
  onWorkspaceChange: () => void;
}

export function WorkspaceDropdown({
  isOpen,
  setIsOpen,
  activeWorkspace,
  availableWorkspaces,
  setActiveWorkspace,
  onWorkspaceChange,
}: WorkspaceDropdownProps) {
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(p => !p)}
        className="flex items-center gap-2 h-7 px-2.5 bg-zinc-800/40 border border-zinc-700 hover:bg-zinc-800 rounded-md text-[10px] font-mono transition-all text-zinc-300 hover:text-white"
      >
        {activeWorkspace?.type === "ORGANIZATION" ? <Building2 size={11} className="text-indigo-400"/> : <UserCheck size={11} className="text-emerald-400"/>}
        <span className="font-semibold max-w-[120px] truncate">{activeWorkspace?.name || "Personal Sandboxes"}</span>
        <ChevronDown size={10} className="text-zinc-500" />
      </button>

      {isOpen && (
        <div className="absolute top-8 left-0 w-52 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in-50 duration-100">
          <div className="px-2.5 py-1 text-[9px] font-mono uppercase text-zinc-500 tracking-wider font-bold border-b border-zinc-700/60 bg-zinc-900/20">Context Workspaces</div>
          {availableWorkspaces?.map((ws) => (
            <button
              key={ws.id}
              onClick={() => {
                setActiveWorkspace(ws);
                setIsOpen(false);
                onWorkspaceChange();
              }}
              className={`w-full text-left px-3 py-2 text-[11px] font-mono flex items-center gap-2 transition-colors ${activeWorkspace?.id === ws.id ? "bg-indigo-600/10 text-indigo-400 font-bold" : "text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-100"}`}
            >
              {ws.type === "ORGANIZATION" ? <Layers size={11} className="text-indigo-400" /> : <UserCheck size={11} className="text-emerald-400" />}
              <span className="truncate">{ws.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}