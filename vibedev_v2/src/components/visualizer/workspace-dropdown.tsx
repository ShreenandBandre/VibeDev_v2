"use client";

import React from "react";
import {
  ChevronDown,
  Building2,
  UserCheck,
  Layers,
} from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  type: string; // "PERSONAL" | "ORGANIZATION"
}

interface WorkspaceDropdownProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeWorkspace: Workspace | null;
  availableWorkspaces: Workspace[];
  setActiveWorkspace: (workspace: Workspace) => void;
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
  // Group workspaces
  const personal = availableWorkspaces.filter(
    (workspace) => workspace.type !== "ORGANIZATION"
  );

  const organizations = availableWorkspaces.filter(
    (workspace) => workspace.type === "ORGANIZATION"
  );

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
    setIsOpen(false);
    onWorkspaceChange();
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 h-8 px-3 bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800 rounded-md text-xs font-mono transition-all text-zinc-300 hover:text-white"
      >
        {activeWorkspace?.type === "ORGANIZATION" ? (
          <Building2
            size={12}
            className="text-indigo-400 shrink-0"
          />
        ) : (
          <UserCheck
            size={12}
            className="text-emerald-400 shrink-0"
          />
        )}

        <span className="font-semibold max-w-[140px] truncate">
          {activeWorkspace?.name || "Personal Sandboxes"}
        </span>

        <ChevronDown
          size={12}
          className={`text-zinc-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-10 left-0 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          
          {/* Personal Section */}
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
            Personal
          </div>

          {personal.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() =>
                handleWorkspaceSelect(workspace)
              }
              className={`w-full text-left px-3 py-2.5 text-xs font-mono flex items-center gap-2 transition-colors ${
                activeWorkspace?.id === workspace.id
                  ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              <UserCheck
                size={12}
                className="text-emerald-400 shrink-0"
              />

              <span className="truncate">
                {workspace.name}
              </span>
            </button>
          ))}

          {/* Organization Section */}
          {organizations.length > 0 && (
            <>
              <div className="mt-1 border-t border-zinc-800" />

              <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                Organizations
              </div>

              {organizations.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() =>
                    handleWorkspaceSelect(workspace)
                  }
                  className={`w-full text-left px-3 py-2.5 text-xs font-mono flex items-center gap-2 transition-colors ${
                    activeWorkspace?.id === workspace.id
                      ? "bg-indigo-500/10 text-indigo-400 font-semibold"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  }`}
                >
                  <Layers
                    size={12}
                    className="text-indigo-400 shrink-0"
                  />

                  <span className="truncate">
                    {workspace.name}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}