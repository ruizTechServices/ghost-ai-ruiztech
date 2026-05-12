"use client";

import { type ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SHAPE_DEFAULT_SIZES, type CanvasNode } from "@/types/canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

interface StarterTemplatesModalProps {
  onImport: (template: CanvasTemplate) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  templates: CanvasTemplate[];
}

interface NodeBox {
  centerX: number;
  centerY: number;
  height: number;
  node: CanvasNode;
  width: number;
  x: number;
  y: number;
}

interface ProjectedBox extends NodeBox {
  previewCenterX: number;
  previewCenterY: number;
  previewHeight: number;
  previewWidth: number;
  previewX: number;
  previewY: number;
}

const PREVIEW_HEIGHT = 150;
const PREVIEW_PADDING = 18;
const PREVIEW_WIDTH = 320;

const getNumericSize = (
  value: string | number | undefined,
  fallback: number,
): number => (typeof value === "number" ? value : fallback);

const getNodeBox = (node: CanvasNode): NodeBox => {
  const defaultSize = SHAPE_DEFAULT_SIZES[node.data.shape];
  const width = getNumericSize(node.style?.width, defaultSize.width);
  const height = getNumericSize(node.style?.height, defaultSize.height);

  return {
    centerX: node.position.x + width / 2,
    centerY: node.position.y + height / 2,
    height,
    node,
    width,
    x: node.position.x,
    y: node.position.y,
  };
};

const getPreviewBoxes = (nodes: CanvasNode[]): ProjectedBox[] => {
  const boxes = nodes.map(getNodeBox);
  if (boxes.length === 0) return [];

  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));
  const contentWidth = Math.max(maxX - minX, 1);
  const contentHeight = Math.max(maxY - minY, 1);
  const scale = Math.min(
    (PREVIEW_WIDTH - PREVIEW_PADDING * 2) / contentWidth,
    (PREVIEW_HEIGHT - PREVIEW_PADDING * 2) / contentHeight,
  );
  const offsetX = (PREVIEW_WIDTH - contentWidth * scale) / 2;
  const offsetY = (PREVIEW_HEIGHT - contentHeight * scale) / 2;

  return boxes.map((box) => {
    const previewX = offsetX + (box.x - minX) * scale;
    const previewY = offsetY + (box.y - minY) * scale;
    const previewWidth = box.width * scale;
    const previewHeight = box.height * scale;

    return {
      ...box,
      previewCenterX: previewX + previewWidth / 2,
      previewCenterY: previewY + previewHeight / 2,
      previewHeight,
      previewWidth,
      previewX,
      previewY,
    };
  });
};

const getPolygonPoints = (
  points: Array<[number, number]>,
  box: ProjectedBox,
): string =>
  points
    .map(
      ([x, y]) =>
        `${box.previewX + x * box.previewWidth},${box.previewY + y * box.previewHeight}`,
    )
    .join(" ");

const renderPreviewShape = (box: ProjectedBox): ReactNode => {
  const fill = box.node.data.color;
  const stroke = box.node.data.textColor ?? "var(--border-subtle)";
  const strokeWidth = 1.4;

  if (box.node.data.shape === "circle") {
    return (
      <ellipse
        cx={box.previewCenterX}
        cy={box.previewCenterY}
        fill={fill}
        rx={box.previewWidth / 2}
        ry={box.previewHeight / 2}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (box.node.data.shape === "pill") {
    return (
      <rect
        fill={fill}
        height={box.previewHeight}
        rx={box.previewHeight / 2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        width={box.previewWidth}
        x={box.previewX}
        y={box.previewY}
      />
    );
  }

  if (box.node.data.shape === "diamond") {
    return (
      <polygon
        fill={fill}
        points={getPolygonPoints(
          [
            [0.5, 0],
            [1, 0.5],
            [0.5, 1],
            [0, 0.5],
          ],
          box,
        )}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (box.node.data.shape === "hexagon") {
    return (
      <polygon
        fill={fill}
        points={getPolygonPoints(
          [
            [0.22, 0],
            [0.78, 0],
            [1, 0.5],
            [0.78, 1],
            [0.22, 1],
            [0, 0.5],
          ],
          box,
        )}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (box.node.data.shape === "cylinder") {
    const capHeight = Math.min(box.previewHeight * 0.28, 14);

    return (
      <g>
        <path
          d={[
            `M ${box.previewX} ${box.previewY + capHeight / 2}`,
            `V ${box.previewY + box.previewHeight - capHeight / 2}`,
            `C ${box.previewX} ${box.previewY + box.previewHeight + capHeight / 2}`,
            `${box.previewX + box.previewWidth} ${box.previewY + box.previewHeight + capHeight / 2}`,
            `${box.previewX + box.previewWidth} ${box.previewY + box.previewHeight - capHeight / 2}`,
            `V ${box.previewY + capHeight / 2}`,
            "Z",
          ].join(" ")}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <ellipse
          cx={box.previewCenterX}
          cy={box.previewY + capHeight / 2}
          fill={fill}
          rx={box.previewWidth / 2}
          ry={capHeight / 2}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </g>
    );
  }

  return (
    <rect
      fill={fill}
      height={box.previewHeight}
      rx={4}
      stroke={stroke}
      strokeWidth={strokeWidth}
      width={box.previewWidth}
      x={box.previewX}
      y={box.previewY}
    />
  );
};

const TemplatePreview = ({ template }: { template: CanvasTemplate }) => {
  const boxes = getPreviewBoxes(template.nodes);
  const boxById = new Map(boxes.map((box) => [box.node.id, box]));

  return (
    <svg
      aria-hidden="true"
      className="h-36 w-full rounded-xl border border-surface-border bg-bg-base"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
    >
      {template.edges.map((edge) => {
        const source = boxById.get(edge.source);
        const target = boxById.get(edge.target);
        if (!source || !target) return null;

        return (
          <line
            key={edge.id}
            stroke="var(--canvas-edge-rest)"
            strokeLinecap="round"
            strokeWidth={1.4}
            x1={source.previewCenterX}
            x2={target.previewCenterX}
            y1={source.previewCenterY}
            y2={target.previewCenterY}
          />
        );
      })}
      {boxes.map((box) => (
        <g key={box.node.id}>{renderPreviewShape(box)}</g>
      ))}
    </svg>
  );
};

const StarterTemplatesModal = ({
  onImport,
  onOpenChange,
  open,
  templates,
}: StarterTemplatesModalProps) => {
  const handleImport = (template: CanvasTemplate): void => {
    onImport(template);
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl rounded-3xl border border-surface-border bg-bg-surface p-0 text-copy-primary sm:max-w-4xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg text-copy-primary">
            Starter templates
          </DialogTitle>
          <DialogDescription className="text-copy-muted">
            Replace the current canvas with a predefined architecture diagram.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[min(68vh,620px)] px-6 pb-6">
          <div className="grid gap-4 pb-1 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <article
                className="flex min-h-0 flex-col gap-3 rounded-2xl border border-surface-border bg-bg-elevated/70 p-3"
                key={template.id}
              >
                <TemplatePreview template={template} />
                <div className="min-h-24">
                  <h3 className="text-sm font-semibold tracking-normal text-copy-primary">
                    {template.name}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-copy-muted">
                    {template.description}
                  </p>
                </div>
                <Button
                  className="mt-auto rounded-xl"
                  onClick={() => handleImport(template)}
                  type="button"
                >
                  Import
                </Button>
              </article>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export { StarterTemplatesModal };
