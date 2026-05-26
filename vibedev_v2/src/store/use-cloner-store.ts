import { create } from "zustand";
import { cloneGitHubRepository } from "@/app/actions/git-cloner";

interface ClonerState {
  isOpen: boolean;
  isCloning: boolean;
  repoUrl: string;
  error: string | null;
  setOpen: (open: boolean) => void;
  setRepoUrl: (url: string) => void;
  executeClone: (workspaceType: "personal" | "team", activeOrgId: string | null, onSuccess: () => void) => Promise<void>;
}

export const useClonerStore = create<ClonerState>((set, get) => ({
  isOpen: false,
  isCloning: false,
  repoUrl: "",
  error: null,
  setOpen: (open) => set({ isOpen: open, error: null, repoUrl: "" }),
  setRepoUrl: (url) => set({ repoUrl: url }),
  executeClone: async (workspaceType, activeOrgId, onSuccess) => {
    const { repoUrl } = get();
    if (!repoUrl.trim()) {
      set({ error: "Repository locator target destination cannot be empty." });
      return;
    }

    set({ isCloning: true, error: null });
    
    const result = await cloneGitHubRepository(repoUrl, workspaceType, activeOrgId);
    
    if (result.success) {
      set({ isCloning: false, isOpen: false, repoUrl: "" });
      onSuccess(); // Re-trigger page data fetch loops
    } else {
      set({ isCloning: false, error: result.error || "An unexpected processing error occurred." });
    }
  },
}));