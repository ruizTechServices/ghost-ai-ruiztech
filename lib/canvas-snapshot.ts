import type { CanvasEdge, CanvasNode, CanvasNodeShape } from "@/types/canvas";

interface CanvasSnapshot {
  edges: CanvasEdge[];
  nodes: CanvasNode[];
}

const canvasNodeShapes: readonly CanvasNodeShape[] = [
  "circle",
  "cylinder",
  "diamond",
  "hexagon",
  "pill",
  "rectangle",
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isOptionalStringOrNull = (value: unknown): boolean =>
  value === undefined || value === null || typeof value === "string";

const isCanvasNodeShape = (value: unknown): value is CanvasNodeShape =>
  typeof value === "string" &&
  canvasNodeShapes.includes(value as CanvasNodeShape);

const isCanvasNode = (value: unknown): value is CanvasNode => {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || value.id.trim().length === 0) {
    return false;
  }
  if (value.type !== "canvasNode") return false;
  if (!isRecord(value.position)) return false;
  if (!isFiniteNumber(value.position.x) || !isFiniteNumber(value.position.y)) {
    return false;
  }
  if (!isRecord(value.data)) return false;
  if (typeof value.data.label !== "string") return false;
  if (typeof value.data.color !== "string") return false;
  if (!isCanvasNodeShape(value.data.shape)) return false;
  if (
    value.data.textColor !== undefined &&
    typeof value.data.textColor !== "string"
  ) {
    return false;
  }

  return true;
};

const isCanvasEdge = (value: unknown): value is CanvasEdge => {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || value.id.trim().length === 0) {
    return false;
  }
  if (value.type !== "canvasEdge") return false;
  if (typeof value.source !== "string" || value.source.trim().length === 0) {
    return false;
  }
  if (typeof value.target !== "string" || value.target.trim().length === 0) {
    return false;
  }
  if (!isOptionalStringOrNull(value.sourceHandle)) return false;
  if (!isOptionalStringOrNull(value.targetHandle)) return false;

  if (value.data !== undefined) {
    if (!isRecord(value.data)) return false;
    if (
      value.data.label !== undefined &&
      typeof value.data.label !== "string"
    ) {
      return false;
    }
  }

  return true;
};

const parseCanvasSnapshot = (value: unknown): CanvasSnapshot => {
  if (!isRecord(value)) {
    throw new Error("Canvas payload must be a JSON object.");
  }

  if (!Array.isArray(value.nodes) || !Array.isArray(value.edges)) {
    throw new Error("Canvas payload must include nodes and edges arrays.");
  }

  if (!value.nodes.every(isCanvasNode)) {
    throw new Error("Canvas nodes are malformed.");
  }

  if (!value.edges.every(isCanvasEdge)) {
    throw new Error("Canvas edges are malformed.");
  }

  return {
    edges: value.edges,
    nodes: value.nodes,
  };
};

export { parseCanvasSnapshot };
export type { CanvasSnapshot };
