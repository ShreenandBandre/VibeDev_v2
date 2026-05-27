// filepath: /components/visualizer/code-canvas.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { Folder, FileCode, Cpu, Link2, Search } from "lucide-react";

interface CanvasProps {
  nodes: any[];
  edges: any[];
  summaries: any;
  onNodeSelect: (node: any) => void;
}

export function CodeCanvas({ nodes, edges, onNodeSelect }: CanvasProps) {
  const params = useParams();
  const [filterType, setFilterType] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const fetchNodeSummary = useVisualizerStore((state) => state.fetchNodeSummary);

  const playgroundId = Array.isArray(params?.playground)
    ? params.playground[0]
    : (params?.playground || "") as string;

  const displayedNodes = useMemo(() => {
    return filterType ? nodes.filter(n => n.type === filterType) : nodes;
  }, [nodes, filterType]);

  const activeConnectedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    return new Set(edges
      .filter(e => e.source === hoveredNodeId || e.target === hoveredNodeId)
      .map(e => e.source === hoveredNodeId ? e.target : e.source));
  }, [hoveredNodeId, edges]);

  const handleElementSelection = (node: any) => {
    onNodeSelect(node);
    if ((node.type === "file" || node.type === "function") && playgroundId) {
      fetchNodeSummary(node.id || node._id, playgroundId, node.type);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
      {/* CLEAN CONTROL BAR */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 shrink-0">
        <div className="flex items-center gap-1">
          {["All", "Folder", "File", "Function"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type === "All" ? null : type.toLowerCase())}
              className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all ${
                (filterType === type.toLowerCase() || (filterType === null && type === "All"))
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        {hoveredNodeId && <div className="text-[10px] font-mono text-indigo-500 flex items-center gap-1"><Link2 size={10} /> Active Trace</div>}
      </div>

      {/* EXPANDABLE GRID */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 content-start">
        {displayedNodes.map((node) => {
          const isHovered = hoveredNodeId === node.id;
          const isRelated = activeConnectedNodeIds.has(node.id);
          
          return (
            <div
              key={node.id}
              onClick={() => handleElementSelection(node)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isHovered ? "border-indigo-500 bg-zinc-900" : 
                isRelated ? "border-zinc-700 bg-zinc-900/50" : "border-zinc-800 bg-zinc-900/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {node.type === "folder" ? <Folder size={14} className="text-amber-500" /> : 
                 node.type === "file" ? <FileCode size={14} className="text-blue-500" /> : 
                 <Cpu size={14} className="text-emerald-500" />}
                <span className="text-[9px] font-mono text-zinc-600 uppercase">{node.type}</span>
              </div>
              <h4 className="text-xs font-bold text-zinc-200 truncate">{node.label}</h4>
            </div>
          );
        })}
      </div>
    </div>
  );
}