import "server-only";

import { createStructuredResponse } from "@/lib/openai/responses";
import { NODE_COLORS, SHAPE_DEFAULT_SIZES } from "@/types/canvas";

import { designAgentPlanSchema } from "@/lib/openai/design-agent/schema";
import type {
  DesignAgentCanvasContext,
  DesignAgentCanvasEdgeInput,
  DesignAgentCanvasNodeInput,
  DesignAgentPlan,
} from "@/lib/openai/design-agent/types";
import { isDesignAgentPlan } from "@/lib/openai/design-agent/validation";

const DESIGN_AGENT_INSTRUCTIONS = [
  "You are the planning layer for a collaborative system-design canvas.",
  "Return only a structured JSON action plan that can be applied by server-side canvas mutation code.",
  "Use existing node IDs when updating, moving, resizing, or deleting current nodes.",
  "Use readable labels, allowed shapes, and one of the provided color/text-color pairs.",
  "Keep new nodes spaced out in a left-to-right architecture layout with minimal edge crossings.",
  "Do not describe implementation details outside the structured response.",
].join("\n");

const toNodeInput = (node: DesignAgentCanvasContext["nodes"][number]) => {
  const input: DesignAgentCanvasNodeInput = {
    data: node.data,
    id: node.id,
    position: node.position,
  };

  if (typeof node.width === "number") input.width = node.width;
  if (typeof node.height === "number") input.height = node.height;

  return input;
};

const toEdgeInput = (edge: DesignAgentCanvasContext["edges"][number]) => {
  const input: DesignAgentCanvasEdgeInput = {
    id: edge.id,
    source: edge.source,
    target: edge.target,
  };

  if (edge.data?.label) {
    input.data = { label: edge.data.label };
  }

  return input;
};

const buildDesignAgentInput = ({
  edges,
  nodes,
  projectId,
  prompt,
  roomId,
}: DesignAgentCanvasContext): string =>
  JSON.stringify({
    allowedNodeColors: NODE_COLORS.map(({ color, id, label, textColor }) => ({
      color,
      id,
      label,
      textColor,
    })),
    allowedNodeShapes: Object.keys(SHAPE_DEFAULT_SIZES),
    canvas: {
      edges: edges.map(toEdgeInput),
      nodes: nodes.map(toNodeInput),
    },
    projectId,
    prompt,
    roomId,
  });

const createDesignAgentPlan = async (
  context: DesignAgentCanvasContext,
) =>
  createStructuredResponse<DesignAgentPlan>({
    input: buildDesignAgentInput(context),
    instructions: DESIGN_AGENT_INSTRUCTIONS,
    maxOutputTokens: 8_000,
    metadata: {
      feature: "design-agent-plan",
      projectId: context.projectId,
      roomId: context.roomId,
    },
    safetyIdentifier: context.userId,
    schema: {
      description:
        "A validated list of canvas actions for the Ghost AI design agent.",
      name: "design_agent_plan",
      schema: designAgentPlanSchema,
    },
    validate: isDesignAgentPlan,
  });

export { buildDesignAgentInput, createDesignAgentPlan, DESIGN_AGENT_INSTRUCTIONS };
