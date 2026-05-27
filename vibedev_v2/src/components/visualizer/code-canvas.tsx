// filepath: /src/components/visualizer/code-canvas.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { Folder, FileCode, Cpu, Link2, ChevronRight, Search, Zap, Download } from "lucide-react";

interface CanvasProps {
  nodes: any[];
  edges: any[];
  summaries: any;
  onNodeSelect: (node: any) => void;
}

export function CodeCanvas({ nodes, edges, summaries, onNodeSelect }: CanvasProps) {
  const params = useParams();
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const fetchNodeSummary = useVisualizerStore((state) => state.fetchNodeSummary);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Local state to track custom card order rearrangements from drag-and-drop actions
  const [orderedNodeIds, setOrderedNodeIds] = useState<string[]>([]);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const playgroundId = Array.isArray(params?.playground)
    ? params.playground[0]
    : (params?.playground || "") as string;

  const selectedNode = useVisualizerStore((state) => state.selectedNode);
  
  useEffect(() => {
    if (!selectedNode) {
      setSelectedFolderId(null);
      setSelectedFileId(null);
    } else {
      if (selectedNode.type === "folder") {
        setSelectedFolderId(selectedNode.id || selectedNode._id);
        setSelectedFileId(null);
      } else if (selectedNode.type === "file") {
        setSelectedFileId(selectedNode.id || selectedNode._id);
        if (selectedNode.parentId || selectedNode.folderId) {
          setSelectedFolderId(selectedNode.parentId || selectedNode.folderId);
        }
      }
    }
  }, [selectedNode]);

  const resetFilters = () => {
    setSelectedFolderId(null);
    setSelectedFileId(null);
    setSearchQuery("");
    useVisualizerStore.getState().setSelectedNode(null);
    useVisualizerStore.getState().setSelectedFile(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        resetFilters();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter core items down based on context maps
  const baseFilteredNodes = useMemo(() => {
    let currentPool = nodes;

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

    if (searchQuery.trim() !== "") {
      const normalizedQuery = searchQuery.toLowerCase();
      currentPool = nodes.filter(
        (n) => n.label?.toLowerCase().includes(normalizedQuery) || n.type?.toLowerCase().includes(normalizedQuery)
      );
    }

    return currentPool;
  }, [nodes, selectedFolderId, selectedFileId, searchQuery]);

  // Sort nodes based on manual drag relocations
  const displayedNodes = useMemo(() => {
    if (orderedNodeIds.length === 0) return baseFilteredNodes;
    
    const sorted = [...baseFilteredNodes].sort((a, b) => {
      const indexA = orderedNodeIds.indexOf(String(a.id || a._id));
      const indexB = orderedNodeIds.indexOf(String(b.id || b._id));
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    return sorted;
  }, [baseFilteredNodes, orderedNodeIds]);

  const activeConnectedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const linked = new Set<string>();
    edges.forEach((edge) => {
      if (String(edge.source) === String(hoveredNodeId)) linked.add(String(edge.target));
      if (String(edge.target) === String(hoveredNodeId)) linked.add(String(edge.source));
    });
    return linked;
  }, [hoveredNodeId, edges]);

  const handleElementSelection = (node: any) => {
    const targetId = node.id || node._id;
    onNodeSelect(node);
    if ((node.type === "file" || node.type === "function") && playgroundId) {
      fetchNodeSummary(targetId, playgroundId, node.type);
    }
    if (node.type === "folder") {
      setSelectedFolderId(targetId);
      setSearchQuery("");
    } else if (node.type === "file") {
      setSelectedFileId(targetId);
      setSearchQuery("");
    }
  };

  // Drag and Drop Relocation Handlers
  const handleDragStart = (id: string) => {
    setDraggedNodeId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedNodeId || draggedNodeId === targetId) return;

    const currentOrder = displayedNodes.map(n => String(n.id || n._id));
    const draggedIdx = currentOrder.indexOf(draggedNodeId);
    const targetIdx = currentOrder.indexOf(targetId);

    if (draggedIdx !== -1 && targetIdx !== -1) {
      const newOrder = [...currentOrder];
      newOrder.splice(draggedIdx, 1);
      newOrder.splice(targetIdx, 0, draggedNodeId);
      setOrderedNodeIds(newOrder);
    }
  };

  // Export Architecture Snapshot Action
  const exportArchitectureBlueprint = () => {
    const exportData = {
      playgroundId,
      exportedAt: new Date().toISOString(),
      components: baseFilteredNodes.map(n => ({
        id: n.id || n._id,
        name: n.label,
        type: n.type,
        path: n.path || "root",
        insight: summaries?.[n.id || n._id] || "No documentation compiled yet."
      })),
      dependencies: edges.filter(e => 
        baseFilteredNodes.some(n => String(n.id || n._id) === String(e.source))
      )
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `architecture-blueprint-${playgroundId || "export"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentFolderName = useMemo(() => nodes.find((n) => String(n.id) === String(selectedFolderId) || String(n._id) === String(selectedFolderId))?.label, [nodes, selectedFolderId]);
  const currentFileName = useMemo(() => nodes.find((n) => String(n.id) === String(selectedFileId) || String(n._id) === String(selectedFileId))?.label, [nodes, selectedFileId]);

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden relative group/canvas">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-zinc-900 gap-3 shrink-0 bg-zinc-950">
        <div className="flex items-center gap-2 text-xs font-medium min-w-0">
          <button onClick={resetFilters} className={`transition-colors shrink-0 ${!selectedFolderId ? "text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}>Root</button>
          {selectedFolderId && (
            <>
              <ChevronRight size={12} className="text-zinc-600 shrink-0" />
              <button onClick={() => { setSelectedFileId(null); useVisualizerStore.getState().setSelectedFile(null); }} className={`transition-colors truncate max-w-[120px] ${!selectedFileId ? "text-amber-400 font-bold" : "text-zinc-500 hover:text-zinc-300"}`}>{currentFolderName || "Folder"}</button>
            </>
          )}
          {selectedFileId && (
            <>
              <ChevronRight size={12} className="text-zinc-600 shrink-0" />
              <span className="text-blue-400 font-bold truncate max-w-[120px]">{currentFileName || "File"}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center w-full sm:w-44">
            <Search size={12} className="absolute left-2.5 text-zinc-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter cards..."
              className="w-full bg-zinc-900/60 text-xs text-zinc-200 pl-8 pr-3 py-1.5 rounded-lg border border-zinc-900 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600 font-mono transition-colors"
            />
          </div>

          <button
            onClick={exportArchitectureBlueprint}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all"
            title="Export blueprint snapshot data"
          >
            <Download size={12} />
            <span className="hidden md:inline">Export</span>
          </button>

          {hoveredNodeId && (
            <div className="text-[10px] font-mono text-indigo-400 flex items-center gap-1 shrink-0 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
              <Link2 size={10} /> Trace
            </div>
          )}
        </div>
      </div>

      {/* DRAG-ARRANGEABLE CANVAS GRID */}
      <div className="flex-1 overflow-y-auto scrollbar-none p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 content-start">
        {displayedNodes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-zinc-600 text-xs font-mono border border-dashed border-zinc-900 rounded-xl m-2">No elements matching snapshot focus scopes.</div>
        ) : (
          displayedNodes.map((node) => {
            const nodeId = String(node.id || node._id);
            const isHovered = hoveredNodeId === nodeId;
            const isRelated = activeConnectedNodeIds.has(nodeId);
            const isDimmed = hoveredNodeId !== null && !isHovered && !isRelated;

            return (
              <div
                key={nodeId}
                onClick={() => handleElementSelection(node)}
                onMouseEnter={() => setHoveredNodeId(nodeId)}
                onMouseLeave={() => setHoveredNodeId(null)}
                
                // HTML5 Drag Attributes
                draggable
                onDragStart={() => handleDragStart(nodeId)}
                onDragOver={(e) => handleDragOver(e, nodeId)}
                onDragEnd={() => setDraggedNodeId(null)}
                
                className={`p-5 min-h-[115px] flex flex-col justify-between rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing ${
                  isHovered 
                    ? "border-indigo-500 bg-zinc-900 shadow-xl scale-[1.01]" 
                    : isRelated 
                    ? "border-indigo-500/50 bg-indigo-950/20" 
                    : "border-zinc-900 bg-zinc-900/10 hover:border-zinc-800"
                } ${isDimmed ? "opacity-30 blur-[0.3px]" : "opacity-100"} ${draggedNodeId === nodeId ? "border-dashed border-indigo-500/40 bg-zinc-950 opacity-40" : ""}`}
              >
                <div className="flex items-center gap-2 mb-4">
                  {node.type === "folder" ? (
                    <Folder size={15} className="text-amber-500 shrink-0" />
                  ) : node.type === "file" ? (
                    <FileCode size={15} className="text-blue-500 shrink-0" />
                  ) : (
                    <Cpu size={15} className="text-emerald-500 shrink-0" />
                  )}
                  <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">{node.type}</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-200 break-all line-clamp-2 select-none leading-relaxed">{node.label}</h4>
              </div>
            );
          })
        )}
      </div>

      {(selectedFolderId || selectedFileId || searchQuery) && (
        <div className="absolute bottom-4 right-4 z-50">
          <button onClick={resetFilters} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-mono shadow-2xl transition-all">
            <Zap size={11} className="text-indigo-400" />
            <span>Reset View</span>
            <kbd className="bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-[9px] text-zinc-600">Ctrl E</kbd>
          </button>
        </div>
      )}
    </div>
  );
}