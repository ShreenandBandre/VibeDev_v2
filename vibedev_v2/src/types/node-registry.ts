export type NodeType = 'INPUT_TEXT' | 'ASSET_FILE' | 'LLM_GEN' | 'IMAGE_GEN' | 'OUTPUT_CHAT';

export interface NodeData {
  label: string;
  type: NodeType;
  config: Record<string, any>;
  files?: string[]; // IDs from your TemplateFile model
}

// Map the React Flow node structure to our internal business logic
export interface WorkflowNode {
  id: string;
  data: NodeData;
  position: { x: number; y: number };
}