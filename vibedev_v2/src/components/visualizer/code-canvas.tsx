"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { Folder, FileCode, Cpu, Link2, RotateCcw, ChevronRight, Search } from "lucide-react";

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
  
  // 2. Global Text Filtering State
  const [searchQuery, setSearchQuery] = useState("");

  const playgroundId = Array.isArray(params?.playground)
    ? params.playground[0]
    : (params?.playground || "") as string;

  const selectedNode = useVisualizerStore((state) => state.selectedNode);
  
  useEffect(() => {
    if (!selectedNode) {
      setSelectedFolderId(null);
      setSelectedFileId(null);
    }
  }, [selectedNode]);

  // Robust layout hierarchy matcher + Instant global keyword mapping
  const displayedNodes = useMemo(() => {
    let currentPool = nodes;

    // Apply directory drill downs if search string isn't actively bypassing context scopes
    if (!searchQuery) {
      if (selectedFileId) {
        currentPool = nodes.filter(
          (n) => n.type === "function" && String(n.parentId || n.fileId) === String(selectedFileId)
        );
      } else if (selectedFolderId) {
        const folderChildren = nodes.filter(
          (n) => n.type === "file" && String(n.parentId || n.folderId) === String(selectedFolderId)
        );

        if (folderChildren.length === 0) {
          const targetFolderNode = nodes.find(n => String(n.id) === String(selectedFolderId) || String(n._id) === String(selectedFolderId));
          if (targetFolderNode?.label) {
            currentPool = nodes.filter(
              (n) => n.type === "file" && (
                String(n.path || "").includes(`/${targetFolderNode.label}/`) || 
                String(n.parentId || n.folderId) === String(selectedFolderId)
              )
            );
          }
        } else {
          currentPool = folderChildren;
        }
      } else {
        const rootFolders = nodes.filter((n) => n.type === "folder" && (!n.parentId && !n.folderId));
        currentPool = rootFolders.length === 0 ? nodes.filter((n) => n.type === "folder") : rootFolders;
      }
    }

    // Apply Global Search across active or general targets if text string exists
    if (searchQuery.trim() !== "") {
      const normalizedQuery = searchQuery.toLowerCase();
      return nodes.filter(
        (n) => 
          n.label?.toLowerCase().includes(normalizedQuery) ||
          n.type?.toLowerCase().includes(normalizedQuery)
      );
    }

    return currentPool;
  }, [nodes, selectedFolderId, selectedFileId, searchQuery]);

  // 3. Relational Dependency Edge Clamping
  const activeConnectedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    
    const linked = new Set<string>();
    edges.forEach((edge) => {
      const src = String(edge.source);
      const tgt = String(edge.target);
      const current = String(hoveredNodeId);
      
      if (src === current) linked.add(tgt);
      if (tgt === current) linked.add(src);
    });
    
    return linked;
  }, [hoveredNodeId, edges]);

  const handleElementSelection = (node: VisualizerNode) => {
    onNodeSelect(node);
    
    console.log("🎯 Canvas Selected Asset Node Properties:", node);

    const normalizedType = node.type === "functionNode" || node.type === "function" ? "function" : "file";

    if ((normalizedType === "file" || normalizedType === "function") && playgroundId) {
      const targetIdentifier = node.id || node._id;

    if (node.type === "folder") {
      setSelectedFolderId(targetId);
      setSearchQuery(""); // Clear search filter upon entering explicit scopes
    } else if (node.type === "file") {
      setSelectedFileId(targetId);
      setSearchQuery("");
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
    setSearchQuery("");
    useVisualizerStore.getState().setSelectedNode(null);
    useVisualizerStore.getState().setSelectedFile(null);
  };

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
      
      {/* BREADCRUMBS & COMPONENT SEARCH CONTAINER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-zinc-900 gap-3 shrink-0 bg-zinc-950">
        <div className="flex items-center gap-2 text-xs font-medium min-w-0">
          <button
            onClick={resetFilters}
            className={`transition-colors shrink-0 ${!selectedFolderId ? "text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Root
          </button>

          {selectedFolderId && (
            <>
              <ChevronRight size={12} className="text-zinc-600 shrink-0" />
              <button
                onClick={() => { setSelectedFileId(null); useVisualizerStore.getState().setSelectedFile(null); }}
                className={`transition-colors truncate max-w-[120px] ${!selectedFileId ? "text-amber-400 font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {currentFolderName || "Folder"}
              </button>
            </>
          )}

          {selectedFileId && (
            <>
              <ChevronRight size={12} className="text-zinc-600 shrink-0" />
              <span className="text-blue-400 font-bold truncate max-w-[120px]">
                {currentFileName || "File"}
              </span>
            </>
          )}

          {(selectedFolderId || selectedFileId || searchQuery) && (
            <button onClick={resetFilters} className="ml-2 p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition-all shrink-0">
              <RotateCcw size={12} />
            </button>
          )}
        </div>

        {/* UTILITY FILTERS TOOLBAR */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center w-full sm:w-48 md:w-60">
            <Search size={12} className="absolute left-2.5 text-zinc-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword..."
              className="w-full bg-zinc-900/60 text-xs text-zinc-200 pl-8 pr-3 py-1.5 rounded-lg border border-zinc-900 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600 font-mono transition-colors"
            />
          </div>

          {hoveredNodeId && (
            <div className="text-[10px] font-mono text-indigo-400 flex items-center gap-1 shrink-0 animate-pulse bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
              <Link2 size={10} /> Active Trace
            </div>
          )}
        </div>
      </div>

      {/* CORE CANVAS COMPONENT GRID FRAME */}
      <div className="flex-1 overflow-y-auto scrollbar-none p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 content-start">
        {displayedNodes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-zinc-600 text-xs font-mono border border-dashed border-zinc-900 rounded-xl m-2">
            No architectural elements match the current view criteria.
          </div>
        ) : (
          displayedNodes.map((node) => {
            const nodeId = node.id || node._id;
            const isHovered = hoveredNodeId === nodeId;
            const isRelated = activeConnectedNodeIds.has(String(nodeId));
            
            // Contextual opacity dimming calculation if dependency traces are tracking
            const isDimmed = hoveredNodeId !== null && !isHovered && !isRelated;

            return (
              <div
                key={nodeId}
                onClick={() => handleElementSelection(node)}
                onMouseEnter={() => setHoveredNodeId(nodeId)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={`p-5 min-h-[115px] flex flex-col justify-between rounded-xl border transition-all duration-200 cursor-pointer ${
                  isHovered 
                    ? "border-indigo-500 bg-zinc-900 shadow-xl scale-[1.01]" 
                    : isRelated 
                    ? "border-indigo-500/50 bg-indigo-950/20 shadow-[0_0_12px_rgba(99,102,241,0.05)]" 
                    : "border-zinc-900 bg-zinc-900/10 hover:border-zinc-800"
                } ${isDimmed ? "opacity-30 blur-[0.3px]" : "opacity-100"}`}
              >
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    {node.type === "folder" ? (
                      <Folder size={15} className="text-amber-500 shrink-0" />
                    ) : node.type === "file" ? (
                      <FileCode size={15} className="text-blue-500 shrink-0" />
                    ) : (
                      <Cpu size={15} className="text-emerald-500 shrink-0" />
                    )}
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">{node.type}</span>
                  </div>
                </div>
                
                <h4 className="text-xs font-bold text-zinc-200 break-all line-clamp-2 select-none leading-relaxed">
                  {node.label}
                </h4>
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