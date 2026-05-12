"use client";

import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
} from "lucide-react";
import { useEffect, useState, type ComponentType, type DragEvent } from "react";

import { CanvasShapeView } from "@/components/editor/canvas/CanvasShapeView";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DEFAULT_NODE_COLOR,
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

interface DragPreviewState {
  payload: ShapeDragPayload;
  x: number;
  y: number;
}

const SHAPE_BUTTONS: ShapeButton[] = [
  { Icon: RectangleHorizontal, label: "Rectangle", shape: "rectangle" },
  { Icon: Diamond, label: "Diamond", shape: "diamond" },
  { Icon: Circle, label: "Circle", shape: "circle" },
  { Icon: Pill, label: "Pill", shape: "pill" },
  { Icon: Cylinder, label: "Cylinder", shape: "cylinder" },
  { Icon: Hexagon, label: "Hexagon", shape: "hexagon" },
];

const setTransparentDragImage = (event: DragEvent<HTMLButtonElement>): void => {
  const dragImage = document.createElement("canvas");
  dragImage.width = 1;
  dragImage.height = 1;
  event.dataTransfer.setDragImage(dragImage, 0, 0);
};

const ShapePanel = () => {
  const [dragPreview, setDragPreview] = useState<DragPreviewState | null>(null);
  const hasDragPreview = dragPreview !== null;

  useEffect(() => {
    if (!hasDragPreview) return;

    const updatePreviewPosition = (event: globalThis.DragEvent): void => {
      if (event.clientX === 0 && event.clientY === 0) return;

      setDragPreview((current) =>
        current
          ? {
              ...current,
              x: event.clientX,
              y: event.clientY,
            }
          : current,
      );
    };

    const clearPreview = (): void => {
      setDragPreview(null);
    };

    window.addEventListener("dragover", updatePreviewPosition);
    window.addEventListener("drop", clearPreview);
    window.addEventListener("dragend", clearPreview);

    return () => {
      window.removeEventListener("dragover", updatePreviewPosition);
      window.removeEventListener("drop", clearPreview);
      window.removeEventListener("dragend", clearPreview);
    };
  }, [hasDragPreview]);

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
    setTransparentDragImage(event);
    setDragPreview({
      payload,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleDrag = (event: DragEvent<HTMLButtonElement>): void => {
    if (event.clientX === 0 && event.clientY === 0) return;

    setDragPreview((current) =>
      current
        ? {
            ...current,
            x: event.clientX,
            y: event.clientY,
          }
        : current,
    );
  };

  const handleDragEnd = (): void => {
    setDragPreview(null);
  };

  return (
    <>
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
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
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

      {dragPreview ? (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            height: dragPreview.payload.size.height,
            left: dragPreview.x,
            top: dragPreview.y,
            width: dragPreview.payload.size.width,
          }}
        >
          <CanvasShapeView
            color={DEFAULT_NODE_COLOR}
            preview
            shape={dragPreview.payload.shape}
          />
        </div>
      ) : null}
    </>
  );
};

export { ShapePanel };
