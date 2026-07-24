import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/lib/api";

interface ChatAssistantProps {
  runId: string;
}

export function ChatAssistant({ runId }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    {
      role: "assistant",
      content: "Hi! I'm the Blinkit Discovery Assistant. I've analyzed all the reviews in this run. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Why do users repeatedly buy the same categories?",
    "What prevents users from exploring new categories?",
    "Which user segment is most likely to experiment?",
    "What product opportunities have the strongest evidence?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (question: string) => {
    if (!question.trim()) return;

    const newMessages = [...messages, { role: "user", content: question }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/runs/${runId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          conversation_history: messages.slice(1) // exclude initial greeting
        })
      });

      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.answer || "Sorry, I couldn't process that." }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Error communicating with the backend." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-8 right-8 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-40 flex items-center justify-center hover:scale-105",
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <MessageSquare size={28} />
      </button>

      {/* Slide-out Panel Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-[400px] bg-blinkit-card shadow-2xl z-50 flex flex-col transition-transform duration-300 border-l border-blinkit-border",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blinkit-border bg-background">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold">Discovery Assistant</h3>
              <p className="text-xs text-blinkit-muted">Powered by GPT-4o</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-blinkit-muted hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={cn(
                "flex max-w-[85%] gap-2",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                msg.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
              )}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed",
                msg.role === "user" 
                  ? "bg-secondary text-secondary-foreground rounded-tr-sm" 
                  : "bg-background border border-blinkit-border text-foreground rounded-tl-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex mr-auto max-w-[85%] gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={16} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-background border border-blinkit-border rounded-tl-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="text-sm text-blinkit-muted">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="p-4 border-t border-blinkit-border">
            <p className="text-xs font-semibold text-blinkit-muted mb-2 uppercase tracking-wider">Suggested Questions</p>
            <div className="flex flex-col gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-left text-sm p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground transition-colors border border-transparent hover:border-blinkit-border"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-background border-t border-blinkit-border">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-secondary text-sm px-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/50 transition-all"
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-primary text-primary-foreground p-2.5 rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
