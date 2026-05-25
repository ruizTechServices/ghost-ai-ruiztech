import { metadata, logger, task } from "@trigger.dev/sdk";
import { mutateFlow } from "@liveblocks/react-flow/node";

import type { CanvasSnapshot } from "@/lib/canvas-snapshot";
import {
  createDesignAgentPlan,
} from "@/lib/openai/design-agent/client";
import type {
  DesignAgentAction,
  DesignAgentPlan,
  DesignAgentPosition,
} from "@/lib/openai/design-agent/types";
import { getSafeOpenAIErrorDetails } from "@/lib/openai/errors";
import {
  connectDesignAgentRoom,
  flushLiveblocksEvents,
  type AgentRoom,
  type LiveblocksMutationClient,
} from "@/lib/liveblocks/agent-room";
import {
  checkProjectMembership,
  type ProjectMembershipIdentity,
} from "@/lib/supabase/project-membership";
import {
  loadCanvasSnapshot,
  saveCanvasSnapshot,
} from "@/lib/supabase/canvas-snapshots";
import type { AiDesignStatus, AiStatusEvent } from "@/types/ai-design";
import { AI_STATUS_FEED } from "@/types/tasks";
import {
  getCanvasNodeColorPair,
  SHAPE_DEFAULT_SIZES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeShape,
  type CanvasNodeSize,
} from "@/types/canvas";

interface DesignAgentPayload {
  primaryEmail: string | null;
  projectId: string;
  prompt: string;
  roomId: string;
  userId: string;
}

interface ApplyActionsResult {
  appliedActions: number;
  edgeCount: number;
  nodeCount: number;
  skippedActions: number;
  snapshot: CanvasSnapshot;
}

interface NodeBounds {
  height: number;
  width: number;
  x: number;
  y: number;
}

const DESIGN_AGENT_TASK_ID = "design-agent";
const MAX_LABEL_LENGTH = 80;
const MIN_NODE_HEIGHT = 56;
const MIN_NODE_WIDTH = 72;
const MAX_NODE_HEIGHT = 360;
const MAX_NODE_WIDTH = 520;
const GRID_SIZE = 24;
const NODE_GAP = 48;
const MAX_POSITION = 8_000;
const MAX_STATUS_MESSAGES = 5;
const VALID_HANDLES = new Set(["top", "right", "bottom", "left"]);

const CANVAS_EDGE_OPTIONS = {
  data: { label: "" },
  interactionWidth: 28,
  markerEnd: {
    color: "var(--canvas-edge)",
    height: 18,
    type: "arrowclosed" as const,
    width: 18,
  },
  style: {
    stroke: "var(--canvas-edge-rest)",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.8,
  },
  type: "canvasEdge" as const,
} satisfies Partial<CanvasEdge>;

const cloneCanvasNode = (node: CanvasNode): CanvasNode => ({
  ...node,
  data: { ...node.data },
  position: { ...node.position },
  style: node.style ? { ...node.style } : undefined,
});

const cloneCanvasEdge = (edge: CanvasEdge): CanvasEdge => ({
  ...edge,
  data: edge.data ? { ...edge.data } : undefined,
  markerEnd:
    typeof edge.markerEnd === "object" && edge.markerEnd !== null
      ? { ...edge.markerEnd }
      : edge.markerEnd,
  style: edge.style ? { ...edge.style } : undefined,
});

const cloneCanvasSnapshot = (snapshot: CanvasSnapshot): CanvasSnapshot => ({
  edges: snapshot.edges.map(cloneCanvasEdge),
  nodes: snapshot.nodes.map(cloneCanvasNode),
});

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const toFiniteNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const parseDimension = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const snapToGrid = (value: number): number =>
  Math.round(value / GRID_SIZE) * GRID_SIZE;

const normalizePosition = (
  position: DesignAgentPosition,
): DesignAgentPosition => ({
  x: snapToGrid(clamp(position.x, -MAX_POSITION, MAX_POSITION)),
  y: snapToGrid(clamp(position.y, -MAX_POSITION, MAX_POSITION)),
});

const getNodeSize = (node: CanvasNode): CanvasNodeSize => {
  const defaults = SHAPE_DEFAULT_SIZES[node.data.shape];
  const width =
    toFiniteNumber(node.width) ?? parseDimension(node.style?.width) ?? defaults.width;
  const height =
    toFiniteNumber(node.height) ??
    parseDimension(node.style?.height) ??
    defaults.height;

  return {
    height: clamp(height, MIN_NODE_HEIGHT, MAX_NODE_HEIGHT),
    width: clamp(width, MIN_NODE_WIDTH, MAX_NODE_WIDTH),
  };
};

const normalizeSize = (
  shape: CanvasNodeShape,
  size: CanvasNodeSize,
): CanvasNodeSize => {
  const width = snapToGrid(clamp(size.width, MIN_NODE_WIDTH, MAX_NODE_WIDTH));
  const height = snapToGrid(clamp(size.height, MIN_NODE_HEIGHT, MAX_NODE_HEIGHT));

  if (shape === "circle") {
    const diameter = Math.max(width, height);
    return { height: diameter, width: diameter };
  }

  return { height, width };
};

const normalizeNodeForPlanning = (node: CanvasNode): CanvasNode => {
  const size = getNodeSize(node);

  return {
    ...cloneCanvasNode(node),
    height: size.height,
    width: size.width,
  };
};

const truncateLabel = (label: string | null | undefined): string =>
  (label ?? "").trim().slice(0, MAX_LABEL_LENGTH);

const sanitizeIdPart = (value: string, fallback: string): string => {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return sanitized || fallback;
};

const createUniqueId = (
  candidate: string,
  existingIds: Set<string>,
  fallback: string,
): string => {
  const base = sanitizeIdPart(candidate, fallback);
  let nextId = base;
  let index = 1;

  while (existingIds.has(nextId)) {
    index += 1;
    nextId = `${base}-${index}`;
  }

  existingIds.add(nextId);
  return nextId;
};

const getBounds = (
  position: DesignAgentPosition,
  size: CanvasNodeSize,
): NodeBounds => ({
  height: size.height,
  width: size.width,
  x: position.x,
  y: position.y,
});

const boundsOverlap = (first: NodeBounds, second: NodeBounds): boolean =>
  first.x < second.x + second.width + NODE_GAP &&
  first.x + first.width + NODE_GAP > second.x &&
  first.y < second.y + second.height + NODE_GAP &&
  first.y + first.height + NODE_GAP > second.y;

const placeNode = ({
  occupiedBounds,
  position,
  size,
}: {
  occupiedBounds: NodeBounds[];
  position: DesignAgentPosition;
  size: CanvasNodeSize;
}): DesignAgentPosition => {
  const start = normalizePosition(position);
  let next = start;

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const bounds = getBounds(next, size);
    const overlaps = occupiedBounds.some((occupied) =>
      boundsOverlap(bounds, occupied),
    );

    if (!overlaps) return next;

    const column = (attempt + 1) % 5;
    const row = Math.floor((attempt + 1) / 5);
    next = normalizePosition({
      x: start.x + column * (size.width + NODE_GAP),
      y: start.y + row * (size.height + NODE_GAP),
    });
  }

  return next;
};

const createNodeBounds = (nodes: Iterable<CanvasNode>): NodeBounds[] =>
  Array.from(nodes, (node) => {
    const size = getNodeSize(node);

    return getBounds(node.position, size);
  });

const resolveHandle = (handle: string | null): string | null => {
  if (!handle) return null;
  return VALID_HANDLES.has(handle) ? handle : null;
};

const createCanvasEdge = ({
  edge,
  existingEdgeIds,
  source,
  target,
}: {
  edge: Extract<DesignAgentAction, { action: "add_edge" }>["edge"];
  existingEdgeIds: Set<string>;
  source: string;
  target: string;
}): CanvasEdge => ({
  data: { label: truncateLabel(edge.label) },
  id: createUniqueId(edge.id, existingEdgeIds, `edge-${source}-${target}`),
  interactionWidth: CANVAS_EDGE_OPTIONS.interactionWidth,
  markerEnd: CANVAS_EDGE_OPTIONS.markerEnd,
  source,
  sourceHandle: resolveHandle(edge.sourceHandle),
  style: CANVAS_EDGE_OPTIONS.style,
  target,
  targetHandle: resolveHandle(edge.targetHandle),
  type: "canvasEdge",
});

const readCanvasFromRoom = async ({
  client,
  roomId,
}: {
  client: LiveblocksMutationClient;
  roomId: string;
}): Promise<CanvasSnapshot> => {
  let snapshot: CanvasSnapshot = { edges: [], nodes: [] };

  await mutateFlow<CanvasNode, CanvasEdge>({ client, roomId }, (flow) => {
    const json = flow.toJSON();
    snapshot = {
      edges: json.edges.map(cloneCanvasEdge),
      nodes: json.nodes.map(cloneCanvasNode),
    };
  });

  return snapshot;
};

const hydrateRoomFromSnapshot = async ({
  client,
  roomId,
  snapshot,
}: {
  client: LiveblocksMutationClient;
  roomId: string;
  snapshot: CanvasSnapshot;
}): Promise<void> => {
  if (snapshot.nodes.length === 0 && snapshot.edges.length === 0) return;

  await mutateFlow<CanvasNode, CanvasEdge>({ client, roomId }, (flow) => {
    flow.addNodes(snapshot.nodes.map(cloneCanvasNode));
    flow.addEdges(snapshot.edges.map(cloneCanvasEdge));
  });
};

const getInitialCanvasSnapshot = async ({
  client,
  identity,
  projectId,
  roomId,
}: {
  client: LiveblocksMutationClient;
  identity: ProjectMembershipIdentity;
  projectId: string;
  roomId: string;
}): Promise<CanvasSnapshot> => {
  const liveSnapshot = await readCanvasFromRoom({ client, roomId });

  if (liveSnapshot.nodes.length > 0 || liveSnapshot.edges.length > 0) {
    return liveSnapshot;
  }

  const { canvas } = await loadCanvasSnapshot({ identity, projectId });

  if (!canvas) return liveSnapshot;

  const snapshot = cloneCanvasSnapshot(canvas);
  await hydrateRoomFromSnapshot({ client, roomId, snapshot });

  return snapshot;
};

const applyDesignAgentActions = async ({
  actions,
  client,
  roomId,
}: {
  actions: DesignAgentAction[];
  client: LiveblocksMutationClient;
  roomId: string;
}): Promise<ApplyActionsResult> => {
  let result: ApplyActionsResult = {
    appliedActions: 0,
    edgeCount: 0,
    nodeCount: 0,
    skippedActions: 0,
    snapshot: { edges: [], nodes: [] },
  };

  await mutateFlow<CanvasNode, CanvasEdge>({ client, roomId }, (flow) => {
    const nodesById = new Map<string, CanvasNode>(
      flow.nodes.map((node) => [node.id, cloneCanvasNode(node)]),
    );
    const edgesById = new Map<string, CanvasEdge>(
      flow.edges.map((edge) => [edge.id, cloneCanvasEdge(edge)]),
    );
    const nodeIdMap = new Map<string, string>();
    const edgeIdMap = new Map<string, string>();
    const existingNodeIds = new Set(nodesById.keys());
    const existingEdgeIds = new Set(edgesById.keys());
    let appliedActions = 0;
    let skippedActions = 0;

    const resolveNodeId = (nodeId: string): string =>
      nodeIdMap.get(nodeId) ?? nodeId;

    const resolveEdgeId = (edgeId: string): string =>
      edgeIdMap.get(edgeId) ?? edgeId;

    const skipAction = (): void => {
      skippedActions += 1;
    };

    const applyAction = (): void => {
      appliedActions += 1;
    };

    for (const action of actions) {
      switch (action.action) {
        case "add_node": {
          const colorPair = getCanvasNodeColorPair(
            action.node.color,
            action.node.textColor,
          );
          const shape = action.node.shape;
          const size = normalizeSize(shape, action.node.size);
          const position = placeNode({
            occupiedBounds: createNodeBounds(nodesById.values()),
            position: action.node.position,
            size,
          });
          const id = createUniqueId(
            action.node.id,
            existingNodeIds,
            `${shape}-${nodesById.size + 1}`,
          );
          const node: CanvasNode = {
            data: {
              color: colorPair.color,
              label: truncateLabel(action.node.label),
              shape,
              textColor: colorPair.textColor,
            },
            height: size.height,
            id,
            position,
            style: {
              height: size.height,
              width: size.width,
            },
            type: "canvasNode",
            width: size.width,
          };

          nodeIdMap.set(action.node.id, id);
          nodesById.set(id, node);
          flow.addNode(node);
          applyAction();
          break;
        }

        case "move_node": {
          const nodeId = resolveNodeId(action.nodeId);
          const node = nodesById.get(nodeId);
          if (!node) {
            skipAction();
            break;
          }

          const size = getNodeSize(node);
          const otherNodes = Array.from(nodesById.values()).filter(
            (current) => current.id !== nodeId,
          );
          const position = placeNode({
            occupiedBounds: createNodeBounds(otherNodes),
            position: action.position,
            size,
          });
          const nextNode = { ...node, position };

          nodesById.set(nodeId, nextNode);
          flow.updateNode(nodeId, { position });
          applyAction();
          break;
        }

        case "resize_node": {
          const nodeId = resolveNodeId(action.nodeId);
          const node = nodesById.get(nodeId);
          if (!node) {
            skipAction();
            break;
          }

          const size = normalizeSize(node.data.shape, action.size);
          const nextNode: CanvasNode = {
            ...node,
            height: size.height,
            style: {
              ...(node.style ?? {}),
              height: size.height,
              width: size.width,
            },
            width: size.width,
          };

          nodesById.set(nodeId, nextNode);
          flow.updateNode(nodeId, nextNode);
          applyAction();
          break;
        }

        case "update_node_data": {
          const nodeId = resolveNodeId(action.nodeId);
          const node = nodesById.get(nodeId);
          if (!node) {
            skipAction();
            break;
          }

          const nextShape = action.data.shape ?? node.data.shape;
          const colorPair = getCanvasNodeColorPair(
            action.data.color ?? node.data.color,
            action.data.textColor ?? node.data.textColor,
          );
          const nextData = {
            ...node.data,
            color: colorPair.color,
            label:
              action.data.label === null
                ? node.data.label
                : truncateLabel(action.data.label),
            shape: nextShape,
            textColor: colorPair.textColor,
          };
          const nextSize = normalizeSize(nextShape, getNodeSize(node));
          const nextNode: CanvasNode = {
            ...node,
            data: nextData,
            height: nextSize.height,
            style: {
              ...(node.style ?? {}),
              height: nextSize.height,
              width: nextSize.width,
            },
            width: nextSize.width,
          };

          nodesById.set(nodeId, nextNode);
          flow.updateNode(nodeId, nextNode);
          applyAction();
          break;
        }

        case "delete_node": {
          const nodeId = resolveNodeId(action.nodeId);
          if (!nodesById.has(nodeId)) {
            skipAction();
            break;
          }

          const connectedEdgeIds = Array.from(edgesById.values())
            .filter((edge) => edge.source === nodeId || edge.target === nodeId)
            .map((edge) => edge.id);

          if (connectedEdgeIds.length > 0) {
            flow.removeEdges(connectedEdgeIds);
            for (const edgeId of connectedEdgeIds) {
              edgesById.delete(edgeId);
              existingEdgeIds.delete(edgeId);
            }
          }

          flow.removeNode(nodeId);
          nodesById.delete(nodeId);
          existingNodeIds.delete(nodeId);
          applyAction();
          break;
        }

        case "add_edge": {
          const source = resolveNodeId(action.edge.source);
          const target = resolveNodeId(action.edge.target);
          if (!nodesById.has(source) || !nodesById.has(target) || source === target) {
            skipAction();
            break;
          }

          const edge = createCanvasEdge({
            edge: action.edge,
            existingEdgeIds,
            source,
            target,
          });

          edgeIdMap.set(action.edge.id, edge.id);
          edgesById.set(edge.id, edge);
          flow.addEdge(edge);
          applyAction();
          break;
        }

        case "delete_edge": {
          const edgeId = resolveEdgeId(action.edgeId);
          if (!edgesById.has(edgeId)) {
            skipAction();
            break;
          }

          flow.removeEdge(edgeId);
          edgesById.delete(edgeId);
          existingEdgeIds.delete(edgeId);
          applyAction();
          break;
        }
      }
    }

    result = {
      appliedActions,
      edgeCount: edgesById.size,
      nodeCount: nodesById.size,
      skippedActions,
      snapshot: {
        edges: Array.from(edgesById.values(), cloneCanvasEdge),
        nodes: Array.from(nodesById.values(), cloneCanvasNode),
      },
    };
  });

  return result;
};

const createStatusPublisher = ({
  projectId,
  room,
  roomId,
  runId,
}: {
  projectId: string;
  room: AgentRoom;
  roomId: string;
  runId: string;
}) => {
  let statusCounter = 0;

  return async ({
    cursor,
    message,
    progress,
    status,
  }: {
    cursor?: DesignAgentPosition | null;
    message: string;
    progress: number;
    status: AiDesignStatus;
  }): Promise<void> => {
    statusCounter += 1;

    const event: AiStatusEvent = {
      createdAt: new Date().toISOString(),
      feed: AI_STATUS_FEED,
      id: `${runId}-${status}-${statusCounter}`,
      message,
      projectId,
      roomId,
      runId,
      status,
      text: message,
      type: "ai-status",
    };

    metadata.set("status", status);
    metadata.set("message", message);
    metadata.set("progress", progress);
    logger.info("Design agent status", {
      message,
      progress,
      projectId,
      roomId,
      runId,
      status,
    });
    room.updatePresence({
      cursor:
        cursor === undefined
          ? {
              x: 96 + statusCounter * 18,
              y: 96 + statusCounter * 12,
            }
          : cursor,
      thinking: status !== "completed" && status !== "failed",
    });
    room.broadcastEvent(event);
    await flushLiveblocksEvents();
  };
};

const publishPlanMessages = async ({
  messages,
  publishStatus,
}: {
  messages: string[];
  publishStatus: ReturnType<typeof createStatusPublisher>;
}): Promise<void> => {
  for (const message of messages.slice(0, MAX_STATUS_MESSAGES)) {
    await publishStatus({
      message,
      progress: 55,
      status: "planning",
    });
  }
};

const getErrorMessage = (error: unknown): string => {
  const safeDetails = getSafeOpenAIErrorDetails(error);
  return safeDetails.message;
};

export const designAgentTask = task({
  id: DESIGN_AGENT_TASK_ID,
  retry: {
    maxAttempts: 1,
  },
  run: async (payload: DesignAgentPayload, { ctx }) => {
    const identity: ProjectMembershipIdentity = {
      primaryEmail: payload.primaryEmail,
      userId: payload.userId,
    };
    const runId = ctx.run.id;
    const roomConnection = await connectDesignAgentRoom(payload.roomId);
    const { leave, mutationClient, room } = roomConnection;
    const publishStatus = createStatusPublisher({
      projectId: payload.projectId,
      room,
      roomId: payload.roomId,
      runId,
    });

    try {
      await publishStatus({
        cursor: { x: 96, y: 96 },
        message: "Ghost AI is joining the canvas.",
        progress: 5,
        status: "started",
      });

      if (payload.projectId !== payload.roomId) {
        throw new Error("Project ID and room ID must match.");
      }

      const { access } = await checkProjectMembership({
        ...identity,
        projectId: payload.projectId,
      });

      if (!access) {
        throw new Error("Project access is required.");
      }

      await publishStatus({
        cursor: { x: 136, y: 112 },
        message: "Reading the current canvas.",
        progress: 18,
        status: "reading",
      });

      const currentCanvas = await getInitialCanvasSnapshot({
        client: mutationClient,
        identity,
        projectId: payload.projectId,
        roomId: payload.roomId,
      });

      await publishStatus({
        cursor: { x: 176, y: 132 },
        message: "Planning canvas updates.",
        progress: 34,
        status: "planning",
      });

      const planResponse = await createDesignAgentPlan({
        edges: currentCanvas.edges,
        nodes: currentCanvas.nodes.map(normalizeNodeForPlanning),
        projectId: payload.projectId,
        prompt: payload.prompt,
        roomId: payload.roomId,
        userId: payload.userId,
      });
      const plan: DesignAgentPlan = planResponse.data;

      metadata.set("openaiResponseId", planResponse.responseId);
      metadata.set("openaiModel", planResponse.model);
      if (planResponse.requestId) {
        metadata.set("openaiRequestId", planResponse.requestId);
      }

      await publishPlanMessages({
        messages: plan.statusMessages,
        publishStatus,
      });

      await publishStatus({
        cursor: { x: 224, y: 160 },
        message: "Applying the design to the shared canvas.",
        progress: 68,
        status: "applying",
      });

      const applyResult = await applyDesignAgentActions({
        actions: plan.actions,
        client: mutationClient,
        roomId: payload.roomId,
      });

      metadata.set("appliedActions", applyResult.appliedActions);
      metadata.set("skippedActions", applyResult.skippedActions);
      metadata.set("nodeCount", applyResult.nodeCount);
      metadata.set("edgeCount", applyResult.edgeCount);

      await publishStatus({
        cursor: { x: 256, y: 184 },
        message: "Saving the updated canvas snapshot.",
        progress: 86,
        status: "saving",
      });

      const savedSnapshot = await saveCanvasSnapshot({
        canvas: applyResult.snapshot,
        identity,
        projectId: payload.projectId,
      });

      await publishStatus({
        cursor: null,
        message: plan.summary,
        progress: 100,
        status: "completed",
      });

      return {
        appliedActions: applyResult.appliedActions,
        edgeCount: applyResult.edgeCount,
        nodeCount: applyResult.nodeCount,
        path: savedSnapshot.path,
        projectId: payload.projectId,
        skippedActions: applyResult.skippedActions,
        status: "completed" as const,
      };
    } catch (error) {
      const message = getErrorMessage(error);

      logger.error("Design agent failed", {
        error: message,
        projectId: payload.projectId,
        roomId: payload.roomId,
        runId,
      });

      await publishStatus({
        cursor: null,
        message: `Ghost AI could not update the canvas: ${message}`,
        progress: 100,
        status: "failed",
      });

      throw error;
    } finally {
      room.updatePresence({ cursor: null, thinking: false });
      await flushLiveblocksEvents();
      leave();
    }
  },
});

export { DESIGN_AGENT_TASK_ID };
export type { DesignAgentPayload };
