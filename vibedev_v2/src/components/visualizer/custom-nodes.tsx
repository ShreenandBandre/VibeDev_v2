// filepath: /src/components/visualizer/custom-nodes.tsx
import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Folder, File, Code } from "lucide-react";

export function FolderNode({ data }: any) {
  return (
    <div className="px-3 py-2.5 rounded-xl border border-amber-500/30 bg-amber-950/10 backdrop-blur-md shadow-lg min-w-[200px] transition-all hover:border-amber-400">
      <Handle type="target" position={Position.Left} className="!bg-amber-500" />
      <div className="flex items-center gap-2">
        <Folder size={16} className="text-amber-400 shrink-0" />
        <div className="truncate">
          <p className="text-xs font-bold text-amber-200 truncate">{data.label}</p>
          <p className="text-[10px] text-amber-500/80 font-mono">Directory Wrapper</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-amber-500" />
    </div>
  );
}

export function FileNode({ data }: any) {
  return (
    <div className="px-3 py-2.5 rounded-xl border border-blue-500/30 bg-blue-950/10 backdrop-blur-md shadow-lg min-w-[200px] transition-all hover:border-blue-400">
      <Handle type="target" position={Position.Left} className="!bg-blue-500" />
      <div className="flex items-center gap-2">
        <File size={15} className="text-blue-400 shrink-0" />
        <div className="truncate">
          <p className="text-xs font-bold text-blue-200 truncate">{data.label}</p>
          <p className="text-[10px] text-blue-500/80 font-mono">Source Module</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-blue-500" />
    </div>
  );
}

export function FunctionNode({ data }: any) {
  return (
    <div className="px-3 py-2 rounded-xl border border-emerald-500/20 bg-emerald-950/10 backdrop-blur-md shadow-sm min-w-[180px] transition-all hover:border-emerald-400">
      <Handle type="target" position={Position.Left} className="!bg-emerald-500" />
      <div className="flex items-center gap-2">
        <Code size={13} className="text-emerald-400 shrink-0" />
        <div className="truncate">
          <p className="text-xs font-mono text-emerald-300 truncate">{data.label}</p>
          <p className="text-[9px] text-emerald-600 font-mono">Symbol execution</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-emerald-500" />
    </div>
  );
}