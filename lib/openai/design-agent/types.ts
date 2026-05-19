import type {
  CanvasEdge,
  CanvasNode,
  CanvasNodeData,
  CanvasNodeShape,
  CanvasNodeSize,
} from "@/types/canvas";

type DesignAgentActionType =
  | "add_node"
  | "move_node"
  | "resize_node"
  | "update_node_data"
  | "delete_node"
  | "add_edge"
  | "delete_edge";

interface DesignAgentPosition {
  x: number;
  y: number;
}

interface DesignAgentNodeDraft {
  color: string;
  id: string;
  label: string;
  position: DesignAgentPosition;
  shape: CanvasNodeShape;
  size: CanvasNodeSize;
  textColor: string;
}

interface DesignAgentEdgeDraft {
  id: string;
  label: string | null;
  source: string;
  sourceHandle: string | null;
  target: string;
  targetHandle: string | null;
}

interface DesignAgentNodeDataPatch {
  color: string | null;
  label: string | null;
  shape: CanvasNodeShape | null;
  textColor: string | null;
}

interface DesignAgentActionBase {
  action: DesignAgentActionType;
}

interface AddNodeAction extends DesignAgentActionBase {
  action: "add_node";
  node: DesignAgentNodeDraft;
}

interface MoveNodeAction extends DesignAgentActionBase {
  action: "move_node";
  nodeId: string;
  position: DesignAgentPosition;
}

interface ResizeNodeAction extends DesignAgentActionBase {
  action: "resize_node";
  nodeId: string;
  size: CanvasNodeSize;
}

interface UpdateNodeDataAction extends DesignAgentActionBase {
  action: "update_node_data";
  data: DesignAgentNodeDataPatch;
  nodeId: string;
}

interface DeleteNodeAction extends DesignAgentActionBase {
  action: "delete_node";
  nodeId: string;
}

interface AddEdgeAction extends DesignAgentActionBase {
  action: "add_edge";
  edge: DesignAgentEdgeDraft;
}

interface DeleteEdgeAction extends DesignAgentActionBase {
  action: "delete_edge";
  edgeId: string;
}

type DesignAgentAction =
  | AddNodeAction
  | MoveNodeAction
  | ResizeNodeAction
  | UpdateNodeDataAction
  | DeleteNodeAction
  | AddEdgeAction
  | DeleteEdgeAction;

interface DesignAgentPlan {
  actions: DesignAgentAction[];
  statusMessages: string[];
  summary: string;
}

interface DesignAgentCanvasContext {
  edges: CanvasEdge[];
  nodes: CanvasNode[];
  projectId: string;
  prompt: string;
  roomId: string;
  userId?: string;
}

interface DesignAgentCanvasNodeInput {
  data: CanvasNodeData;
  height?: number;
  id: string;
  position: DesignAgentPosition;
  width?: number;
}

interface DesignAgentCanvasEdgeInput {
  data?: {
    label?: string;
  };
  id: string;
  source: string;
  target: string;
}

export type {
  AddEdgeAction,
  AddNodeAction,
  DeleteEdgeAction,
  DeleteNodeAction,
  DesignAgentAction,
  DesignAgentActionType,
  DesignAgentCanvasContext,
  DesignAgentCanvasEdgeInput,
  DesignAgentCanvasNodeInput,
  DesignAgentEdgeDraft,
  DesignAgentNodeDataPatch,
  DesignAgentNodeDraft,
  DesignAgentPlan,
  DesignAgentPosition,
  MoveNodeAction,
  ResizeNodeAction,
  UpdateNodeDataAction,
};
