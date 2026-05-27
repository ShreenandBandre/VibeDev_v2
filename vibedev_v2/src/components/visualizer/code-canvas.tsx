"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useVisualizerStore, VisualizerNode, VisualizerEdge } from "@/store/use-visualizer-store";
import { Folder, FileCode, Cpu, Link2 } from "lucide-react";

interface CanvasProps {
  nodes: VisualizerNode[];
  edges: VisualizerEdge[];
  summaries: Record<string, any>;
  onNodeSelect: (node: VisualizerNode) => void;
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
    const connected = new Set<string>();
    
    edges.forEach(edge => {
      if (edge.source === hoveredNodeId) connected.add(edge.target);
      if (edge.target === hoveredNodeId) connected.add(edge.source);
    });
    
    return connected;
  }, [hoveredNodeId, edges]);

  const getConnectionCount = (nodeId: string) => {
    return edges.filter(e => e.source === nodeId || e.target === nodeId).length;
  };

  const handleElementSelection = (node: VisualizerNode) => {
    onNodeSelect(node);
    
    console.log("🎯 Canvas Selected Asset Node Properties:", node);

    const normalizedType = node.type === "functionNode" || node.type === "function" ? "function" : "file";

    if ((normalizedType === "file" || normalizedType === "function") && playgroundId) {
      const targetIdentifier = node.id || node._id;

      if (!targetIdentifier) {
        console.error("❌ Action aborted: Object does not contain a valid identification token.", node);
        return;
      }

      fetchNodeSummary(targetIdentifier, playgroundId, normalizedType);
    }
  };

  return (
    <div className="relative w-full h-[650px] bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden select-none">
      
      {/* MAP CONTROLS HEADER */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 backdrop-blur-md p-3 rounded-xl border border-zinc-800/80 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mr-1">Layer Filters:</span>
          <button 
            onClick={() => setFilterType(null)} 
            className={`px-2 py-0.5 rounded transition-colors text-[11px] ${!filterType ? "bg-indigo-600 text-white font-medium" : "hover:text-zinc-200"}`}
          >
            All ({nodes.length})
          </button>
          <button 
            onClick={() => setFilterType("folder")} 
            className={`px-2 py-0.5 rounded transition-colors text-[11px] ${filterType === "folder" ? "bg-amber-600 text-white font-medium" : "hover:text-zinc-200"}`}
          >
            Folders
          </button>
          <button 
            onClick={() => setFilterType("file")} 
            className={`px-2 py-0.5 rounded transition-colors text-[11px] ${filterType === "file" ? "bg-blue-600 text-white font-medium" : "hover:text-zinc-200"}`}
          >
            Files
          </button>
          <button 
            onClick={() => setFilterType("function")} 
            className={`px-2 py-0.5 rounded transition-colors text-[11px] ${filterType === "function" ? "bg-emerald-600 text-white font-medium" : "hover:text-zinc-200"}`}
          >
            Functions
          </button>
        </div>

        {hoveredNodeId && (
          <div className="text-[10px] font-mono text-indigo-400 flex items-center gap-1.5 animate-in fade-in duration-100">
            <Link2 size={12} className="animate-pulse" />
            Showing links for selected subsystem block
          </div>
        )}
      </div>

      {/* RENDER SPACE GRID */}
      <div className="w-full h-full p-6 overflow-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 content-start pt-20">
        {displayedNodes.map((node) => {
          const isFolder = node.type === "folder" || node.type === "folderGroup";
          const isFile = node.type === "file";
          
          const isCurrentHoverTarget = hoveredNodeId === node.id;
          const isRelatedToHoverTarget = activeConnectedNodeIds.has(node.id);
          const totalConnections = getConnectionCount(node.id);

          let relationshipBorderClass = "border-zinc-900/60";
          let relationshipBgClass = "bg-zinc-900/20";
          
          if (hoveredNodeId) {
            if (isCurrentHoverTarget) {
              relationshipBorderClass = isFolder ? "border-amber-500 scale-[1.01]" : isFile ? "border-blue-500 scale-[1.01]" : "border-emerald-500 scale-[1.01]";
              relationshipBgClass = isFolder ? "bg-amber-950/30" : isFile ? "bg-blue-950/30" : "bg-emerald-950/30";
            } else if (isRelatedToHoverTarget) {
              relationshipBorderClass = "border-indigo-500/80 ring-1 ring-indigo-500/30";
              relationshipBgClass = "bg-indigo-950/20";
            } else {
              relationshipBgClass = "bg-zinc-950 opacity-25";
            }
          } else {
            if (isFolder) { relationshipBorderClass = "hover:border-amber-700/50"; relationshipBgClass = "bg-amber-950/5"; }
            else if (isFile) { relationshipBorderClass = "hover:border-blue-700/50"; relationshipBgClass = "bg-blue-950/5"; }
            else { relationshipBorderClass = "hover:border-emerald-700/50"; relationshipBgClass = "bg-emerald-950/5"; }
          }

          return (
            <div
              key={node.id}
              onClick={() => handleElementSelection(node)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between min-h-[120px] transition-all duration-200 ease-out active:scale-[0.98] group relative ${relationshipBorderClass} ${relationshipBgClass}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`p-2 rounded-lg transition-colors ${
                  isFolder ? "bg-amber-950/40 text-amber-400" : isFile ? "bg-blue-950/40 text-blue-400" : "bg-emerald-950/40 text-emerald-400"
                }`}>
                  {isFolder ? <Folder size={14} /> : isFile ? <FileCode size={14} /> : <Cpu size={14} />}
                </div>
                
                <div className="flex items-center gap-1.5">
                  {totalConnections > 0 && (
                    <span className="text-[9px] font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500 border border-zinc-800">
                      links: {totalConnections}
                    </span>
                  )}
                  <span className="text-[9px] font-mono opacity-40 group-hover:opacity-100 transition-opacity uppercase tracking-widest text-zinc-400">
                    {node.type}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                  {node.label || node.name}
                </h4>
                <p className="text-[9px] font-mono text-zinc-500 truncate mt-0.5" title={node.id}>
                  Ref: {node.id.length > 24 ? `...${node.id.slice(-22)}` : node.id}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}