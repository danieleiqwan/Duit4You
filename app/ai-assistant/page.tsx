"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "How much did I spend this month?",
  "What did I spend the most on?",
  "Compare this month with last month",
  "Show my recent transactions",
];

// Helper to format assistant markdown-like text (bold, bullet lists, newlines) safely
function renderFormattedContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    // Process **bold** syntax
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const formattedLine = parts.map((part, partIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={partIdx} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    // Check for bullet list item
    const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
    if (isBullet) {
      return (
        <li key={lineIdx} className="ml-4 list-disc space-y-1 text-slate-700">
          {formattedLine.map((p, i) => {
            if (typeof p === "string") {
              const cleaned = i === 0 ? p.replace(/^[-*]\s+/, "") : p;
              return cleaned;
            }
            return p;
          })}
        </li>
      );
    }

    return (
      <p key={lineIdx} className={line.trim() === "" ? "h-2" : "min-h-[1.25rem] text-slate-700"}>
        {formattedLine}
      </p>
    );
  });
}

export default function AIAssistantPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const msgCounterRef = useRef(0);

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userEmail = session?.user?.email || "";

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Adjust textarea height automatically
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setError(null);
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    msgCounterRef.current += 1;
    const userMsg: Message = {
      id: `user-${msgCounterRef.current}`,
      role: "user",
      content: query,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build API payload without any userId (strictly server-side auth)
      const payload = {
        messages: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        msgCounterRef.current += 1;
        const assistantErrorMsg: Message = {
          id: `error-${msgCounterRef.current}`,
          role: "assistant",
          content: data.error || "Sorry, I couldn't process that request. Please try again.",
        };
        setMessages((prev) => [...prev, assistantErrorMsg]);
        return;
      }

      msgCounterRef.current += 1;
      const assistantMsg: Message = {
        id: `assistant-${msgCounterRef.current}`,
        role: "assistant",
        content: data.message?.content || "No response received.",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      console.error("AI Chat UI Error:", err);
      msgCounterRef.current += 1;
      const assistantErrorMsg: Message = {
        id: `error-${msgCounterRef.current}`,
        role: "assistant",
        content: "Sorry, I couldn't process that request. Please try again.",
      };
      setMessages((prev) => [...prev, assistantErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Shell */}
      <Sidebar userName={userName} userEmail={userEmail} />

      {/* Main Content Area - Full height column */}
      <main className="flex flex-1 flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 md:px-8">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Finance Assistant</h1>
            <p className="text-xs text-slate-500">Ask questions about your finances.</p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <svg className="mr-1.5 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear chat
            </button>
          )}
        </header>

        {/* Message Viewport */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Welcome State when no messages */}
            {messages.length === 0 ? (
              <div className="my-8 flex flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white shadow-sm">
                  F
                </div>
                <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
                  Finance Assistant
                </h2>
                <p className="mt-1 max-w-md text-xs text-slate-500">
                  Ask me anything about your financial activity, balances, or transactions.
                </p>

                {/* Suggested Prompts Grid */}
                <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      className="flex items-start rounded-xl border border-slate-200/80 bg-white p-3.5 text-left text-xs font-medium text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50/80 hover:text-slate-900 hover:shadow-sm"
                    >
                      <span className="mr-2 text-slate-400">💡</span>
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message List */
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#181E29] text-white shadow-xs"
                        : "border border-slate-200/80 bg-white text-slate-800 shadow-xs"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                    ) : (
                      <div className="space-y-1.5">{renderFormattedContent(msg.content)}</div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-xs font-medium text-slate-500 shadow-xs">
                  <div className="flex space-x-1">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></div>
                  </div>
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs text-red-600">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Composer Area */}
        <div className="flex-shrink-0 border-t border-slate-200/80 bg-white p-4 md:px-8">
          <div className="mx-auto max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-end rounded-2xl border border-slate-200 bg-slate-50/50 p-2 shadow-xs transition-within focus-within:border-slate-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-400"
            >
              <label htmlFor="ai-chat-input" className="sr-only">
                Ask about your finances
              </label>
              <textarea
                id="ai-chat-input"
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask about your finances... (Shift+Enter for line break)"
                className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#181E29] text-white shadow-xs transition-opacity hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Finance Assistant uses AI to summarize your financial records. Values are calculated directly from your transaction database.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
