"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function parseMessageContent(content: string) {
  // Detecta [TEXTO](url) y lo convierte en un enlace
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: Array<{ type: "text" | "link"; content: string; href?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: "link", content: match[1], href: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", content: content.slice(lastIndex) });
  }

  return parts;
}

export default function ClienteChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy el asistente virtual de Sabana Dining. Estoy aquí para ayudarte a solicitar un evento de catering de manera rápida. ¿Para qué fecha necesitas el servicio y en qué lugar de la universidad?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Lo siento, hubo un error de conexión. Por favor intenta de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-64px)]">
      {/* Encabezado del chat */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          IA
        </div>
        <div>
          <p className="font-semibold text-purple-900 text-sm">Asistente Sabana Dining</p>
          <p className="text-xs text-purple-600">Responde en segundos · Solicitudes 7am–2:30pm</p>
        </div>
      </div>

      {/* Hilo de mensajes */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, i) => {
          const parts = parseMessageContent(msg.content);
          return (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
                  IA
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-teal-700 text-white rounded-tr-sm"
                    : "bg-purple-700 text-white rounded-tl-sm"
                }`}
              >
                {parts.map((part, j) =>
                  part.type === "link" ? (
                    <Link
                      key={j}
                      href={part.href!}
                      className="inline-block mt-2 px-4 py-2 bg-white text-purple-700 rounded-lg font-semibold text-sm hover:bg-purple-50 transition-colors"
                    >
                      {part.content}
                    </Link>
                  ) : (
                    <span key={j}>{part.content}</span>
                  )
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
              IA
            </div>
            <div className="bg-purple-100 border border-purple-200 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2 items-end border border-gray-200 rounded-xl p-2 bg-white shadow-sm">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje... (Enter para enviar)"
          rows={2}
          className="flex-1 resize-none text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent px-2 py-1"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-semibold hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
