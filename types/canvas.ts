import type { Edge, Node } from "@xyflow/react";

type CanvasNodeShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon";

interface CanvasNodeData extends Record<string, unknown> {
  color: string;
  label: string;
  shape: CanvasNodeShape;
}

type CanvasNode = Node<CanvasNodeData, "canvasNode">;

interface CanvasEdgeData extends Record<string, unknown> {}

type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">;

interface CanvasNodeSize {
  height: number;
  width: number;
}

interface ShapeDragPayload {
  shape: CanvasNodeShape;
  size: CanvasNodeSize;
}

const SHAPE_DRAG_MIME = "application/x-canvas-shape";

const DEFAULT_NODE_COLOR = "#1F2937";

const SHAPE_DEFAULT_SIZES: Record<CanvasNodeShape, CanvasNodeSize> = {
  circle: { height: 140, width: 140 },
  cylinder: { height: 120, width: 160 },
  diamond: { height: 160, width: 200 },
  hexagon: { height: 140, width: 180 },
  pill: { height: 80, width: 200 },
  rectangle: { height: 100, width: 180 },
};

export {
  DEFAULT_NODE_COLOR,
  SHAPE_DEFAULT_SIZES,
  SHAPE_DRAG_MIME,
};
export type {
  CanvasEdge,
  CanvasEdgeData,
  CanvasNode,
  CanvasNodeData,
  CanvasNodeShape,
  CanvasNodeSize,
  ShapeDragPayload,
};
