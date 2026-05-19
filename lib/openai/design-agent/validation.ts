import {
  NODE_COLORS,
  SHAPE_DEFAULT_SIZES,
  type CanvasNodeShape,
  type CanvasNodeSize,
} from "@/types/canvas";

import type {
  DesignAgentAction,
  DesignAgentEdgeDraft,
  DesignAgentNodeDataPatch,
  DesignAgentNodeDraft,
  DesignAgentPlan,
  DesignAgentPosition,
} from "@/lib/openai/design-agent/types";

const actionTypes = new Set([
  "add_node",
  "move_node",
  "resize_node",
  "update_node_data",
  "delete_node",
  "add_edge",
  "delete_edge",
]);

const nodeShapes = new Set(Object.keys(SHAPE_DEFAULT_SIZES));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string =>
  typeof value === "string";

const isNonEmptyString = (value: unknown): value is string =>
  isString(value) && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isNullableString = (value: unknown): value is string | null =>
  value === null || isString(value);

const isCanvasNodeShape = (value: unknown): value is CanvasNodeShape =>
  isString(value) && nodeShapes.has(value);

const isPosition = (value: unknown): value is DesignAgentPosition =>
  isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y);

const isSize = (value: unknown): value is CanvasNodeSize =>
  isRecord(value) &&
  isFiniteNumber(value.height) &&
  value.height >= 40 &&
  isFiniteNumber(value.width) &&
  value.width >= 40;

const isValidColorPair = (color: unknown, textColor: unknown): boolean =>
  isString(color) &&
  isString(textColor) &&
  NODE_COLORS.some(
    (option) => option.color === color && option.textColor === textColor,
  );

const isNodeDraft = (value: unknown): value is DesignAgentNodeDraft =>
  isRecord(value) &&
  isNonEmptyString(value.id) &&
  isString(value.label) &&
  isCanvasNodeShape(value.shape) &&
  isValidColorPair(value.color, value.textColor) &&
  isPosition(value.position) &&
  isSize(value.size);

const isEdgeDraft = (value: unknown): value is DesignAgentEdgeDraft =>
  isRecord(value) &&
  isNonEmptyString(value.id) &&
  isNonEmptyString(value.source) &&
  isNonEmptyString(value.target) &&
  isNullableString(value.sourceHandle) &&
  isNullableString(value.targetHandle) &&
  isNullableString(value.label);

const isNullableCanvasNodeShape = (
  value: unknown,
): value is CanvasNodeShape | null => value === null || isCanvasNodeShape(value);

const isNullableColorPairPatch = (value: Record<string, unknown>): boolean => {
  if (value.color === null && value.textColor === null) return true;
  return isValidColorPair(value.color, value.textColor);
};

const isNodeDataPatch = (
  value: unknown,
): value is DesignAgentNodeDataPatch =>
  isRecord(value) &&
  (value.label === null || isString(value.label)) &&
  isNullableCanvasNodeShape(value.shape) &&
  isNullableColorPairPatch(value);

const isDesignAgentAction = (value: unknown): value is DesignAgentAction => {
  if (!isRecord(value) || !isString(value.action)) return false;
  if (!actionTypes.has(value.action)) return false;

  switch (value.action) {
    case "add_node":
      return isNodeDraft(value.node);
    case "move_node":
      return isNonEmptyString(value.nodeId) && isPosition(value.position);
    case "resize_node":
      return isNonEmptyString(value.nodeId) && isSize(value.size);
    case "update_node_data":
      return isNonEmptyString(value.nodeId) && isNodeDataPatch(value.data);
    case "delete_node":
      return isNonEmptyString(value.nodeId);
    case "add_edge":
      return isEdgeDraft(value.edge);
    case "delete_edge":
      return isNonEmptyString(value.edgeId);
  }

  return false;
};

const isDesignAgentPlan = (value: unknown): value is DesignAgentPlan =>
  isRecord(value) &&
  isString(value.summary) &&
  Array.isArray(value.statusMessages) &&
  value.statusMessages.length > 0 &&
  value.statusMessages.length <= 5 &&
  value.statusMessages.every(isString) &&
  Array.isArray(value.actions) &&
  value.actions.length > 0 &&
  value.actions.length <= 40 &&
  value.actions.every(isDesignAgentAction);

export { isDesignAgentPlan };
