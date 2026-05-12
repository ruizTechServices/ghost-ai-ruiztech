import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import type { CanvasNodeShape } from "@/types/canvas";

interface CanvasShapeViewProps {
  className?: string;
  color: string;
  label?: string;
  preview?: boolean;
  selected?: boolean;
  shape: CanvasNodeShape;
}

const CANVAS_SHAPE_LABEL_PADDING: Record<CanvasNodeShape, string> = {
  circle: "px-7",
  cylinder: "px-7 pt-2",
  diamond: "px-[22%]",
  hexagon: "px-[16%]",
  pill: "px-7",
  rectangle: "px-4",
};

const CSS_SHAPE_RADIUS: Partial<Record<CanvasNodeShape, string>> = {
  circle: "rounded-full",
  pill: "rounded-full",
  rectangle: "rounded-md",
};

const getBorderColor = (isHighlighted: boolean): string =>
  isHighlighted ? "var(--accent-primary)" : "var(--border-subtle)";

const renderSvgShape = (
  shape: CanvasNodeShape,
  fill: string,
  stroke: string,
  strokeWidth: number,
) => {
  const shapeProps = {
    fill,
    stroke,
    strokeWidth,
    vectorEffect: "non-scaling-stroke",
  } as const;

  if (shape === "diamond") {
    return <polygon points="50,2 98,50 50,98 2,50" {...shapeProps} />;
  }

  if (shape === "hexagon") {
    return (
      <polygon points="25,4 75,4 98,50 75,96 25,96 2,50" {...shapeProps} />
    );
  }

  return (
    <>
      <path
        d="M5 18 V82 C5 92 95 92 95 82 V18 Z"
        {...shapeProps}
      />
      <path
        d="M5 18 C5 28 95 28 95 18 C95 8 5 8 5 18 Z"
        {...shapeProps}
      />
      <path
        d="M5 82 C5 92 95 92 95 82"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </>
  );
};

const CanvasShapeView = ({
  className,
  color,
  label,
  preview = false,
  selected = false,
  shape,
}: CanvasShapeViewProps) => {
  const isHighlighted = selected || preview;
  const borderColor = getBorderColor(isHighlighted);
  const strokeWidth = isHighlighted ? 2 : 1.4;
  const cssShapeRadius = CSS_SHAPE_RADIUS[shape];
  const cssShapeStyle: CSSProperties = {
    backgroundColor: color,
    borderColor,
    borderWidth: strokeWidth,
  };

  return (
    <div
      className={cn(
        "relative h-full w-full text-copy-primary",
        preview && "opacity-70",
        className,
      )}
    >
      {cssShapeRadius ? (
        <div
          className={cn("absolute inset-0 border shadow-sm", cssShapeRadius)}
          style={cssShapeStyle}
        />
      ) : (
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full overflow-visible drop-shadow-sm"
          focusable="false"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          {renderSvgShape(shape, color, borderColor, strokeWidth)}
        </svg>
      )}

      {label ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center text-center text-sm font-medium leading-snug",
            CANVAS_SHAPE_LABEL_PADDING[shape],
          )}
        >
          <span className="max-w-full truncate">{label}</span>
        </div>
      ) : null}
    </div>
  );
};

export { CANVAS_SHAPE_LABEL_PADDING, CanvasShapeView };
