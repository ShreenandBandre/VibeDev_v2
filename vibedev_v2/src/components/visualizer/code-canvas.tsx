// filepath: /src/components/visualizer/code-canvas.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { Folder, FileCode, Cpu, Link2, RotateCcw, ChevronRight } from "lucide-react";

interface CanvasProps {
  nodes: any[];
  edges: any[];
  summaries: any;
  onNodeSelect: (node: any) => void;
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

  const handleElementSelection = (node: any) => {
    const targetId = node.id || node._id;
    onNodeSelect(node);
    
    if ((node.type === "file" || node.type === "function") && playgroundId) {
      fetchNodeSummary(targetId, playgroundId, node.type);
    }

    if (node.type === "folder") {
      setSelectedFolderId(targetId);
    } else if (node.type === "file") {
      setSelectedFileId(targetId);
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

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 content-start">
        {displayedNodes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-zinc-600 text-xs font-mono border border-dashed border-zinc-900 rounded-xl m-2">
            No active architectural components nested here.
          </div>
        ) : (
          displayedNodes.map((node) => {
            const nodeId = node.id || node._id;
            const isHovered = hoveredNodeId === nodeId;
            const isRelated = activeConnectedNodeIds.has(String(nodeId));

            return (
              <div
                key={nodeId}
                onClick={() => handleElementSelection(node)}
                onMouseEnter={() => setHoveredNodeId(nodeId)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isHovered ? "border-indigo-500 bg-zinc-900 shadow-lg" : 
                  isRelated ? "border-zinc-700 bg-zinc-900/50" : "border-zinc-900 bg-zinc-900/10 hover:border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Folder size={14} className="text-amber-500" />
                  <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">{node.type}</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-200 truncate select-none">{node.label}</h4>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}