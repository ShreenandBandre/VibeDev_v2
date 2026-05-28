import { create } from "zustand";
import { getRepositoryTopology } from "@/app/actions/get-visualizer-data";
import { analyzeRepositoryArchitecture } from "@/app/actions/visualizer-engine";
import { generateSingleFileSummary, executeContextualAIQuery } from "@/app/actions/get-file-summary";
import { fetchRemoteGitHubCommits, pushLiveCommitTreeToGitHub } from "@/app/actions/github-actions";

interface NodeSummary {
  summary: string;
  complexity: string;
  loading?: boolean;
  error?: string | null;
  howItWorks?: string;
  howToUse?: string;
  debuggingHazards?: string;
  predictionInsight?: string;
  controlFlowSteps?: any[]; 
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

interface GitFileChange {
  filename: string;
  status: "modified" | "added" | "deleted";
  rawContent: string;
}

interface GitCommitLog {
  sha: string;
  message: string;
  author: string;
  date: string;
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

  availableWorkspaces: WorkspaceInfo[];
  activeWorkspace: WorkspaceInfo | null;
  multiplayerCursors: Record<string, { x: number; y: number; name: string; color: string }>;

  // 🚀 LIVE GITHUB STATE MATRIX
  gitRepoConfig: { owner: string; repo: string; token: string };
  activeBranch: string;
  unstagedChanges: GitFileChange[];
  stagedChanges: GitFileChange[];
  commitLogs: GitCommitLog[];
  isGitActionLoading: boolean;
  pusherClient: any | null;

  // 🛠️ EXPOSED STATE SETTERS & ACTION UPDATERS
  setNodes: (nodes: any[]) => void;
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

  setAvailableWorkspaces: (workspaces: WorkspaceInfo[]) => void;
  setActiveWorkspace: (workspace: WorkspaceInfo | null) => void;

  // 🚀 LIVE GIT ACTIONS HANDLERS
  initGitEnvironment: (owner: string, repo: string, token: string) => void;
  setActiveBranch: (branch: string) => void;
  syncLiveUnstagedChanges: () => void;
  stageFileIndex: (filename: string) => void;
  stageAllFiles: () => void;
  unstageFileIndex: (filename: string) => void;
  refreshRemoteLogs: () => Promise<void>;
  executeLiveCommitAndPush: (message: string) => Promise<boolean>;
  
  // 📡 WEBHOOK REALTIME SOCKET SYNC HOOKS
  subscribeToLiveGitHubChannel: (playgroundId: string) => Promise<void>;
  unsubscribeFromLiveGitHubChannel: (playgroundId: string) => void;
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

  availableWorkspaces: [],
  activeWorkspace: null,
  multiplayerCursors: {},

  gitRepoConfig: { 
    owner: "rahul-dev", 
    repo: "irrigation-control-core", 
    token: "" 
  },
  activeBranch: "main",
  unstagedChanges: [],
  stagedChanges: [],
  commitLogs: [],
  isGitActionLoading: false,
  pusherClient: null,

  // 🎯 CORE TRIGGER FIX: setNodes update karega aur changes ko auto-sync karega
  setNodes: (newNodes) => {
    set({ nodes: [...newNodes] });
    get().syncLiveUnstagedChanges(); // Live updates are dispatched instantly to Git matrices
  },

  setSelectedNode: (node) => set({ selectedNode: node }),
  setSelectedFile: (file) => set({ selectedFile: file }),
  setMetricsOverlayMode: (mode) => set({ metricsOverlayMode: mode }),
  setAvailableWorkspaces: (workspaces) => set({ availableWorkspaces: workspaces }),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  initGitEnvironment: (owner, repo, token) => set({ gitRepoConfig: { owner, repo, token } }),
  
  setActiveBranch: (branch) => {
    set({ activeBranch: branch });
    get().refreshRemoteLogs(); 
  },

  syncLiveUnstagedChanges: () => {
    const { nodes, stagedChanges } = get();
    const dynamicUnstaged: GitFileChange[] = [];
    
    nodes.forEach(node => {
      if ((node.type === "file" || node.type === "module") && node.content) {
        const targetPath = node.path || node.filePath || node.label || "unknown_module.ts";
        const isAlreadyStaged = stagedChanges.some(s => s.filename === targetPath);
        
        if (!isAlreadyStaged && (node.isDirty || node.hasChanges)) {
          dynamicUnstaged.push({
            filename: targetPath,
            status: "modified",
            rawContent: node.content
          });
        }
      }
    });

    set({ unstagedChanges: dynamicUnstaged });
  },

  stageFileIndex: (filename) => {
    const { unstagedChanges, stagedChanges } = get();
    const file = unstagedChanges.find(f => f.filename === filename);
    if (!file) return;
    set({
      stagedChanges: [...stagedChanges, file],
      unstagedChanges: unstagedChanges.filter(f => f.filename !== filename)
    });
  },

  stageAllFiles: () => {
    const { unstagedChanges, stagedChanges } = get();
    set({ stagedChanges: [...stagedChanges, ...unstagedChanges], unstagedChanges: [] });
  },

  unstageFileIndex: (filename) => {
    const { unstagedChanges, stagedChanges } = get();
    const file = stagedChanges.find(f => f.filename === filename);
    if (!file) return;
    set({
      unstagedChanges: [...unstagedChanges, file],
      stagedChanges: stagedChanges.filter(f => f.filename !== filename)
    });
  },

  refreshRemoteLogs: async () => {
    const playgroundId = window.location.pathname.split("/").pop() || "";
    if (!playgroundId) return;

    set({ isGitActionLoading: true });
    
    const result = await fetchRemoteGitHubCommits(playgroundId);
    
    if (result.success) {
      set({ commitLogs: result.data, isGitActionLoading: false });
    } else {
      set({ isGitActionLoading: false });
      console.error("Failed fetching live tracking commits stack:", result.error);
    }
  },

  // 🚀 FIXED: Dynamic Multi-file Auto-Staging and Push Pipeline Handler
  executeLiveCommitAndPush: async (message) => {
    const playgroundId = window.location.pathname.split("/").pop() || "";
    
    // Pehle sync call run karo taaki dynamic changes array up-to-date ho jaye
    get().syncLiveUnstagedChanges();
    
    const { activeBranch, stagedChanges, unstagedChanges, gitRepoConfig, nodes } = get();
    
    // Fallback Setup: Agar user ne directly commit press kiya bina manual stage kiye, 
    // toh unstaged changes ko hi as a target commit pipeline use karlo.
    const targetsToPush = stagedChanges.length > 0 ? stagedChanges : unstagedChanges;
    
    if (targetsToPush.length === 0 || !playgroundId) {
      console.warn("⚠️ Commit abort: No modifications inside staging or working workspace buffers.");
      return false;
    }

    set({ isGitActionLoading: true });

    const filesPayload = targetsToPush.map(f => ({
      filename: f.filename,
      rawContent: f.rawContent || ""
    }));

    try {
      const result = await pushLiveCommitTreeToGitHub({
        playgroundId,
        owner: gitRepoConfig.owner !== "rahul-dev" ? gitRepoConfig.owner : undefined,
        repo: gitRepoConfig.repo !== "irrigation-control-core" ? gitRepoConfig.repo : undefined,
        token: gitRepoConfig.token || undefined,
        branch: activeBranch || "main",
        message,
        files: filesPayload
      });

      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Clear changes status locks for pushed files inside global tree nodes visualization matrix
        const cleanNodes = nodes.map(node => {
          const pathMatch = node.path || node.filePath || node.label;
          const wasCommitted = targetsToPush.some(s => s.filename === pathMatch);
          if (wasCommitted) {
            return { ...node, isDirty: false, hasChanges: false };
          }
          return node;
        });

        set({ 
          nodes: cleanNodes, 
          stagedChanges: [], 
          unstagedChanges: [], 
          isGitActionLoading: false 
        });

        // Instant background refresh logs
        await get().refreshRemoteLogs(); 
        return true;
      } else {
        set({ isGitActionLoading: false });
        console.error("Git Stream transaction failed injection response payload:", result.error);
        return false;
      }
    } catch (err) {
      set({ isGitActionLoading: false });
      console.error("Network crash during live tree orchestration:", err);
      return false;
    }
  },

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
            path: freshNode.path || freshNode.filePath || matchedOldNode?.path || freshNode.label,
            isDirty: matchedOldNode?.isDirty || false,
            hasChanges: matchedOldNode?.hasChanges || false,
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
        
        get().syncLiveUnstagedChanges();

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
      summaries: { 
        ...state.summaries, 
        [cleanId]: { 
          ...state.summaries[cleanId], 
          summary: "Running static code validations...", 
          complexity: "Analyzing...", 
          loading: true 
        } 
      }
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
              controlFlowSteps: res?.controlFlowSteps || [], 
              loading: false 
            }
          }
        };
      });
      get().syncLiveUnstagedChanges();
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

  subscribeToLiveGitHubChannel: async (playgroundId: string) => {
    if (!playgroundId) return;
    
    const PusherClient = (await import("pusher-js")).default;
    let client = get().pusherClient;
    
    if (!client) {
      client = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: "/api/realtime/auth",
      });
      set({ pusherClient: client });
    }

    const channelName = `playground-${playgroundId}`;
    const targetChannel = client.subscribe(channelName);

    targetChannel.bind("repo-updated", async (data: any) => {
      console.log("⚡ [Webhook Triggered] Real-time repository delta found:", data.message);
      await get().loadTopologyMapData(playgroundId);
      await get().refreshRemoteLogs();
    });
  },

  unsubscribeFromLiveGitHubChannel: (playgroundId) => {
    const client = get().pusherClient;
    if (client && playgroundId) {
      client.unsubscribe(`playground-${playgroundId}`);
    }
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
    set({ status: "PENDING", nodes: [], edges: [], summaries: {}, chatHistories: {}, metricsOverlayMode: "none", selectedNode: null, selectedFile: null, pollingIntervalId: null, isPending: false, isInspectorLoading: false, isActionPending: false, unstagedChanges: [], stagedChanges: [] });
  },
}));