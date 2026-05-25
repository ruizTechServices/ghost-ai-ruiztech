"use client";

import { shallow, useOthersMapped } from "@liveblocks/react/suspense";
import { LoaderCircle } from "lucide-react";

interface CursorInfo {
  color: string;
  cursor: { x: number; y: number } | null;
  name: string;
  thinking: boolean;
  userId: string;
}

interface LiveCursorsProps {
  currentUserId?: string | null;
}

const LiveCursors = ({ currentUserId }: LiveCursorsProps) => {
  const cursors = useOthersMapped(
    (other): CursorInfo => ({
      color: other.info.color,
      cursor: other.presence.cursor,
      name: other.info.name,
      thinking: other.presence.thinking,
      userId: other.id,
    }),
    shallow,
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {cursors.map(([connectionId, participant]) => {
        if (participant.userId === currentUserId || !participant.cursor) {
          return null;
        }

        return (
          <div
            className="absolute left-0 top-0"
            key={connectionId}
            style={{
              transform: `translate3d(${participant.cursor.x}px, ${participant.cursor.y}px, 0)`,
            }}
          >
            <div
              className="h-4 w-4"
              style={{
                backgroundColor: participant.color,
                clipPath: "polygon(0 0, 0 100%, 35% 68%, 67% 100%, 100% 76%)",
              }}
            />
            <div
              className="ml-3 mt-1 flex max-w-40 items-center gap-1.5 rounded-xl px-2 py-1 text-xs font-semibold shadow-lg shadow-bg-base/30"
              style={{
                backgroundColor: participant.color,
                color: "var(--bg-base)",
              }}
            >
              <span className="truncate">{participant.name}</span>
              {participant.thinking && (
                <LoaderCircle className="h-3 w-3 shrink-0 animate-spin" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { LiveCursors };
