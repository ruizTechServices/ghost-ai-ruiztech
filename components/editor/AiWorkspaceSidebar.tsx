"use client";

import { useRealtimeRun } from "@trigger.dev/react-hooks";
import {
  useBroadcastEvent,
  useEventListener,
  useSelf,
} from "@liveblocks/react/suspense";
import {
  Bot,
  Download,
  FileText,
  LoaderCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AiStatusEvent } from "@/types/ai-design";
import {
  AI_CHAT_EVENT_TYPE,
  AI_CHAT_FEED,
  getAiStatusFeedText,
  isAiChatFeedMessage,
  isAiStatusActive,
  type AiChatFeedMessage,
  type AiChatRole,
  type AiChatSender,
} from "@/types/tasks";

const STARTER_MESSAGES = [
  "Design a resilient ecommerce checkout architecture.",
  "Add async workers for generated documents and snapshots.",
  "Map a multi-tenant SaaS backend with Clerk and Supabase.",
] as const;

const MAX_CHAT_MESSAGES = 200;

interface AiWorkspaceSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  statusEvents: AiStatusEvent[];
}

interface DesignRunState {
  publicToken: string;
  runId: string;
}

const GHOST_AI_SENDER: AiChatSender = {
  avatar: "",
  color: "var(--accent-user)",
  id: "ghost-ai",
  name: "Ghost AI",
};

const createChatMessageId = (): string =>
  `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getStringField = (value: unknown, key: string): string | null => {
  if (!isRecord(value) || typeof value[key] !== "string") return null;

  const field = value[key].trim();
  return field.length > 0 ? field : null;
};

const readResponseBody = async (response: Response): Promise<unknown> =>
  response.json().catch(() => null);

const getApiErrorMessage = (body: unknown, fallback: string): string => {
  if (isRecord(body) && isRecord(body.error)) {
    const message = getStringField(body.error, "message");
    if (message) return message;
  }

  return fallback;
};

const fetchDesignRunPublicToken = async (runId: string): Promise<string> => {
  const response = await fetch("/api/ai/design/token", {
    body: JSON.stringify({ runId }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(body, "Failed to create design run token."),
    );
  }

  const publicToken =
    getStringField(body, "publicToken") ?? getStringField(body, "token");

  if (!publicToken) {
    throw new Error("Design run token response was invalid.");
  }

  return publicToken;
};

const startDesignRun = async (
  prompt: string,
  roomId: string,
): Promise<DesignRunState> => {
  const response = await fetch("/api/ai/design", {
    body: JSON.stringify({ projectId: roomId, prompt, roomId }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(body, "Failed to start design generation."),
    );
  }

  const runId = getStringField(body, "runId");
  if (!runId) {
    throw new Error("Design run response did not include a run ID.");
  }

  const publicToken =
    getStringField(body, "publicToken") ??
    (await fetchDesignRunPublicToken(runId));

  return { publicToken, runId };
};

const formatChatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatRunStatus = (status: string): string =>
  status.toLowerCase().replaceAll("_", " ");

const isSuccessfulRunStatus = (status: string): boolean =>
  status === "COMPLETED" || status === "COMPLETED_SUCCESSFULLY";

const AiWorkspaceSidebar = ({
  isOpen,
  onOpenChange,
  roomId,
  statusEvents,
}: AiWorkspaceSidebarProps) => {
  const broadcastEvent = useBroadcastEvent();
  const self = useSelf();
  const [input, setInput] = useState("");
  const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false);
  const [designRun, setDesignRun] = useState<DesignRunState | null>(null);
  const [chatMessages, setChatMessages] = useState<AiChatFeedMessage[]>([]);
  const completedRunIdsRef = useRef<Set<string>>(new Set());
  const realtimeErrorRunIdRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const latestStatusEvent = statusEvents.at(-1) ?? null;
  const latestStatusText = latestStatusEvent
    ? getAiStatusFeedText(latestStatusEvent)
    : "";
  const isSharedGenerationActive = isAiStatusActive(latestStatusEvent);
  const isLocalDesignRunActive = designRun !== null;
  const isPromptRunning = isSubmittingPrompt || isLocalDesignRunActive;
  const arePromptControlsDisabled = isPromptRunning || isSharedGenerationActive;
  const shouldShowStatusStrip = isPromptRunning || isSharedGenerationActive;
  const statusStripText =
    latestStatusText ||
    (isSubmittingPrompt
      ? "Starting Ghost AI..."
      : "Ghost AI is working on this canvas.");
  const { error: realtimeRunError, run: realtimeRun } = useRealtimeRun(
    designRun?.runId,
    {
      accessToken: designRun?.publicToken,
      enabled: Boolean(designRun),
      id: designRun?.runId ?? `design-run-idle-${roomId}`,
    },
  );
  const visibleChatMessages = useMemo(
    () =>
      [...chatMessages].sort(
        (first, second) =>
          new Date(first.timestamp).getTime() -
          new Date(second.timestamp).getTime(),
      ),
    [chatMessages],
  );

  const appendChatMessage = useCallback((message: AiChatFeedMessage): void => {
    setChatMessages((current) => {
      if (current.some((chatMessage) => chatMessage.id === message.id)) {
        return current;
      }

      return [...current, message].slice(-MAX_CHAT_MESSAGES);
    });
  }, []);

  const publishChatMessage = useCallback(
    (message: AiChatFeedMessage): boolean => {
      if (!isAiChatFeedMessage(message)) return false;

      try {
        broadcastEvent(message);
      } catch {
        appendChatMessage(message);
        return false;
      }

      appendChatMessage(message);
      return true;
    },
    [appendChatMessage, broadcastEvent],
  );

  const createChatMessage = useCallback(
    (role: AiChatRole, content: string): AiChatFeedMessage => {
      const sender =
        role === "assistant"
          ? GHOST_AI_SENDER
          : {
              avatar: self.info.avatar,
              color: self.info.color,
              id: self.id,
              name: self.info.name || "You",
            };

      return {
        content,
        feed: AI_CHAT_FEED,
        id: createChatMessageId(),
        role,
        roomId,
        sender,
        timestamp: new Date().toISOString(),
        type: AI_CHAT_EVENT_TYPE,
      };
    },
    [roomId, self.id, self.info.avatar, self.info.color, self.info.name],
  );

  const publishAssistantMessage = useCallback(
    (content: string): void => {
      publishChatMessage(createChatMessage("assistant", content));
    },
    [createChatMessage, publishChatMessage],
  );

  useEventListener(({ event }) => {
    if (!isAiChatFeedMessage(event) || event.roomId !== roomId) return;

    appendChatMessage(event);
  });

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "72px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: "end" });
  }, [visibleChatMessages.length]);

  useEffect(() => {
    if (!realtimeRun?.finishedAt) return;

    const completedRunId = realtimeRun.id;
    if (completedRunIdsRef.current.has(completedRunId)) return;

    completedRunIdsRef.current.add(completedRunId);

    const runStatus = String(realtimeRun.status);
    publishAssistantMessage(
      isSuccessfulRunStatus(runStatus)
        ? "Ghost AI finished updating the canvas."
        : `Ghost AI stopped before completing the canvas update (${formatRunStatus(
            runStatus,
          )}).`,
    );
    setDesignRun((current) =>
      current?.runId === completedRunId ? null : current,
    );
    setIsSubmittingPrompt(false);
  }, [
    publishAssistantMessage,
    realtimeRun?.finishedAt,
    realtimeRun?.id,
    realtimeRun?.status,
  ]);

  useEffect(() => {
    if (!realtimeRunError || !designRun) return;

    if (realtimeErrorRunIdRef.current === designRun.runId) return;
    realtimeErrorRunIdRef.current = designRun.runId;

    publishAssistantMessage(
      `Ghost AI status tracking failed. ${realtimeRunError.message}`,
    );
    setDesignRun(null);
    setIsSubmittingPrompt(false);
  }, [designRun, publishAssistantMessage, realtimeRunError]);

  const handleSubmit = async (
    event?: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event?.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || arePromptControlsDisabled) return;

    const chatMessage = createChatMessage("user", trimmedInput);

    if (!publishChatMessage(chatMessage)) {
      publishAssistantMessage("Message could not be shared with the room.");
      return;
    }

    setInput("");
    setIsSubmittingPrompt(true);

    try {
      setDesignRun(await startDesignRun(trimmedInput, roomId));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to start design generation.";

      publishAssistantMessage(`Ghost AI could not start. ${message}`);
    } finally {
      setIsSubmittingPrompt(false);
    }
  };

  const handleInputKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();
    handleSubmit();
  };

  return (
    <aside
      className={cn(
        "hidden shrink-0 overflow-hidden border-l border-surface-border bg-base/95 shadow-lg shadow-bg-base/40 transition-[width] duration-200 lg:block",
        isOpen ? "w-80" : "w-0 border-l-0",
      )}
    >
      <div className="flex h-full w-80 flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-surface-border px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-surface-border bg-bg-subtle text-accent-text">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold tracking-normal text-primary-text">
                AI Workspace
              </h2>
              <p className="mt-0.5 truncate text-xs text-muted-text">
                Collaborate with Ghost AI
              </p>
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label="Close AI sidebar"
                  onClick={() => onOpenChange(false)}
                  size="icon-sm"
                  variant="ghost"
                />
              }
            >
              <X className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>Close AI sidebar</TooltipContent>
          </Tooltip>
        </div>

        <Tabs className="min-h-0 flex-1 px-4 py-4" defaultValue="architect">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-bg-subtle">
            <TabsTrigger
              className="text-muted-text data-active:bg-accent data-active:text-accent-foreground"
              value="architect"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              className="text-muted-text data-active:bg-accent data-active:text-accent-foreground"
              value="specs"
            >
              Specs
            </TabsTrigger>
          </TabsList>

          <TabsContent
            className="mt-4 flex min-h-0 flex-1 flex-col"
            value="architect"
          >
            <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-surface-border bg-bg-surface/60 p-3">
              {visibleChatMessages.length === 0 ? (
                <div className="flex h-full min-h-80 flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-surface-border bg-bg-subtle text-accent-text">
                    <Bot className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-text">
                      Start an AI design run
                    </p>
                    <p className="mt-1 max-w-56 text-xs leading-5 text-muted-text">
                      Prompt Ghost AI to update the shared architecture canvas.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {STARTER_MESSAGES.map((message) => (
                      <button
                        className="rounded-full bg-subtle px-3 py-1.5 text-xs font-medium text-accent-text transition-colors hover:bg-bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={arePromptControlsDisabled}
                        key={message}
                        onClick={() => setInput(message)}
                        type="button"
                      >
                        {message}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleChatMessages.map((message) => {
                    const isOwnMessage = message.sender.id === self.id;
                    const isUserMessage = message.role === "user";
                    const isAssistant = message.role === "assistant";

                    return (
                      <div
                        className={cn(
                          "max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-5",
                          isOwnMessage
                            ? "ml-auto"
                            : "mr-auto",
                          isUserMessage
                            ? "border border-user-accent/40 bg-user-accent text-bg-base"
                            : "border border-surface-border bg-elevated text-copy-primary",
                          isAssistant && "bg-bg-subtle text-copy-primary",
                        )}
                        key={message.id}
                      >
                        <div
                          className={cn(
                            "mb-1 flex items-center justify-between gap-2 text-[11px] leading-none",
                            isUserMessage
                              ? "text-bg-base/70"
                              : "text-muted-text",
                          )}
                        >
                          <span className="min-w-0 truncate font-medium">
                            {isOwnMessage ? "You" : message.sender.name}
                          </span>
                          <time
                            className="shrink-0 font-mono"
                            dateTime={message.timestamp}
                          >
                            {formatChatTimestamp(message.timestamp)}
                          </time>
                        </div>
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            <form className="mt-3 space-y-2" onSubmit={handleSubmit}>
              {shouldShowStatusStrip && (
                <div className="flex items-center gap-2 rounded-xl border border-user-accent/40 bg-bg-subtle/80 px-3 py-2 text-xs text-copy-secondary">
                  <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-user-accent" />
                  <span className="min-w-0 truncate">{statusStripText}</span>
                </div>
              )}
              <Textarea
                className="max-h-40 min-h-[72px] resize-none rounded-2xl border-surface-border bg-bg-subtle/70 text-sm text-copy-primary placeholder:text-muted-text"
                disabled={arePromptControlsDisabled}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Ask Ghost AI to update this system design"
                ref={textareaRef}
                rows={3}
                value={input}
              />
              <Button
                className="w-full rounded-xl bg-user-accent text-bg-base hover:bg-user-accent/90"
                disabled={
                  arePromptControlsDisabled || input.trim().length === 0
                }
                type="submit"
              >
                {arePromptControlsDisabled ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmittingPrompt
                  ? "Starting"
                  : isLocalDesignRunActive || isSharedGenerationActive
                    ? "Running"
                    : "Send"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent className="mt-4 min-h-0 flex-1" value="specs">
            <div className="space-y-3">
              <Button className="w-full rounded-xl bg-ai text-primary-text hover:bg-ai/90">
                <Sparkles className="h-4 w-4" />
                Generate Spec
              </Button>

              <div className="rounded-2xl border border-surface-border bg-elevated p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-border bg-bg-subtle text-accent-text">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-primary-text">
                      Architecture Spec Draft
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-text">
                      Service boundaries, data flow, deployment notes, and
                      operational risks will appear in the generated Markdown
                      spec.
                    </p>
                  </div>
                </div>

                <Button
                  className="mt-4 w-full rounded-xl"
                  disabled
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  Download disabled
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
};

export { AiWorkspaceSidebar };
