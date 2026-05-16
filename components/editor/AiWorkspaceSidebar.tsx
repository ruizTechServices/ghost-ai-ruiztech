"use client";

import { Bot, Download, FileText, Send, Sparkles, X } from "lucide-react";
import {
  useEffect,
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

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
] as const;

interface ChatMessage {
  content: string;
  id: number;
  role: "assistant" | "user";
}

interface AiWorkspaceSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AiWorkspaceSidebar = ({
  isOpen,
  onOpenChange,
}: AiWorkspaceSidebarProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "72px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);

  const handleSubmit = (event?: FormEvent<HTMLFormElement>): void => {
    event?.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    setMessages((current) => [
      ...current,
      {
        content: trimmedInput,
        id: Date.now(),
        role: "user",
      },
      {
        content:
          "Ghost AI is ready to use this prompt when generation is connected.",
        id: Date.now() + 1,
        role: "assistant",
      },
    ]);
    setInput("");
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
              {messages.length === 0 ? (
                <div className="flex h-full min-h-80 flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-surface-border bg-bg-subtle text-accent-text">
                    <Bot className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-text">
                      Start with a system goal
                    </p>
                    <p className="mt-1 max-w-56 text-xs leading-5 text-muted-text">
                      Ask Ghost AI for an architecture draft, migration plan, or
                      infrastructure outline.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        className="rounded-full bg-subtle px-3 py-1.5 text-xs font-medium text-accent-text transition-colors hover:bg-bg-elevated"
                        key={prompt}
                        onClick={() => setInput(prompt)}
                        type="button"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      className={cn(
                        "max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-5",
                        message.role === "user"
                          ? "ml-auto border-2 border-brand/50 bg-brand-dim text-copy-primary"
                          : "mr-auto border border-surface-border bg-elevated text-accent-text",
                      )}
                      key={message.id}
                    >
                      {message.content}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form className="mt-3 space-y-2" onSubmit={handleSubmit}>
              <Textarea
                className="max-h-40 min-h-[72px] resize-none rounded-2xl border-surface-border bg-bg-subtle/70 text-sm text-copy-primary placeholder:text-muted-text"
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Ask Ghost AI to design or refine this system"
                ref={textareaRef}
                rows={3}
                value={input}
              />
              <Button
                className="w-full rounded-xl bg-ai text-primary-text hover:bg-ai/90"
                type="submit"
              >
                <Send className="h-4 w-4" />
                Send
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
