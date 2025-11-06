'use client';

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { ToolStep } from "@/lib/agent";

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  steps?: ToolStep[];
  createdAt: number;
}

const initialPrompt =
  "Hey there! I'm your tool-savvy copilot. Ask me to crunch numbers, check curated weather snapshots, suggest ideas, or sketch a mini-plan.";

export function AgentChat() {
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    createMessage("assistant", initialPrompt)
  ]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!input.trim()) {
      return;
    }

    const userMessage = createMessage("user", input.trim());
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsThinking(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userMessage.content })
      });

      if (!response.ok) {
        throw new Error("The agent could not handle that request just yet.");
      }

      const data = (await response.json()) as { reply: string; steps: ToolStep[] };
      const assistantMessage = createMessage("assistant", data.reply, data.steps);

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (agentError) {
      const assistantMessage = createMessage(
        "assistant",
        "I hit a snag while processing that. Try a different prompt or refresh the page."
      );
      setMessages((prev) => [...prev, assistantMessage]);

      if (agentError instanceof Error) {
        setError(agentError.message);
      } else {
        setError("Unexpected error.");
      }
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <header className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-lg shadow-indigo-500/10">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
          Agentic Workspace
        </span>
        <h1 className="text-3xl font-semibold text-white">
          AI Tool Agent
        </h1>
        <p className="text-sm text-indigo-100/80">
          Orchestrates lightweight tools to answer questions, plan tasks, and brainstorm ideas. Drop a prompt and it
          will pick the best path forward.
        </p>
      </header>

      <section
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-inner shadow-indigo-400/10"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isThinking ? (
          <div className="flex items-center gap-3 text-indigo-100">
            <span className="h-3 w-3 animate-pulse rounded-full bg-indigo-300" />
            <span className="text-sm">Synthesizing a response...</span>
          </div>
        ) : null}
      </section>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/40 p-4 text-sm shadow-lg shadow-indigo-500/20 backdrop-blur"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs text-indigo-200/80">
          <Badge>Calculator</Badge>
          <Badge>Weather desk</Badge>
          <Badge>Knowledge base</Badge>
          <Badge>Idea sparks</Badge>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 focus-within:border-indigo-300 focus-within:bg-white/20">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask me to plan a launch, crunch some numbers, or riff on new ideas..."
            className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-indigo-200/60 focus:outline-none"
            rows={3}
            disabled={isThinking}
          />
          <button
            type="submit"
            disabled={isThinking}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500 font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:cursor-not-allowed disabled:bg-indigo-500/40"
            aria-label="Send message"
          >
            {isThinking ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 19.5 15-7.5-15-7.5 3.75 7.5-3.75 7.5z"
                />
              </svg>
            )}
          </button>
        </div>

        {error ? (
          <p className="text-xs text-rose-200/90">
            {error}
          </p>
        ) : (
          <p className="text-xs text-indigo-200/80">
            Tip: Ask for a launch checklist plan or the current weather in London.
          </p>
        )}
      </form>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <article
      className={`flex flex-col gap-3 rounded-3xl p-4 shadow-sm ${
        isAssistant
          ? "border border-indigo-200/30 bg-indigo-500/10 text-indigo-50"
          : "border border-white/10 bg-black/50 text-white"
      }`}
    >
      <header className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-indigo-200/80">
        <span>{isAssistant ? "Agent" : "You"}</span>
        <time dateTime={new Date(message.createdAt).toISOString()}>
          {formatTime(message.createdAt)}
        </time>
      </header>

      <p className="whitespace-pre-line text-sm leading-relaxed">
        {message.content}
      </p>

      {message.steps && message.steps.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-indigo-200/20 bg-indigo-400/5 p-3">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-indigo-200/70">
            Tool trace
          </span>
          <ul className="flex flex-col gap-3">
            {message.steps.map((step) => (
              <li
                key={step.id}
                className="flex flex-col gap-2 rounded-xl border border-indigo-200/30 bg-indigo-500/5 p-3 text-xs text-indigo-50/90"
              >
                <span className="font-semibold text-indigo-100">{step.title}</span>
                <p className="text-[0.7rem] leading-snug text-indigo-100/80">
                  <strong className="uppercase tracking-[0.15em] text-indigo-200/70">Reasoning:</strong> {step.reasoning}
                </p>
                <p className="text-[0.7rem] leading-snug text-indigo-100/80">
                  <strong className="uppercase tracking-[0.15em] text-indigo-200/70">Input:</strong> {step.input}
                </p>
                <p className="text-[0.7rem] leading-snug text-indigo-100/80">
                  <strong className="uppercase tracking-[0.15em] text-indigo-200/70">Output:</strong> {step.output}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 uppercase tracking-[0.2em] text-[0.6rem] text-indigo-100/80">
      {children}
    </span>
  );
}

function createMessage(role: Role, content: string, steps?: ToolStep[]): Message {
  return {
    id: `${role}-${crypto.randomUUID()}`,
    role,
    content,
    steps,
    createdAt: Date.now()
  };
}

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(timestamp);
}
