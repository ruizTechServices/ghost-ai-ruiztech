"use client";

import { useEventListener } from "@liveblocks/react/suspense";

import type { AiStatusEvent } from "@/types/ai-design";
import { isAiStatusFeedMessage } from "@/types/tasks";

interface AiCanvasEventsProps {
  onStatusEvent?: (event: AiStatusEvent) => void;
}

const AiCanvasEvents = ({ onStatusEvent }: AiCanvasEventsProps) => {
  useEventListener(({ event }) => {
    if (!onStatusEvent || !isAiStatusFeedMessage(event)) return;

    onStatusEvent(event);
  });

  return null;
};

export { AiCanvasEvents };
