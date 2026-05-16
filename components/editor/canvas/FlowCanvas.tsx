"use client";

import { useAuth } from "@clerk/nextjs";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { useUpdateMyPresence } from "@liveblocks/react/suspense";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
} from "react";

import "@xyflow/react/dist/style.css";

import { CanvasControlBar } from "@/components/editor/canvas/CanvasControlBar";
import { CanvasEdgeView } from "@/components/editor/canvas/CanvasEdgeView";
import { CanvasNodeView } from "@/components/editor/canvas/CanvasNodeView";
import { CanvasPresence } from "@/components/editor/canvas/CanvasPresence";
import { LiveCursors } from "@/components/editor/canvas/LiveCursors";
import { ShapePanel } from "@/components/editor/canvas/ShapePanel";
import type { CanvasTemplateImportRequest } from "@/components/editor/starter-templates";
import {
  parseCanvasSnapshot,
  type CanvasSnapshot,
} from "@/lib/canvas-snapshot";
import {
  useCanvasAutosave,
  type CanvasAutosaveState,
} from "@/hooks/useCanvasAutosave";
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_TEXT_COLOR,
  SHAPE_DRAG_MIME,
  type CanvasEdge,
  type CanvasNode,
  type ShapeDragPayload,
} from "@/types/canvas";

const INITIAL_NODES: CanvasNode[] = [];
const INITIAL_EDGES: CanvasEdge[] = [];

const NODE_TYPES = { canvasNode: CanvasNodeView } as const;
const EDGE_TYPES = { canvasEdge: CanvasEdgeView } as const;

const DEFAULT_CANVAS_EDGE_OPTIONS = {
  data: { label: "" },
  interactionWidth: 28,
  markerEnd: {
    color: "var(--canvas-edge)",
    height: 18,
    type: MarkerType.ArrowClosed,
    width: 18,
  },
  style: {
    stroke: "var(--canvas-edge-rest)",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.8,
  },
  type: "canvasEdge",
} satisfies Partial<CanvasEdge>;

let nodeCounter = 0;
const createNodeId = (shape: string): string => {
  nodeCounter += 1;
  return `${shape}-${Date.now()}-${nodeCounter}`;
};

let edgeCounter = 0;
const createEdgeId = (connection: Connection): string => {
  edgeCounter += 1;
  return [
    "edge",
    connection.source,
    connection.sourceHandle ?? "node",
    connection.target,
    connection.targetHandle ?? "node",
    Date.now(),
    edgeCounter,
  ].join("-");
};

const parseDragPayload = (
  event: DragEvent<HTMLDivElement>,
): ShapeDragPayload | null => {
  const raw = event.dataTransfer.getData(SHAPE_DRAG_MIME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ShapeDragPayload;
    if (!parsed || typeof parsed.shape !== "string") return null;
    if (!parsed.size || typeof parsed.size.width !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
};

const cloneTemplateNode = (node: CanvasNode): CanvasNode => ({
  ...node,
  data: { ...node.data },
  position: { ...node.position },
  style: node.style ? { ...node.style } : undefined,
});

const cloneTemplateEdge = (edge: CanvasEdge): CanvasEdge => ({
  ...edge,
  data: edge.data ? { ...edge.data } : undefined,
  markerEnd:
    typeof edge.markerEnd === "object" && edge.markerEnd !== null
      ? { ...edge.markerEnd }
      : edge.markerEnd,
  style: edge.style ? { ...edge.style } : undefined,
});

const readCanvasLoadResponse = async (
  response: Response,
): Promise<CanvasSnapshot | null> => {
  if (!response.ok) {
    throw new Error("Canvas snapshot load failed.");
  }

  const parsed: unknown = await response.json();
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("canvas" in parsed)
  ) {
    throw new Error("Canvas snapshot response is malformed.");
  }

  const { canvas } = parsed;
  return canvas === null ? null : parseCanvasSnapshot(canvas);
};

interface CanvasFlowProps {
  onSaveStatusChange?: (state: CanvasAutosaveState) => void;
  projectId: string;
  templateImportRequest?: CanvasTemplateImportRequest | null;
}

const CanvasFlow = ({
  onSaveStatusChange,
  projectId,
  templateImportRequest,
}: CanvasFlowProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const importedRequestIdRef = useRef<number | null>(null);
  const initialLoadStartedRef = useRef(false);
  const currentContentRef = useRef({ edgeCount: 0, nodeCount: 0 });
  const { userId } = useAuth();
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const updateMyPresence = useUpdateMyPresence();
  const [hasInitialLoadError, setHasInitialLoadError] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const { edges, nodes, onDelete, onEdgesChange, onNodesChange } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      edges: { initial: INITIAL_EDGES },
      nodes: { initial: INITIAL_NODES },
      suspense: true,
    });
  const autosaveState = useCanvasAutosave({
    edges,
    isReady: isInitialLoadComplete && !hasInitialLoadError,
    nodes,
    projectId,
  });

  useEffect(() => {
    currentContentRef.current = {
      edgeCount: edges.length,
      nodeCount: nodes.length,
    };
  }, [edges.length, nodes.length]);

  useEffect(() => {
    if (!onSaveStatusChange) return;

    onSaveStatusChange(
      hasInitialLoadError
        ? { lastSavedAt: null, status: "error" }
        : autosaveState,
    );
  }, [autosaveState, hasInitialLoadError, onSaveStatusChange]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const payload = parseDragPayload(event);
      if (!payload) return;

      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: CanvasNode = {
        data: {
          color: DEFAULT_NODE_COLOR,
          label: "",
          shape: payload.shape,
          textColor: DEFAULT_NODE_TEXT_COLOR,
        },
        id: createNodeId(payload.shape),
        position,
        style: {
          height: payload.size.height,
          width: payload.size.width,
        },
        type: "canvasNode",
      };

      onNodesChange([{ item: newNode, type: "add" }]);
    },
    [onNodesChange, reactFlow],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const bounds = wrapperRef.current?.getBoundingClientRect();
      if (!bounds) return;

      updateMyPresence({
        cursor: {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        },
      });
    },
    [updateMyPresence],
  );

  const handleMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  const handleConnect = useCallback(
    (connection: Connection): void => {
      if (!connection.source || !connection.target) return;

      const newEdge: CanvasEdge = {
        data: { label: "" },
        id: createEdgeId(connection),
        interactionWidth: DEFAULT_CANVAS_EDGE_OPTIONS.interactionWidth,
        markerEnd: DEFAULT_CANVAS_EDGE_OPTIONS.markerEnd,
        source: connection.source,
        sourceHandle: connection.sourceHandle,
        style: DEFAULT_CANVAS_EDGE_OPTIONS.style,
        target: connection.target,
        targetHandle: connection.targetHandle,
        type: "canvasEdge",
      };

      onEdgesChange([{ item: newEdge, type: "add" }]);
    },
    [onEdgesChange],
  );

  useEffect(() => {
    if (initialLoadStartedRef.current) return;

    initialLoadStartedRef.current = true;

    if (nodes.length > 0 || edges.length > 0) {
      window.setTimeout(() => setIsInitialLoadComplete(true), 0);
      return;
    }

    let isCancelled = false;

    void fetch(`/api/projects/${encodeURIComponent(projectId)}/canvas`)
      .then(readCanvasLoadResponse)
      .then((canvas) => {
        if (isCancelled) return;

        const roomHasContent =
          currentContentRef.current.nodeCount > 0 ||
          currentContentRef.current.edgeCount > 0;

        if (roomHasContent || !canvas) {
          setIsInitialLoadComplete(true);
          return;
        }

        if (canvas.nodes.length > 0) {
          onNodesChange(
            canvas.nodes.map((node) => ({
              item: cloneTemplateNode(node),
              type: "add",
            })),
          );
        }

        if (canvas.edges.length > 0) {
          onEdgesChange(
            canvas.edges.map((edge) => ({
              item: cloneTemplateEdge(edge),
              type: "add",
            })),
          );
        }

        window.requestAnimationFrame(() => {
          void reactFlow.fitView({
            duration: 240,
            padding: 0.2,
          });
          window.setTimeout(() => setIsInitialLoadComplete(true), 0);
        });
      })
      .catch(() => {
        if (isCancelled) return;

        setHasInitialLoadError(true);
      });

    return () => {
      isCancelled = true;
    };
  }, [
    edges.length,
    nodes.length,
    onEdgesChange,
    onNodesChange,
    projectId,
    reactFlow,
  ]);

  useEffect(() => {
    if (!templateImportRequest) return;
    if (importedRequestIdRef.current === templateImportRequest.id) return;

    importedRequestIdRef.current = templateImportRequest.id;

    const removeEdges: EdgeChange<CanvasEdge>[] = edges.map((edge) => ({
      id: edge.id,
      type: "remove",
    }));
    const removeNodes: NodeChange<CanvasNode>[] = nodes.map((node) => ({
      id: node.id,
      type: "remove",
    }));
    const addNodes: NodeChange<CanvasNode>[] =
      templateImportRequest.template.nodes.map((node) => ({
        item: cloneTemplateNode(node),
        type: "add",
      }));
    const addEdges: EdgeChange<CanvasEdge>[] =
      templateImportRequest.template.edges.map((edge) => ({
        item: cloneTemplateEdge(edge),
        type: "add",
      }));

    if (removeEdges.length > 0) {
      onEdgesChange(removeEdges);
    }

    if (removeNodes.length > 0) {
      onNodesChange(removeNodes);
    }

    if (addNodes.length > 0) {
      onNodesChange(addNodes);
    }

    if (addEdges.length > 0) {
      onEdgesChange(addEdges);
    }

    window.requestAnimationFrame(() => {
      void reactFlow.fitView({
        duration: 240,
        padding: 0.2,
      });
    });
  }, [
    edges,
    nodes,
    onEdgesChange,
    onNodesChange,
    reactFlow,
    templateImportRequest,
  ]);

  return (
    <div
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      ref={wrapperRef}
    >
      <ReactFlow<CanvasNode, CanvasEdge>
        connectionLineStyle={DEFAULT_CANVAS_EDGE_OPTIONS.style}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={DEFAULT_CANVAS_EDGE_OPTIONS}
        edgeTypes={EDGE_TYPES}
        edges={edges}
        fitView
        nodeTypes={NODE_TYPES}
        nodes={nodes}
        onConnect={handleConnect}
        onDelete={onDelete}
        onEdgesChange={onEdgesChange}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onNodesChange={onNodesChange}
      >
        <Background gap={24} size={1.5} variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <LiveCursors currentUserId={userId} />
      <CanvasPresence />
      <CanvasControlBar />
      <ShapePanel />
    </div>
  );
};

interface FlowCanvasProps {
  onSaveStatusChange?: (state: CanvasAutosaveState) => void;
  projectId: string;
  templateImportRequest?: CanvasTemplateImportRequest | null;
}

const FlowCanvas = ({
  onSaveStatusChange,
  projectId,
  templateImportRequest,
}: FlowCanvasProps) => (
  <ReactFlowProvider>
    <CanvasFlow
      onSaveStatusChange={onSaveStatusChange}
      projectId={projectId}
      templateImportRequest={templateImportRequest}
    />
  </ReactFlowProvider>
);

export { FlowCanvas };
