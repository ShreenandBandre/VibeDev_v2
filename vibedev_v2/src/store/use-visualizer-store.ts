// filepath: /src/store/use-visualizer-store.ts
import { create } from "zustand";
import { getRepositoryTopology } from "@/app/actions/get-visualizer-data";
import { analyzeRepositoryArchitecture } from "@/app/actions/visualizer-engine";
import { generateSingleFileSummary } from "@/app/actions/get-file-summary";

interface VisualizerState {
  status: string;
  nodes: any[];
  edges: any[];
  summaries: Record<string, any>;
  initialLoading: boolean;
  isPending: boolean;
  isInspectorLoading: boolean;
  selectedNode: any | null;
  error: string | null;
  pollingIntervalId: NodeJS.Timeout | null;

  setSelectedNode: (node: any | null) => void;
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
    
    const currentSummaries = get().summaries;
    if (currentSummaries[nodeId]?.summary) return;

    set({ isInspectorLoading: true });
    try {
      const res = await generateSingleFileSummary(nodeId, playgroundId, nodeType);
      if (res && res.success) {
        set((state) => ({
          summaries: {
            ...state.summaries,
            [nodeId]: {
              summary: res.summary || "No description cached.",
              complexity: res.complexity || "Medium"
            }
          }
        }));
      }
    } catch (err) {
      console.error("Incremental extraction execution dropped:", err);
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