import { create } from "zustand";
import { getRepositoryTopology } from "@/app/actions/get-visualizer-data";
import { analyzeRepositoryArchitecture } from "@/app/actions/visualizer-engine";
import { generateSingleFileSummary } from "@/app/actions/get-file-summary";

interface NodeSummary {
  summary: string;
  complexity: string;
  loading?: boolean;
  error?: string | null;
}

interface VisualizerState {
  status: string;
  nodes: any[];
  edges: any[];
  summaries: Record<string, NodeSummary>;
  initialLoading: boolean;
  isPending: boolean;
  isInspectorLoading: boolean;
  selectedNode: any | null;
  selectedFile: any | null; // Added
  error: string | null;
  pollingIntervalId: NodeJS.Timeout | null;

  setSelectedNode: (node: any | null) => void;
  setSelectedFile: (file: any | null) => void; // Added
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
        set({
          status: res.status || "PENDING",
          nodes: res.nodes || [],
          edges: res.edges || [],
          summaries: res.summaries || {},
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
        set({ status: "FAILED", error: res.error });
        set({ isPending: false });
      }
    } catch (err: any) {
      set({ status: "FAILED", error: err.message });
      set({ isPending: false });
    }
  },

  fetchNodeSummary: async (nodeId, playgroundId, nodeType) => {
    set((state) => ({
      isInspectorLoading: true,
      summaries: { ...state.summaries, [nodeId]: { ...state.summaries[nodeId], loading: true } }
    }));
    try {
      const res = await generateSingleFileSummary(nodeId, playgroundId, nodeType);
      if (res?.success) {
        set((state) => ({
          summaries: { ...state.summaries, [nodeId]: { summary: res.summary!, complexity: res.complexity!, loading: false } }
        }));
      }
    } catch (err) { console.error(err); }
    finally { set({ isInspectorLoading: false }); }
  },

  startPollingStatus: (playgroundId) => {
    if (get().pollingIntervalId) return;
    const interval = setInterval(() => get().loadTopologyMapData(playgroundId), 3000);
    set({ pollingIntervalId: interval });
  },

  stopPollingStatus: () => {
    const id = get().pollingIntervalId;
    if (id) { clearInterval(id); set({ pollingIntervalId: null, isPending: false }); }
  },

  resetStore: () => {
    const id = get().pollingIntervalId;
    if (id) clearInterval(id);
    set({ status: "PENDING", nodes: [], edges: [], summaries: {}, selectedNode: null, selectedFile: null, pollingIntervalId: null });
  },
}));