"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { CanvasSnapshot } from "@/lib/canvas-snapshot";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

type CanvasSaveStatus = "idle" | "saving" | "saved" | "error";

interface CanvasAutosaveState {
  lastSavedAt: Date | null;
  status: CanvasSaveStatus;
}

interface UseCanvasAutosaveOptions {
  edges: CanvasEdge[];
  isReady: boolean;
  nodes: CanvasNode[];
  projectId: string;
}

const AUTOSAVE_DEBOUNCE_MS = 1200;

const createSnapshot = (
  nodes: CanvasNode[],
  edges: CanvasEdge[],
): CanvasSnapshot => ({
  edges,
  nodes,
});

const createSnapshotSignature = (snapshot: CanvasSnapshot): string =>
  JSON.stringify(snapshot);

const useCanvasAutosave = ({
  edges,
  isReady,
  nodes,
  projectId,
}: UseCanvasAutosaveOptions): CanvasAutosaveState => {
  const [status, setStatus] = useState<CanvasSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const baselineSignatureSetRef = useRef(false);
  const lastSavedSignatureRef = useRef<string | null>(null);
  const saveAttemptRef = useRef(0);

  useEffect(() => {
    baselineSignatureSetRef.current = false;
    lastSavedSignatureRef.current = null;
    saveAttemptRef.current = 0;

    const timeoutId = window.setTimeout(() => {
      setStatus("idle");
      setLastSavedAt(null);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [projectId]);

  useEffect(() => {
    if (!isReady) return;

    const snapshot = createSnapshot(nodes, edges);
    const signature = createSnapshotSignature(snapshot);

    if (!baselineSignatureSetRef.current) {
      baselineSignatureSetRef.current = true;
      lastSavedSignatureRef.current = signature;
      return;
    }

    if (signature === lastSavedSignatureRef.current) return;

    const saveAttempt = saveAttemptRef.current + 1;
    saveAttemptRef.current = saveAttempt;
    setStatus("saving");

    const timeoutId = window.setTimeout(() => {
      void fetch(`/api/projects/${encodeURIComponent(projectId)}/canvas`, {
        body: JSON.stringify(snapshot),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Canvas autosave failed.");
          }
        })
        .then(() => {
          if (saveAttemptRef.current !== saveAttempt) return;

          lastSavedSignatureRef.current = signature;
          setLastSavedAt(new Date());
          setStatus("saved");
        })
        .catch(() => {
          if (saveAttemptRef.current !== saveAttempt) return;

          setStatus("error");
        });
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [edges, isReady, nodes, projectId]);

  return useMemo(() => ({ lastSavedAt, status }), [lastSavedAt, status]);
};

export { useCanvasAutosave };
export type { CanvasAutosaveState, CanvasSaveStatus };
