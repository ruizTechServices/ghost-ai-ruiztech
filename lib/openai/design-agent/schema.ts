import type { JsonSchema } from "@/lib/openai/responses";
import { NODE_COLORS, SHAPE_DEFAULT_SIZES } from "@/types/canvas";

const actionTypes = [
  "add_node",
  "move_node",
  "resize_node",
  "update_node_data",
  "delete_node",
  "add_edge",
  "delete_edge",
] as const;

const nodeShapes = Object.keys(SHAPE_DEFAULT_SIZES);
const nodeFillColors = NODE_COLORS.map((color) => color.color);
const nodeTextColors = NODE_COLORS.map((color) => color.textColor);

const nullableString = { type: ["string", "null"] };

const nullablePosition = {
  additionalProperties: false,
  properties: {
    x: { type: "number" },
    y: { type: "number" },
  },
  required: ["x", "y"],
  type: ["object", "null"],
};

const nullableSize = {
  additionalProperties: false,
  properties: {
    height: { minimum: 40, type: "number" },
    width: { minimum: 40, type: "number" },
  },
  required: ["height", "width"],
  type: ["object", "null"],
};

const nullableNodeDraft = {
  additionalProperties: false,
  properties: {
    color: { enum: nodeFillColors, type: "string" },
    id: { type: "string" },
    label: { type: "string" },
    position: {
      additionalProperties: false,
      properties: {
        x: { type: "number" },
        y: { type: "number" },
      },
      required: ["x", "y"],
      type: "object",
    },
    shape: { enum: nodeShapes, type: "string" },
    size: {
      additionalProperties: false,
      properties: {
        height: { minimum: 40, type: "number" },
        width: { minimum: 40, type: "number" },
      },
      required: ["height", "width"],
      type: "object",
    },
    textColor: { enum: nodeTextColors, type: "string" },
  },
  required: ["id", "label", "shape", "color", "textColor", "position", "size"],
  type: ["object", "null"],
};

const nullableNodeDataPatch = {
  additionalProperties: false,
  properties: {
    color: { enum: [...nodeFillColors, null] },
    label: { type: ["string", "null"] },
    shape: { enum: [...nodeShapes, null] },
    textColor: { enum: [...nodeTextColors, null] },
  },
  required: ["label", "shape", "color", "textColor"],
  type: ["object", "null"],
};

const nullableEdgeDraft = {
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    label: nullableString,
    source: { type: "string" },
    sourceHandle: nullableString,
    target: { type: "string" },
    targetHandle: nullableString,
  },
  required: ["id", "source", "target", "sourceHandle", "targetHandle", "label"],
  type: ["object", "null"],
};

const designAgentPlanSchema: JsonSchema = {
  additionalProperties: false,
  properties: {
    actions: {
      items: {
        additionalProperties: false,
        properties: {
          action: { enum: actionTypes, type: "string" },
          data: nullableNodeDataPatch,
          edge: nullableEdgeDraft,
          edgeId: nullableString,
          node: nullableNodeDraft,
          nodeId: nullableString,
          position: nullablePosition,
          size: nullableSize,
        },
        required: [
          "action",
          "node",
          "nodeId",
          "edge",
          "edgeId",
          "position",
          "size",
          "data",
        ],
        type: "object",
      },
      maxItems: 40,
      minItems: 1,
      type: "array",
    },
    statusMessages: {
      items: {
        maxLength: 140,
        type: "string",
      },
      maxItems: 5,
      minItems: 1,
      type: "array",
    },
    summary: {
      maxLength: 500,
      type: "string",
    },
  },
  required: ["summary", "statusMessages", "actions"],
  type: "object",
};

export { actionTypes, designAgentPlanSchema, nodeFillColors, nodeShapes };
