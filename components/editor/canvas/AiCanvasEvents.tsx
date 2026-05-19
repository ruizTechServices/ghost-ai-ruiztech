"use client";

import { useEventListener } from "@liveblocks/react/suspense";

import type { AiStatusEvent } from "@/types/ai-design";

interface AiCanvasEventsProps {
  onStatusEvent?: (event: AiStatusEvent) => void;
}

const AiCanvasEvents = ({ onStatusEvent }: AiCanvasEventsProps) => {
  useEventListener(({ event }) => {
    if (!onStatusEvent || event.type !== "ai-status") return;

    onStatusEvent(event);
  });

  return null;
};

export { AiCanvasEvents };
