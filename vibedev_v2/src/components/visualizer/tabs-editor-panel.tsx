// filepath: /src/components/visualizer/tabs-editor-panel.tsx
"use client";

import React from "react";
import { FileCode, X } from "lucide-react";
import { HighlightedCodeText } from "@/components/visualizer/highlighted-code-text";

interface TabItem {
  id: string;
  label: string;
  content?: string;
  type: string;
}

interface TabsEditorPanelProps {
  width: number;
  openTabs: TabItem[];
  activeTabId: string | null;
  editableCodeString: string;
  handleTabSelect: (tab: TabItem) => void;
  handleTabClose: (e: React.MouseEvent, id: string) => void;
  handleCodeWorkspaceInput: (e: React.FormEvent<HTMLTextAreaElement>) => void;
}

export function TabsEditorPanel({
  width,
  openTabs,
  activeTabId,
  editableCodeString,
  handleTabSelect,
  handleTabClose,
  handleCodeWorkspaceInput,
}: TabsEditorPanelProps) {
  return (
    <div 
      style={{ width: openTabs.length > 0 ? `${width}px` : "0px" }}
      className={`h-full bg-zinc-900 border-r border-zinc-800 z-30 relative transition-all duration-300 ease-out flex-shrink-0 overflow-hidden flex flex-col ${openTabs.length > 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div className="flex items-center bg-zinc-900 border-b border-zinc-800 overflow-x-auto scrollbar-none shrink-0 h-9">
        {openTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => handleTabSelect(tab)}
              className={`h-full flex items-center gap-2 px-3 border-r border-zinc-800 cursor-pointer text-[11px] font-mono transition-all duration-150 shrink-0 ${isActive ? "bg-zinc-800/60 text-indigo-400 font-bold border-b border-b-indigo-500" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              <FileCode size={11} />
              <span className="max-w-[110px] truncate">{tab.label}</span>
              <button onClick={(e) => handleTabClose(e, tab.id)} className="p-0.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-colors">
                <X size={9} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-3 flex-1 overflow-y-auto scrollbar-none flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto scrollbar-none rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 relative min-h-[150px]">
          {activeTabId ? (
            <div className="absolute inset-4 overflow-auto font-mono text-[11px]">
              <div className="absolute top-0 left-0 w-full min-h-full p-0 pointer-events-none z-10">
                <HighlightedCodeText code={editableCodeString} />
              </div>
              <textarea
  value={editableCodeString}
  onChange={handleCodeWorkspaceInput} // 🚀 Ensure this is strictly fired on key stroke events!
  className="w-full h-full font-mono text-xs bg-zinc-950 p-4 text-zinc-300 focus:outline-none"
/>
            </div>
          ) : (
            <span className="text-zinc-500 italic font-mono text-[11px]">// Click an open codebase module slot...</span>
          )}
        </div>
      </div>
    </div>
  );
}