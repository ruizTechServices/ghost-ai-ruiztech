import type { CanvasEdge, CanvasNode, CanvasNodeShape } from "@/types/canvas";
import {
  getCanvasNodeColorPair,
  SHAPE_DEFAULT_SIZES,
} from "@/types/canvas";

type CanvasTemplate = {
  description: string;
  edges: CanvasEdge[];
  id: string;
  name: string;
  nodes: CanvasNode[];
};

type CanvasTemplateImportRequest = {
  id: number;
  template: CanvasTemplate;
};

const colorPair = (id: string) =>
  getCanvasNodeColorPair(
    {
      blue: "#10233D",
      green: "#0F2E18",
      neutral: "#1F1F1F",
      orange: "#331B00",
      pink: "#3A1726",
      purple: "#2E1938",
      red: "#3C1618",
      teal: "#062822",
    }[id],
  );

const templateNode = (
  id: string,
  label: string,
  shape: CanvasNodeShape,
  x: number,
  y: number,
  colorId: string,
): CanvasNode => {
  const colors = colorPair(colorId);
  const size = SHAPE_DEFAULT_SIZES[shape];

  return {
    data: {
      color: colors.color,
      label,
      shape,
      textColor: colors.textColor,
    },
    id,
    position: { x, y },
    style: {
      height: size.height,
      width: size.width,
    },
    type: "canvasNode",
  };
};

const templateEdge = (
  id: string,
  source: string,
  target: string,
  label: string,
  sourceHandle = "right",
  targetHandle = "left",
): CanvasEdge => ({
  data: { label },
  id,
  interactionWidth: 28,
  markerEnd: {
    color: "var(--canvas-edge)",
    height: 18,
    type: "arrowclosed",
    width: 18,
  },
  source,
  sourceHandle,
  style: {
    stroke: "var(--canvas-edge-rest)",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.8,
  },
  target,
  targetHandle,
  type: "canvasEdge",
});

const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    description:
      "A service-oriented product stack with API gateway, services, database, cache, and event bus.",
    edges: [
      templateEdge("microservices-client-api", "client", "api-gateway", "HTTPS"),
      templateEdge("microservices-api-auth", "api-gateway", "auth-service", "auth"),
      templateEdge("microservices-api-orders", "api-gateway", "order-service", "REST"),
      templateEdge("microservices-api-billing", "api-gateway", "billing-service", "REST"),
      templateEdge("microservices-orders-db", "order-service", "orders-db", "SQL", "bottom", "top"),
      templateEdge("microservices-orders-events", "order-service", "event-bus", "events", "right", "left"),
      templateEdge("microservices-billing-events", "billing-service", "event-bus", "events", "right", "left"),
      templateEdge("microservices-api-cache", "api-gateway", "cache", "cache", "bottom", "top"),
    ],
    id: "microservices",
    name: "Microservices Platform",
    nodes: [
      templateNode("client", "Web / Mobile", "hexagon", 0, 130, "teal"),
      templateNode("api-gateway", "API Gateway", "pill", 260, 130, "blue"),
      templateNode("auth-service", "Auth Service", "rectangle", 540, 20, "purple"),
      templateNode("order-service", "Order Service", "rectangle", 540, 130, "green"),
      templateNode("billing-service", "Billing Service", "rectangle", 540, 250, "orange"),
      templateNode("orders-db", "Orders DB", "cylinder", 820, 125, "teal"),
      templateNode("event-bus", "Event Bus", "pill", 820, 270, "pink"),
      templateNode("cache", "Cache", "cylinder", 270, 300, "neutral"),
    ],
  },
  {
    description:
      "A delivery pipeline from commit to build, test, artifact storage, deployment, and monitoring.",
    edges: [
      templateEdge("cicd-git-build", "source-control", "build", "push"),
      templateEdge("cicd-build-test", "build", "test", "artifact"),
      templateEdge("cicd-test-gate", "test", "quality-gate", "results"),
      templateEdge("cicd-gate-registry", "quality-gate", "artifact-registry", "publish", "right", "left"),
      templateEdge("cicd-registry-deploy", "artifact-registry", "deploy", "image"),
      templateEdge("cicd-deploy-prod", "deploy", "production", "release"),
      templateEdge("cicd-prod-monitor", "production", "monitoring", "metrics", "bottom", "top"),
    ],
    id: "ci-cd",
    name: "CI/CD Pipeline",
    nodes: [
      templateNode("source-control", "Source Control", "hexagon", 0, 120, "purple"),
      templateNode("build", "Build", "pill", 250, 120, "blue"),
      templateNode("test", "Test Suite", "pill", 500, 120, "green"),
      templateNode("quality-gate", "Quality Gate", "diamond", 760, 85, "orange"),
      templateNode("artifact-registry", "Artifact Registry", "cylinder", 1020, 115, "teal"),
      templateNode("deploy", "Deploy", "pill", 1280, 120, "pink"),
      templateNode("production", "Production", "rectangle", 1530, 120, "red"),
      templateNode("monitoring", "Monitoring", "rectangle", 1530, 300, "neutral"),
    ],
  },
  {
    description:
      "An asynchronous architecture with producers, event streaming, consumers, projections, and notifications.",
    edges: [
      templateEdge("event-app-stream", "producer-app", "event-stream", "publish"),
      templateEdge("event-webhook-stream", "webhook-source", "event-stream", "ingest"),
      templateEdge("event-stream-router", "event-stream", "event-router", "route"),
      templateEdge("event-router-worker", "event-router", "worker", "commands"),
      templateEdge("event-router-projection", "event-router", "projection-service", "events"),
      templateEdge("event-worker-db", "worker", "operational-store", "write", "bottom", "top"),
      templateEdge("event-projection-read", "projection-service", "read-model", "project", "bottom", "top"),
      templateEdge("event-router-notify", "event-router", "notification-service", "notify", "right", "left"),
    ],
    id: "event-driven",
    name: "Event-Driven System",
    nodes: [
      templateNode("producer-app", "Producer App", "rectangle", 0, 70, "blue"),
      templateNode("webhook-source", "Webhook Source", "hexagon", 0, 250, "purple"),
      templateNode("event-stream", "Event Stream", "pill", 280, 160, "pink"),
      templateNode("event-router", "Event Router", "diamond", 560, 120, "orange"),
      templateNode("worker", "Worker", "rectangle", 860, 40, "green"),
      templateNode("projection-service", "Projection Service", "rectangle", 860, 190, "teal"),
      templateNode("notification-service", "Notifications", "pill", 860, 350, "red"),
      templateNode("operational-store", "Operational Store", "cylinder", 1160, 35, "neutral"),
      templateNode("read-model", "Read Model", "cylinder", 1160, 190, "blue"),
    ],
  },
];

export { CANVAS_TEMPLATES };
export type { CanvasTemplate, CanvasTemplateImportRequest };
