"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Database,
  Info,
} from "lucide-react";
import { useAppStore } from "@/lib/store/use-app-store";
import { computeWeeklyInsights } from "@/lib/analytics/insights";

const SUGGESTED_PROMPTS = [
  "Explain my saved routine and guidelines.",
  "How should I apply Minoxidil properly?",
  "I missed my evening application. Should I double up?",
  "Summarize my consistency and observations for this week.",
  "What is the expected timeline for wellness results?",
];

export default function CompanionPage() {
  const profile = useAppStore((s) => s.profile);
  const products = useAppStore((s) => s.products);
  const routines = useAppStore((s) => s.routines);
  const routineItems = useAppStore((s) => s.routineItems);
  const journalEntries = useAppStore((s) => s.journalEntries);
  const chatMessages = useAppStore((s) => s.chatMessages);
  const addChatMessage = useAppStore((s) => s.addChatMessage);
  const clearChatMessages = useAppStore((s) => s.clearChatMessages);
  const store = useAppStore();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || input).trim();
    if (!message || isLoading) return;

    setInput("");
    setErrorMessage(null);

    // Add user message locally
    addChatMessage({
      role: "user",
      text: message,
    });

    setIsLoading(true);

    try {
      // Build compact local context
      const activeProducts = products
        .filter((p) => p.status === "active")
        .map((p) => ({
          name: p.name,
          category: p.category,
          instructionText: p.instructionText,
          sourceLabel: p.sourceLabel,
        }));

      const routineSummary = routines
        .map((r) => {
          const items = routineItems
            .filter((i) => i.routineId === r.id && i.isActive)
            .map((i) => `- ${i.title} (${i.instruction || "No custom notes"})`)
            .join("\n");
          return `${r.name}:\n${items || "None"}`;
        })
        .join("\n\n");

      const recentJournal = journalEntries
        .slice(0, 3)
        .map((e) => `[${e.date} - ${e.category}]: ${e.observation}`)
        .join("\n");

      const weeklyInsights = computeWeeklyInsights(store);

      const payload = {
        message,
        context: {
          products: activeProducts,
          routineSummary,
          journalSummary: recentJournal || undefined,
          completionRate: weeklyInsights.overallRate,
        },
      };

      const res = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();

      addChatMessage({
        role: "assistant",
        text: data.answer,
        relatedSourceIds: data.sources?.map((s: any) => s.id),
        isFallback: data.isFallback,
      });
    } catch (err: any) {
      console.error("Companion request error:", err);
      setErrorMessage(err.message || "Failed to reach AI companion.");

      // Provide local verified fallback response so experience is unbroken
      addChatMessage({
        role: "assistant",
        text:
          "I am unable to reach the cloud AI service at this moment. You can review verified instructions in your Product Cabinet or check packaging labels for accurate directions.",
        isFallback: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] min-h-[500px] max-w-4xl mx-auto bg-wellness-surface rounded-card border border-wellness-border shadow-subtle overflow-hidden animate-fade-in">
      {/* Companion Header */}
      <div className="p-4 sm:p-5 border-b border-wellness-border flex items-center justify-between bg-wellness-surface-alt">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-wellness-accent flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-wellness-primary">AI Companion</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-wellness-accent-soft text-wellness-accent">
                Context-Aware
              </span>
            </div>
            <p className="text-[11px] text-wellness-secondary">
              Grounded in your saved products, verified instructions, and routine logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChatMessages}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-control text-xs text-wellness-secondary hover:text-wellness-primary hover:bg-wellness-surface border border-wellness-border transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Trust & Safety Info Pill */}
      <div className="px-4 py-2 bg-wellness-bg/60 border-b border-wellness-border-subtle flex items-center justify-between text-[11px] text-wellness-secondary">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-wellness-accent" />
          <span>Non-clinical educational assistant. Does not diagnose or prescribe.</span>
        </span>
        <span className="hidden sm:inline text-wellness-muted">
          Active Persona: {profile.displayName}
        </span>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-wellness-accent-soft flex items-center justify-center text-wellness-accent shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-xl p-3.5 rounded-card space-y-2 ${
                  isUser
                    ? "bg-wellness-accent text-white rounded-tr-none shadow-sm"
                    : "bg-wellness-surface-alt border border-wellness-border text-wellness-primary rounded-tl-none shadow-subtle"
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Show source indicator if assistant used verified knowledge */}
                {!isUser && msg.isFallback && (
                  <div className="pt-1.5 border-t border-wellness-border-subtle flex items-center gap-1 text-[10px] text-wellness-muted">
                    <Database className="w-3 h-3 text-wellness-accent" />
                    <span>Response generated via verified local knowledge base.</span>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-wellness-primary text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold">
                  {profile.displayName.charAt(0)}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 text-xs leading-relaxed justify-start">
            <div className="w-7 h-7 rounded-lg bg-wellness-accent-soft flex items-center justify-center text-wellness-accent shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-card bg-wellness-surface-alt border border-wellness-border text-wellness-secondary rounded-tl-none flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-wellness-accent animate-ping" />
              <span>Checking verified instructions and formulating guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Carousel */}
      <div className="px-4 py-2 border-t border-wellness-border-subtle bg-wellness-surface-alt flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[10px] font-semibold text-wellness-muted uppercase shrink-0">
          Suggested:
        </span>
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1 rounded-full bg-wellness-surface border border-wellness-border text-wellness-secondary hover:text-wellness-primary hover:border-wellness-accent text-[11px] transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box Footer */}
      <div className="p-3 sm:p-4 border-t border-wellness-border bg-wellness-surface">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about your routine, verified dosage rules, or weekly summary..."
            className="flex-1 px-3.5 py-2.5 rounded-control bg-wellness-surface-alt border border-wellness-border text-xs text-wellness-primary placeholder:text-wellness-muted focus:outline-none focus:border-wellness-accent"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-control bg-wellness-accent text-white text-xs font-medium hover:bg-wellness-accent-hover disabled:opacity-50 transition-colors shadow-subtle shrink-0 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
}
