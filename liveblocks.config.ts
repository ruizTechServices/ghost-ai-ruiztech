import type { AiStatusFeedMessage } from "@/types/tasks";

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

    RoomEvent: AiStatusFeedMessage;

    ThreadMetadata: Record<string, never>;

    RoomInfo: Record<string, never>;
  }
}

export {};
