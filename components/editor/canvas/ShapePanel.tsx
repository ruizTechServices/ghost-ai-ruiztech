"use client";

import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
} from "lucide-react";
import type { ComponentType, DragEvent } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  SHAPE_DEFAULT_SIZES,
  SHAPE_DRAG_MIME,
  type CanvasNodeShape,
  type ShapeDragPayload,
} from "@/types/canvas";

interface ShapeButton {
  Icon: ComponentType<{ className?: string }>;
  label: string;
  shape: CanvasNodeShape;
}

const SHAPE_BUTTONS: ShapeButton[] = [
  { Icon: RectangleHorizontal, label: "Rectangle", shape: "rectangle" },
  { Icon: Diamond, label: "Diamond", shape: "diamond" },
  { Icon: Circle, label: "Circle", shape: "circle" },
  { Icon: Pill, label: "Pill", shape: "pill" },
  { Icon: Cylinder, label: "Cylinder", shape: "cylinder" },
  { Icon: Hexagon, label: "Hexagon", shape: "hexagon" },
];

const ShapePanel = () => {
  const handleDragStart = (
    event: DragEvent<HTMLButtonElement>,
    shape: CanvasNodeShape,
  ): void => {
    const payload: ShapeDragPayload = {
      shape,
      size: SHAPE_DEFAULT_SIZES[shape],
    };
    event.dataTransfer.setData(SHAPE_DRAG_MIME, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-surface-border bg-bg-surface/95 p-1.5 shadow-lg backdrop-blur">
        {SHAPE_BUTTONS.map(({ Icon, label, shape }) => (
          <Tooltip key={shape}>
            <TooltipTrigger
              render={
                <button
                  aria-label={`Drag ${label.toLowerCase()} onto canvas`}
                  className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-bg-subtle hover:text-copy-primary active:cursor-grabbing"
                  draggable
                  onDragStart={(event) => handleDragStart(event, shape)}
                  type="button"
                />
              }
            >
              <Icon className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export { ShapePanel };
