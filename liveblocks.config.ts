import type { AiStatusEvent } from "@/types/ai-design";

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    Storage: Record<string, never>;

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    RoomEvent: AiStatusEvent;

    ThreadMetadata: Record<string, never>;

    RoomInfo: Record<string, never>;
  }
}

export {};
