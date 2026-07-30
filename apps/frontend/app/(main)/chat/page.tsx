"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { fetchApi } from "../../../lib/api";

interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  tokensUsed: number;
  createdAt: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchApi(`/chat`)
      .then((res) => {
        setMessages(res);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isSending) return;

    setError(null);
    setIsSending(true);
    const currentQuestion = question;
    setQuestion("");

    try {
      const data = await fetchApi("/chat", {
        method: "POST",
        body: JSON.stringify({ question: currentQuestion }),
      });

      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setQuestion(currentQuestion);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-4 flex items-center justify-between">
        <span className="text-base font-semibold text-gray-900">GGI Chat</span>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-sm text-gray-400 mt-20">
              Ask a question to get started.
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-lg bg-gray-900 text-white px-4 py-2 text-sm">
                  {msg.question}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-white border border-gray-200 text-gray-900 px-4 py-2 text-sm">
                  {msg.answer}
                  <div className="mt-1 text-[11px] text-gray-400">{msg.tokensUsed} tokens</div>
                </div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-white border border-gray-200 text-gray-400 px-4 py-2 text-sm">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="shrink-0 max-w-2xl mx-auto w-full px-4">
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-2">
            {error}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-gray-200 bg-white px-4 py-4"
      >
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask a question..."
            rows={1}
            className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isSending || !question.trim()}
            className="rounded-md bg-gray-900 text-white text-sm font-medium px-4 py-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
