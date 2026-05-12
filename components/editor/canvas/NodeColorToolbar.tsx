"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import {
  useState,
  type MouseEvent,
  type PointerEvent,
  type SyntheticEvent,
} from "react";

import { cn } from "@/lib/utils";
import {
  NODE_COLORS,
  type CanvasNodeColorPair,
} from "@/types/canvas";

interface NodeColorToolbarProps {
  activeColor: string;
  activeTextColor: string;
  nodeId: string;
  onSelectColor: (colorPair: CanvasNodeColorPair) => void;
  selected: boolean;
}

const stopToolbarInteraction = (event: SyntheticEvent): void => {
  event.stopPropagation();
};

const getGlowColor = (color: string): string =>
  color.startsWith("#") && color.length === 7 ? `${color}66` : color;

const NodeColorToolbar = ({
  activeColor,
  activeTextColor,
  nodeId,
  onSelectColor,
  selected,
}: NodeColorToolbarProps) => {
  const [hoveredColorId, setHoveredColorId] = useState<string | null>(null);

  const handlePointerDown = (
    event: PointerEvent<HTMLButtonElement>,
  ): void => {
    event.stopPropagation();
  };

  const handleSelectColor = (
    event: MouseEvent<HTMLButtonElement>,
    colorPair: CanvasNodeColorPair,
  ): void => {
    event.stopPropagation();
    onSelectColor(colorPair);
  };

  return (
    <NodeToolbar
      align="center"
      className="nodrag nopan nowheel"
      isVisible={selected}
      nodeId={nodeId}
      offset={12}
      onClick={stopToolbarInteraction}
      onDoubleClick={stopToolbarInteraction}
      onMouseDown={stopToolbarInteraction}
      onPointerDown={stopToolbarInteraction}
      position={Position.Top}
    >
      <div className="flex items-center gap-1 rounded-full border border-surface-border bg-bg-surface/95 p-1.5 shadow-lg backdrop-blur">
        {NODE_COLORS.map((colorPair) => {
          const isActive =
            colorPair.color === activeColor &&
            colorPair.textColor === activeTextColor;
          const isHovered = hoveredColorId === colorPair.id;
          const boxShadow = isActive
            ? `0 0 0 2px ${colorPair.textColor}`
            : isHovered
              ? `0 0 0 3px ${getGlowColor(colorPair.textColor)}`
              : undefined;

          return (
            <button
              aria-label={`Use ${colorPair.label.toLowerCase()} node color`}
              aria-pressed={isActive}
              className={cn(
                "nodrag nopan nowheel flex h-6 w-6 items-center justify-center rounded-full border p-0.5 transition-shadow",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface",
              )}
              draggable={false}
              key={colorPair.id}
              onClick={(event) => handleSelectColor(event, colorPair)}
              onDoubleClick={stopToolbarInteraction}
              onMouseDown={stopToolbarInteraction}
              onPointerDown={handlePointerDown}
              onPointerEnter={() => setHoveredColorId(colorPair.id)}
              onPointerLeave={() => setHoveredColorId(null)}
              style={{
                borderColor: isActive
                  ? colorPair.textColor
                  : "var(--border-subtle)",
                boxShadow,
              }}
              type="button"
            >
              <span
                aria-hidden="true"
                className="h-full w-full rounded-full border"
                style={{
                  backgroundColor: colorPair.color,
                  borderColor: colorPair.textColor,
                }}
              />
            </button>
          );
        })}
      </div>
    </NodeToolbar>
  );
};

export { NodeColorToolbar };
