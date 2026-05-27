"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const fetchNodeSummary = useVisualizerStore((state) => state.fetchNodeSummary);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const playgroundId = Array.isArray(params?.playground)
    ? params.playground[0]
    : (params?.playground || "") as string;

  const selectedNode = useVisualizerStore((state) => state.selectedNode);
  
  // Sync view filter if parent completely clears active selection states
  useEffect(() => {
    if (!selectedNode) {
      setSelectedFolderId(null);
      setSelectedFileId(null);
    }
  }, [selectedNode]);

  // 🛠️ FIX: Robust layout hierarchy matcher
  const displayedNodes = useMemo(() => {
    if (selectedFileId) {
      return nodes.filter(
        (n) => n.type === "function" && String(n.parentId || n.fileId) === String(selectedFileId)
      );
    }
    
    if (selectedFolderId) {
      const folderChildren = nodes.filter(
        (n) => n.type === "file" && String(n.parentId || n.folderId) === String(selectedFolderId)
      );

      // FALLBACK WORKAROUND: If data maps files flatly without parent ids, match via file paths
      if (folderChildren.length === 0) {
        const targetFolderNode = nodes.find(n => String(n.id) === String(selectedFolderId) || String(n._id) === String(selectedFolderId));
        if (targetFolderNode?.label) {
          return nodes.filter(
            (n) => n.type === "file" && (
              String(n.path || "").includes(`/${targetFolderNode.label}/`) || 
              String(n.parentId || n.folderId) === String(selectedFolderId)
            )
          );
        }
      }
      return folderChildren;
    }

    // Root Viewport: Filter to only top-level nodes or explicit folders
    const rootFolders = nodes.filter((n) => n.type === "folder" && (!n.parentId && !n.folderId));
    
    // Fallback safeguard: If all folders are stored at root level, show all folders
    if (rootFolders.length === 0) {
      return nodes.filter((n) => n.type === "folder");
    }
    
    return rootFolders;
  }, [nodes, selectedFolderId, selectedFileId]);

  const activeConnectedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    return new Set(
      edges
        .filter((e) => String(e.source) === String(hoveredNodeId) || String(e.target) === String(hoveredNodeId))
        .map((e) => String(e.source) === String(hoveredNodeId) ? String(e.target) : String(e.source))
    );
  }, [hoveredNodeId, edges]);

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

  const currentFolderName = useMemo(() => {
    return nodes.find((n) => String(n.id) === String(selectedFolderId) || String(n._id) === String(selectedFolderId))?.label;
  }, [nodes, selectedFolderId]);

  const currentFileName = useMemo(() => {
    return nodes.find((n) => String(n.id) === String(selectedFileId) || String(n._id) === String(selectedFileId))?.label;
  }, [nodes, selectedFileId]);

  const resetFilters = () => {
    setSelectedFolderId(null);
    setSelectedFileId(null);
    useVisualizerStore.getState().setSelectedNode(null);
    useVisualizerStore.getState().setSelectedFile(null);
  };

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium">
          <button
            onClick={resetFilters}
            className={`transition-colors ${!selectedFolderId ? "text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Root
          </button>

          {selectedFolderId && (
            <>
              <ChevronRight size={12} className="text-zinc-600" />
              <button
                onClick={() => { setSelectedFileId(null); useVisualizerStore.getState().setSelectedFile(null); }}
                className={`transition-colors truncate max-w-[150px] ${!selectedFileId ? "text-amber-400 font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {currentFolderName || "Folder"}
              </button>
            </>
          )}

          {selectedFileId && (
            <>
              <ChevronRight size={12} className="text-zinc-600" />
              <span className="text-blue-400 font-bold truncate max-w-[150px]">
                {currentFileName || "File"}
              </span>
            </>
          )}

          {(selectedFolderId || selectedFileId) && (
            <button onClick={resetFilters} className="ml-2 p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition-all">
              <RotateCcw size={12} />
            </button>
          )}
        </div>

        {hoveredNodeId && (
          <div className="text-[10px] font-mono text-indigo-500 flex items-center gap-1">
            <Link2 size={10} /> Active Trace
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
                <h4 className="text-xs font-bold text-zinc-200 truncate select-none">{node.label}</h4>
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