// filepath: /src/store/use-visualizer-store.ts
import { create } from "zustand";
import { getRepositoryTopology } from "@/app/actions/get-visualizer-data";
import { analyzeRepositoryArchitecture } from "@/app/actions/visualizer-engine";
import { generateSingleFileSummary, executeContextualAIQuery } from "@/app/actions/get-file-summary";

interface NodeSummary {
  summary: string;
  complexity: string;
  loading?: boolean;
  error?: string | null;
  howItWorks?: string;
  howToUse?: string;
  debuggingHazards?: string;
  predictionInsight?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  type: "PERSONAL" | "ORGANIZATION";
  role: string;
  imageUrl?: string | null;
}

interface VisualizerState {
  status: string;
  nodes: any[];
  edges: any[];
  summaries: Record<string, NodeSummary>;
  chatHistories: Record<string, ChatMessage[]>;
  metricsOverlayMode: "none" | "lines" | "edges";
  initialLoading: boolean;
  isPending: boolean;
  isInspectorLoading: boolean;
  isActionPending: boolean;
  selectedNode: any | null;
  selectedFile: any | null;
  error: string | null;
  pollingIntervalId: NodeJS.Timeout | null;

  // NEW: Multi-Tenant Workspace Presence Channels
  availableWorkspaces: WorkspaceInfo[];
  activeWorkspace: WorkspaceInfo | null;
  multiplayerCursors: Record<string, { x: number; y: number; name: string; color: string }>;

  setSelectedNode: (node: any | null) => void;
  setSelectedFile: (file: any | null) => void;
  setMetricsOverlayMode: (mode: "none" | "lines" | "edges") => void;
  loadTopologyMapData: (playgroundId: string) => Promise<void>;
  executeAIAnalysis: (playgroundId: string) => Promise<void>;
  fetchNodeSummary: (nodeId: string, playgroundId: string, nodeType: "file" | "function") => Promise<void>;
  askNodeQuestion: (nodeId: string, question: string) => Promise<void>;
  predictCodeChanges: (nodeId: string, intent: string) => Promise<void>;
  startPollingStatus: (playgroundId: string) => void;
  stopPollingStatus: () => void;
  resetStore: () => void;

  // NEW ACTIONS
  setAvailableWorkspaces: (workspaces: WorkspaceInfo[]) => void;
  setActiveWorkspace: (workspace: WorkspaceInfo | null) => void;
}

export const useVisualizerStore = create<VisualizerState>((set, get) => ({
  status: "PENDING",
  nodes: [],
  edges: [],
  summaries: {},
  chatHistories: {},
  metricsOverlayMode: "none",
  initialLoading: true,
  isPending: false,
  isInspectorLoading: false,
  isActionPending: false,
  selectedNode: null,
  selectedFile: null,
  error: null,
  pollingIntervalId: null,

  // Default Init states
  availableWorkspaces: [],
  activeWorkspace: null,
  multiplayerCursors: {},

  setSelectedNode: (node) => set({ selectedNode: node }),
  setSelectedFile: (file) => set({ selectedFile: file }),
  setMetricsOverlayMode: (mode) => set({ metricsOverlayMode: mode }),
  setAvailableWorkspaces: (workspaces) => set({ availableWorkspaces: workspaces }),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  loadTopologyMapData: async (playgroundId: string) => {
    if (!playgroundId) return;
    try {
      const res = await getRepositoryTopology(playgroundId);
      if (res && res.success) {
        const fallbackSummaries = Object.keys(res.summaries || {}).length > 0 ? res.summaries : get().summaries;
        const previousNodes = get().nodes;
        const currentMode = get().metricsOverlayMode;
        const currentEdges = res.edges || [];
        
        const mergedNodes = (res.nodes || []).map((freshNode: any) => {
          const freshId = String(freshNode.id || freshNode._id);
          const matchedOldNode = previousNodes.find((oldNode: any) => String(oldNode.id || oldNode._id) === freshId);
          const activeContent = freshNode.content || matchedOldNode?.content || "";
          
          const lineCount = activeContent.split("\n").length;
          const connectedEdgesCount = currentEdges.filter(
            (e: any) => String(e.source) === freshId || String(e.target) === freshId
          ).length;

          let sizeModifier = 1.0;
          if (currentMode === "lines") {
            sizeModifier = Math.min(2.5, Math.max(1.0, lineCount / 80));
          } else if (currentMode === "edges") {
            sizeModifier = Math.min(2.5, Math.max(1.0, connectedEdgesCount * 0.4));
          }

          return {
            ...freshNode,
            type: freshNode.type || "file",
            label: freshNode.label || "Unnamed Resource",
            content: activeContent,
            metrics: { lineCount, edgeCount: connectedEdgesCount },
            visualScale: sizeModifier 
          };
        });

        const currentSelectedNode = get().selectedNode;
        const currentSelectedFile = get().selectedFile;
        let updatedSelectedNode = currentSelectedNode;
        let updatedSelectedFile = currentSelectedFile;

        if (currentSelectedNode) {
          const targetId = String(currentSelectedNode.id || currentSelectedNode._id);
          updatedSelectedNode = mergedNodes.find((n: any) => String(n.id || n._id) === targetId) || currentSelectedNode;
        }
        if (currentSelectedFile) {
          const targetId = String(currentSelectedFile.id || currentSelectedFile._id);
          updatedSelectedFile = mergedNodes.find((n: any) => String(n.id || n._id) === targetId) || currentSelectedFile;
        }

        set({
          status: res.status || "PENDING",
          nodes: mergedNodes,
          edges: currentEdges,
          summaries: fallbackSummaries,
          selectedNode: updatedSelectedNode,
          selectedFile: updatedSelectedFile,
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
    set((state) => ({
      isInspectorLoading: true,
      summaries: { ...state.summaries, [cleanId]: { ...state.summaries[cleanId], summary: "Running static code validations...", complexity: "Analyzing...", loading: true } }
    }));
    try {
      const res = await generateSingleFileSummary(cleanId, playgroundId, nodeType);
      set((state) => {
        let targetUpdatedNode: any = null;
        const updatedNodes = state.nodes.map((node) => {
          if (String(node.id || node._id) === cleanId) {
            targetUpdatedNode = { ...node, content: res?.content || node.content || "" };
            return targetUpdatedNode;
          }
          return node;
        });

        if (!targetUpdatedNode) {
          targetUpdatedNode = { id: cleanId, type: "file", label: "Source File", content: res?.content || "" };
          updatedNodes.push(targetUpdatedNode);
        }

        return {
          nodes: updatedNodes,
          selectedNode: state.selectedNode && String(state.selectedNode.id || state.selectedNode._id) === cleanId ? targetUpdatedNode : state.selectedNode,
          selectedFile: state.selectedFile && String(state.selectedFile.id || state.selectedFile._id) === cleanId ? targetUpdatedNode : state.selectedFile,
          summaries: { 
            ...state.summaries, 
            [cleanId]: { 
              summary: res?.summary || "Analysis complete.", 
              complexity: res?.complexity || "Low", 
              howItWorks: res?.howItWorks || "No mechanics details available.",
              howToUse: res?.howToUse || "// Instantiation templates unmapped.",
              debuggingHazards: res?.debuggingHazards || "",
              predictionInsight: state.summaries[cleanId]?.predictionInsight || "",
              loading: false 
            }
          }
        };
      });
    } catch (err) { console.error(err); } finally { set({ isInspectorLoading: false }); }
  },

  askNodeQuestion: async (nodeId, question) => {
    const cleanId = String(nodeId);
    const targetNode = get().nodes.find(n => String(n.id || n._id) === cleanId);
    if (!targetNode) return;

    const userMsg: ChatMessage = { role: "user", text: question };
    set(state => ({
      isActionPending: true,
      chatHistories: { ...state.chatHistories, [cleanId]: [...(state.chatHistories[cleanId] || []), userMsg] }
    }));

    const res = await executeContextualAIQuery({
      codeContent: targetNode.content || "",
      fileName: targetNode.label || "unknown_component",
      userPrompt: question,
      mode: "chat"
    });

    if (res.success && res.response) {
      const systemMsg: ChatMessage = { role: "assistant", text: res.response };
      set(state => ({
        chatHistories: { ...state.chatHistories, [cleanId]: [...(state.chatHistories[cleanId] || []), systemMsg] }
      }));
    }
    set({ isActionPending: false });
  },

  predictCodeChanges: async (nodeId, intent) => {
    const cleanId = String(nodeId);
    const targetNode = get().nodes.find(n => String(n.id || n._id) === cleanId);
    if (!targetNode) return;

    set({ isActionPending: true });
    const res = await executeContextualAIQuery({
      codeContent: targetNode.content || "",
      fileName: targetNode.label || "unknown_module",
      userPrompt: intent,
      mode: "predict"
    });

    if (res.success && res.response) {
      set(state => ({
        summaries: {
          ...state.summaries,
          [cleanId]: { ...state.summaries[cleanId], predictionInsight: res.response }
        }
      }));
    }
    set({ isActionPending: false });
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
    set({ status: "PENDING", nodes: [], edges: [], summaries: {}, chatHistories: {}, metricsOverlayMode: "none", selectedNode: null, selectedFile: null, pollingIntervalId: null, isPending: false, isInspectorLoading: false, isActionPending: false });
  },
}));