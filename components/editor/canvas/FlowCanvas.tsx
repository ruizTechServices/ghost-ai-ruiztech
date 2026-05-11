"use client";

import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useRef, type DragEvent } from "react";

import "@xyflow/react/dist/style.css";

import { CanvasNodeView } from "@/components/editor/canvas/CanvasNodeView";
import { ShapePanel } from "@/components/editor/canvas/ShapePanel";
import {
  DEFAULT_NODE_COLOR,
  SHAPE_DRAG_MIME,
  type CanvasEdge,
  type CanvasNode,
  type ShapeDragPayload,
} from "@/types/canvas";

const INITIAL_NODES: CanvasNode[] = [];
const INITIAL_EDGES: CanvasEdge[] = [];

const NODE_TYPES = { canvasNode: CanvasNodeView } as const;

let nodeCounter = 0;
const createNodeId = (shape: string): string => {
  nodeCounter += 1;
  return `${shape}-${Date.now()}-${nodeCounter}`;
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

const CanvasFlow = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { screenToFlowPosition } = useReactFlow<CanvasNode, CanvasEdge>();
  const { edges, nodes, onConnect, onDelete, onEdgesChange, onNodesChange } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      edges: { initial: INITIAL_EDGES },
      nodes: { initial: INITIAL_NODES },
      suspense: true,
    });

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const payload = parseDragPayload(event);
      if (!payload) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: CanvasNode = {
        data: {
          color: DEFAULT_NODE_COLOR,
          label: "",
          shape: payload.shape,
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
    [onNodesChange, screenToFlowPosition],
  );

  return (
    <div
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      ref={wrapperRef}
    >
      <ReactFlow<CanvasNode, CanvasEdge>
        connectionMode={ConnectionMode.Loose}
        edges={edges}
        fitView
        nodeTypes={NODE_TYPES}
        nodes={nodes}
        onConnect={onConnect}
        onDelete={onDelete}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
      >
        <Background gap={24} size={1.5} variant={BackgroundVariant.Dots} />
        <MiniMap pannable zoomable />
      </ReactFlow>
      <ShapePanel />
    </div>
  );
};

const FlowCanvas = () => (
  <ReactFlowProvider>
    <CanvasFlow />
  </ReactFlowProvider>
);

export { FlowCanvas };
