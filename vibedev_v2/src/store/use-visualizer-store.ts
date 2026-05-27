import { create } from "zustand";
import { getRepositoryTopology } from "@/app/actions/get-visualizer-data";
import { analyzeRepositoryArchitecture } from "@/app/actions/visualizer-engine";
import { generateSingleFileSummary } from "@/app/actions/get-file-summary";

export type NodeType = "file" | "function" | "folder" | "folderGroup" | "functionNode";

export interface VisualizerNode {
  id: string;
  _id?: string;
  type: NodeType;
  label?: string;
  name?: string;
  path?: string;
  content?: string;
  summary?: string;
  complexity?: "Low" | "Medium" | "High" | string;
  data?: {
    id?: string;
    fileId?: string;
    path?: string;
    content?: string;
    rawContent?: string;
    summary?: string;
    complexity?: string;
  };
}

export interface VisualizerEdge {
  id: string;
  source: string;
  target: string;
}

export interface NodeSummaryPayload {
  summary: string;
  complexity: string;
  rawContent: string;
}

interface VisualizerState {
  status: string;
  nodes: VisualizerNode[];
  edges: VisualizerEdge[];
  summaries: Record<string, NodeSummaryPayload>;
  initialLoading: boolean;
  isPending: boolean;
  isInspectorLoading: boolean;
  selectedNode: VisualizerNode | null;
  error: string | null;
  pollingIntervalId: NodeJS.Timeout | null;

  setSelectedNode: (node: VisualizerNode | null) => void;
  loadTopologyMapData: (playgroundId: string) => Promise<void>;
  executeAIAnalysis: (playgroundId: string) => Promise<void>;
  fetchNodeSummary: (nodeId: string, playgroundId: string, nodeType: "file" | "function") => Promise<void>;
  startPollingStatus: (playgroundId: string) => void;
  stopPollingStatus: () => void;
  resetStore: () => void;
}

export const useVisualizerStore = create<VisualizerState>((set, get) => ({
  status: "PENDING",
  nodes: [],
  edges: [],
  summaries: {},
  initialLoading: true,
  isPending: false,
  isInspectorLoading: false,
  selectedNode: null,
  selectedFile: null,
  error: null,
  pollingIntervalId: null,

  setSelectedNode: (node) => set({ selectedNode: node }),
  setSelectedFile: (file) => set({ selectedFile: file }),

  loadTopologyMapData: async (playgroundId: string) => {
    if (!playgroundId) return;
    try {
      const res = await getRepositoryTopology(playgroundId);
      if (res && res.success) {
        // Prevent polling updates from wiping out active summaries in local UI state
        const fallbackSummaries = Object.keys(res.summaries || {}).length > 0 
          ? res.summaries 
          : get().summaries;

        set({
          status: res.status || "PENDING",
          nodes: res.nodes || [],
          edges: res.edges || [],
          summaries: fallbackSummaries,
          error: null,
        });
        if (res.status === "COMPLETED" || res.status === "FAILED") get().stopPollingStatus();
      } else {
        set({ error: res.error || "Failed reading repository metadata." });
      }
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ initialLoading: false });
    }
  },

  executeAIAnalysis: async (playgroundId: string) => {
    if (!playgroundId) return;
    set({ isPending: true, status: "ANALYZING", error: null });
    try {
      const res = await analyzeRepositoryArchitecture(playgroundId);
      if (res && res.success) get().startPollingStatus(playgroundId);
      else {
        set({ status: "FAILED", error: res.error, isPending: false });
      }
    } catch (err: any) {
      set({ status: "FAILED", error: err.message, isPending: false });
    }
  },

  fetchNodeSummary: async (nodeId, playgroundId, nodeType) => {
    const cleanId = String(nodeId);
    
    set({ isInspectorLoading: true });
    try {
      const res = await generateSingleFileSummary(nodeId, playgroundId, nodeType);
      
      const currentNodes = get().nodes;
      const targetNode = currentNodes.find(n => n.id === nodeId || n._id === nodeId || n.data?.id === nodeId);
      
      set((state) => {
        const updatedSummaries = { ...state.summaries };
        const incomingSummary = res?.summary || res?.data?.summary;
        const incomingComplexity = res?.complexity || res?.data?.complexity;
        const incomingRawContent = res?.rawContent || res?.data?.rawContent || targetNode?.content || targetNode?.data?.content || "";

        const nodePayload: NodeSummaryPayload = {
          summary: incomingSummary || "No architecture summary compiled yet.",
          complexity: incomingComplexity || "Low",
          rawContent: incomingRawContent
        };

        updatedSummaries[nodeId] = nodePayload;

        if (targetNode?.id) updatedSummaries[targetNode.id] = nodePayload;
        if (targetNode?._id) updatedSummaries[targetNode._id] = nodePayload;
        if (targetNode?.data?.fileId) updatedSummaries[targetNode.data.fileId] = nodePayload;

        const incomingParentId = res?.parentFileId || res?.data?.parentFileId || targetNode?.data?.fileId;
        if (nodeType === "function" && incomingParentId) {
          updatedSummaries[incomingParentId] = updatedSummaries[incomingParentId] || {
            summary: "Parent workspace file holding this functional node implementation.",
            complexity: incomingComplexity || "Low",
            rawContent: incomingRawContent
          };
        }

        return { summaries: updatedSummaries };
      });
    } catch (err) {
      console.error("Failed extracting runtime code snippets:", err);
    } finally {
      set({ isInspectorLoading: false });
    }
  },

  startPollingStatus: (playgroundId) => {
    if (get().pollingIntervalId) return;
    const interval = setInterval(() => get().loadTopologyMapData(playgroundId), 3000);
    set({ pollingIntervalId: interval });
  },

  stopPollingStatus: () => {
    const id = get().pollingIntervalId;
    if (id) { 
      clearInterval(id); 
      set({ pollingIntervalId: null, isPending: false }); 
    }
  },

  resetStore: () => {
    const id = get().pollingIntervalId;
    if (id) clearInterval(id);
    set({ 
      status: "PENDING", 
      nodes: [], 
      edges: [], 
      summaries: {}, 
      selectedNode: null, 
      selectedFile: null, 
      pollingIntervalId: null,
      isPending: false,
      isInspectorLoading: false
    });
  },
}));