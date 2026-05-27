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
  error: null,
  pollingIntervalId: null,

  setSelectedNode: (node) => set({ selectedNode: node }),

  loadTopologyMapData: async (playgroundId: string) => {
    if (!playgroundId) return;
    try {
      const res = await getRepositoryTopology(playgroundId);
      if (res && res.success) {
        set({
          status: res.status || "PENDING",
          nodes: res.nodes || [],
          edges: res.edges || [],
          summaries: res.summaries || {},
          error: null,
        });

        if (res.status === "COMPLETED" || res.status === "FAILED") {
          get().stopPollingStatus();
        }
      } else {
        set({ error: res.error || "Failed reading repository metadata topology layout maps." });
      }
    } catch (err: any) {
      set({ error: err.message || "Network exception reading map frames." });
    } finally {
      set({ initialLoading: false });
    }
  },

  executeAIAnalysis: async (playgroundId: string) => {
    if (!playgroundId) return;
    set({ isPending: true, status: "ANALYZING", error: null });

    try {
      const res = await analyzeRepositoryArchitecture(playgroundId);
      if (res && res.success) {
        get().startPollingStatus(playgroundId);
      } else {
        set({ status: "FAILED", error: res.error || "Execution thread dropped by Groq client interface runtime." });
        set({ isPending: false });
      }
    } catch (err: any) {
      set({ status: "FAILED", error: err.message || "Unhandled operational runtime block hit." });
      set({ isPending: false });
    }
  },

  fetchNodeSummary: async (nodeId: string, playgroundId: string, nodeType: "file" | "function") => {
    if (!nodeId || !playgroundId) return;
    
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

  startPollingStatus: (playgroundId: string) => {
    if (get().pollingIntervalId) return;

    const interval = setInterval(() => {
      get().loadTopologyMapData(playgroundId);
    }, 3000);

    set({ pollingIntervalId: interval });
  },

  stopPollingStatus: () => {
    const intervalId = get().pollingIntervalId;
    if (intervalId) {
      clearInterval(intervalId);
      set({ pollingIntervalId: null, isPending: false });
    }
  },

  resetStore: () => {
    const intervalId = get().pollingIntervalId;
    if (intervalId) clearInterval(intervalId);

    set({
      status: "PENDING",
      nodes: [],
      edges: [],
      summaries: {},
      initialLoading: true,
      isPending: false,
      isInspectorLoading: false,
      selectedNode: null,
      error: null,
      pollingIntervalId: null,
    });
  },
}));