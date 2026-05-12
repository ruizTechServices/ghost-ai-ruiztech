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
  textColor?: string;
}

type CanvasNode = Node<CanvasNodeData, "canvasNode">;

interface CanvasEdgeData extends Record<string, unknown> {
  label?: string;
}

type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">;

interface CanvasNodeSize {
  height: number;
  width: number;
}

interface ShapeDragPayload {
  shape: CanvasNodeShape;
  size: CanvasNodeSize;
}

interface CanvasNodeColorPair {
  color: string;
  id: string;
  label: string;
  textColor: string;
}

const SHAPE_DRAG_MIME = "application/x-canvas-shape";

const NODE_COLORS: CanvasNodeColorPair[] = [
  { color: "#1F1F1F", id: "neutral", label: "Neutral", textColor: "#EDEDED" },
  { color: "#10233D", id: "blue", label: "Blue", textColor: "#52A8FF" },
  { color: "#2E1938", id: "purple", label: "Purple", textColor: "#BF7AF0" },
  { color: "#331B00", id: "orange", label: "Orange", textColor: "#FF990A" },
  { color: "#3C1618", id: "red", label: "Red", textColor: "#FF6166" },
  { color: "#3A1726", id: "pink", label: "Pink", textColor: "#F75F8F" },
  { color: "#0F2E18", id: "green", label: "Green", textColor: "#62C073" },
  { color: "#062822", id: "teal", label: "Teal", textColor: "#0AC7B4" },
];

const DEFAULT_NODE_COLOR_PAIR = NODE_COLORS[0];
const DEFAULT_NODE_COLOR = DEFAULT_NODE_COLOR_PAIR.color;
const DEFAULT_NODE_TEXT_COLOR = DEFAULT_NODE_COLOR_PAIR.textColor;

const SHAPE_DEFAULT_SIZES: Record<CanvasNodeShape, CanvasNodeSize> = {
  circle: { height: 140, width: 140 },
  cylinder: { height: 120, width: 160 },
  diamond: { height: 160, width: 200 },
  hexagon: { height: 140, width: 180 },
  pill: { height: 80, width: 200 },
  rectangle: { height: 100, width: 180 },
};

const getCanvasNodeColorPair = (
  color?: string,
  textColor?: string,
): CanvasNodeColorPair => {
  const exactPair = NODE_COLORS.find(
    (option) => option.color === color && option.textColor === textColor,
  );
  if (exactPair) return exactPair;

  const colorPair = NODE_COLORS.find((option) => option.color === color);
  return colorPair ?? DEFAULT_NODE_COLOR_PAIR;
};

export {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_TEXT_COLOR,
  getCanvasNodeColorPair,
  NODE_COLORS,
  SHAPE_DEFAULT_SIZES,
  SHAPE_DRAG_MIME,
};
export type {
  CanvasEdge,
  CanvasEdgeData,
  CanvasNode,
  CanvasNodeColorPair,
  CanvasNodeData,
  CanvasNodeShape,
  CanvasNodeSize,
  ShapeDragPayload,
};
