"use client";

import { useRun } from "@/context/RunContext";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { API_BASE } from "@/lib/api";

const SUGGESTED_QUESTIONS = [
  "Why do users repeatedly buy from the same categories?",
  "What prevents users from exploring new categories?",
  "How do users discover products today?",
  "What role do habits play in shopping behavior?",
  "What information do users need before trying a new category?",
  "What frustrations emerge repeatedly?",
  "Which user segments are more likely to experiment?",
  "What unmet needs emerge consistently across discussions?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

export default function CopilotPage() {
  const { data, runId } = useRun();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (question: string) => {
    if (!question.trim() || loading) return;
    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch(`${API_BASE}/api/runs/${runId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, conversation_history: history }),
      });
      const json = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: json.answer || "I could not generate an answer from the current dataset." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I could not connect to the backend. Please ensure the backend server is running on port 8000." }]);
    } finally {
      setLoading(false);
    }
  };

  const hasMessages = messages.length > 0;
  const total = data.source_counts.analyzed || data.source_counts.scraped || 0;

  return (
    <div className="flex flex-col h-screen bg-blinkit-dark">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-blinkit-border bg-blinkit-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blinkit-green/10 border border-blinkit-green/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blinkit-green" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Discovery Copilot</h1>
            <p className="text-[10px] text-blinkit-muted">Grounded in {total} Blinkit user reviews</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blinkit-green/10 border border-blinkit-green/20">
          <Sparkles className="w-3.5 h-3.5 text-blinkit-green" />
          <span className="text-xs text-blinkit-green font-medium">RAG-powered · GPT-4o</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {!hasMessages ? (
          <div className="max-w-2xl mx-auto">
            {/* Welcome */}
            <div className="text-center mb-10 mt-6">
              <div className="w-16 h-16 rounded-2xl bg-blinkit-green/10 border border-blinkit-green/20 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-blinkit-green" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Ask anything about Blinkit users</h2>
              <p className="text-sm text-blinkit-muted max-w-md mx-auto">
                I analyze your review corpus using semantic search. Every answer is grounded in real user feedback — no hallucination.
              </p>
            </div>

            {/* Suggested questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => send(q)}
                  className="text-left p-4 rounded-xl bg-blinkit-card border border-blinkit-border hover:border-blinkit-green/40 hover:bg-blinkit-green/5 transition-all group">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 text-blinkit-green shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
                    <p className="text-xs text-blinkit-subtle group-hover:text-foreground transition-colors leading-relaxed">{q}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} fade-in`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-blinkit-green/10 border border-blinkit-green/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-blinkit-green" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-xl px-4 py-3 ${msg.role === "user"
                  ? "bg-blinkit-green text-white"
                  : "bg-blinkit-card border border-blinkit-border text-foreground"}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-blinkit-surface border border-blinkit-border flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-blinkit-muted" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start fade-in">
                <div className="w-8 h-8 rounded-lg bg-blinkit-green/10 border border-blinkit-green/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-blinkit-green" />
                </div>
                <div className="bg-blinkit-card border border-blinkit-border rounded-xl px-4 py-3">
                  <div className="flex gap-1 items-center h-5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blinkit-green typing-dot" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blinkit-green typing-dot" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blinkit-green typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-8 py-4 border-t border-blinkit-border bg-blinkit-card shrink-0">
        <div className="max-w-2xl mx-auto">
          {hasMessages && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
                <button key={i} onClick={() => send(q)}
                  className="shrink-0 text-[10px] px-3 py-1.5 rounded-full bg-blinkit-surface border border-blinkit-border text-blinkit-muted hover:text-blinkit-green hover:border-blinkit-green/40 transition-colors">
                  {q.length > 40 ? q.slice(0, 40) + "…" : q}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask about discovery barriers, user habits, unmet needs..."
              className="flex-1 px-4 py-3 rounded-xl bg-blinkit-surface border border-blinkit-border text-sm text-foreground placeholder-blinkit-muted focus:outline-none focus:border-blinkit-green transition-colors"
            />
            <button onClick={() => send(input)} disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl bg-blinkit-green hover:bg-blinkit-green-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
              {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
            </button>
          </div>
          <p className="text-[10px] text-blinkit-muted mt-2 text-center">
            Answers are grounded exclusively in your review corpus · No outside knowledge used
          </p>
        </div>
      </div>
    </div>
  );
}
