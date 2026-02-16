"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Moon, Sun, Loader2, Bot, User, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function SpringAIChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [fileAgentEnabled, setFileAgentEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const currentInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiEndpoint = fileAgentEnabled
        ? "/api/chat/generate"
        : "/api/chat/stream";

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantMessageAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Only add assistant message once we have content
        if (chunk && !assistantMessageAdded) {
          const assistantMessage: Message = { role: "assistant", content: buffer };
          setMessages((prev) => [...prev, assistantMessage]);
          assistantMessageAdded = true;
        } else if (assistantMessageAdded) {
          // Update existing message
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            lastMessage.content = buffer;
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const bgColor = darkMode ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800" : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50";
  const cardBg = darkMode ? "bg-gray-800/80" : "bg-white/80";
  const textColor = darkMode ? "text-gray-100" : "text-gray-900";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-600";
  const borderColor = darkMode ? "border-gray-700/50" : "border-gray-200/50";
  const inputBg = darkMode ? "bg-gray-700/50" : "bg-white/50";
  const userMsgBg = darkMode ? "bg-gradient-to-br from-blue-600 to-blue-700" : "bg-gradient-to-br from-blue-500 to-indigo-600";
  const assistantMsgBg = darkMode ? "bg-gray-700/50" : "bg-white/70";

  return (
    <div
      className={`min-h-screen ${bgColor} ${textColor} transition-all duration-500`}
    >
      <style jsx>{`
        /* Custom scrollbar styles */
        textarea::-webkit-scrollbar {
          width: 8px;
        }
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea::-webkit-scrollbar-thumb {
          background: ${darkMode ? 'rgba(156, 163, 175, 0.3)' : 'rgba(156, 163, 175, 0.5)'};
          border-radius: 4px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? 'rgba(156, 163, 175, 0.5)' : 'rgba(156, 163, 175, 0.7)'};
        }
        /* Firefox */
        textarea {
          scrollbar-width: thin;
          scrollbar-color: ${darkMode ? 'rgba(156, 163, 175, 0.3)' : 'rgba(156, 163, 175, 0.5)'} transparent;
        }
      `}</style>

      {/* Header */}
      <header
        className={`${cardBg} border-b ${borderColor} sticky top-0 z-10 backdrop-blur-xl shadow-lg`}
      >
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl bg-gradient-to-br ${
                darkMode ? "from-blue-600 to-purple-600" : "from-blue-500 to-indigo-600"
              } shadow-lg`}
            >
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Spring AI Assistant
              </h1>
              <p className={`text-sm ${mutedText} flex items-center gap-1`}>
                <Sparkles className="w-3 h-3" />
                Powered by Ollama & MCP
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-full px-3 py-1.5 border border-gray-600/30">
              <span className={`text-sm ${mutedText} font-medium`}>File Agent</span>
              <button
                onClick={() => setFileAgentEnabled(!fileAgentEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                  fileAgentEnabled
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/50"
                    : darkMode
                    ? "bg-gray-700"
                    : "bg-gray-300"
                }`}
                aria-label="Toggle file agent"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
                    fileAgentEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl ${inputBg} hover:scale-110 transition-all duration-300 border ${borderColor} backdrop-blur-sm`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <main className="w-full px-6 py-6 pb-32">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div
              className={`p-8 rounded-3xl bg-gradient-to-br ${
                darkMode ? "from-blue-600/20 to-purple-600/20" : "from-blue-500/20 to-indigo-600/20"
              } mb-6 backdrop-blur-sm border ${borderColor} shadow-2xl relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 animate-pulse"></div>
              <Bot className="w-20 h-20 relative z-10" />
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Spring AI
            </h2>
            <p className={`${mutedText} text-lg`}>
              Start a conversation with your AI assistant
            </p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in slide-in-from-bottom-4 duration-500`}
              >
                {msg.role === "assistant" && (
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${
                      darkMode ? "from-blue-600 to-purple-600" : "from-blue-500 to-indigo-600"
                    } h-fit shadow-lg`}
                  >
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-lg backdrop-blur-sm border ${
                    msg.role === "user"
                      ? `${userMsgBg} text-white border-blue-600/30`
                      : `${assistantMsgBg} ${textColor} ${borderColor}`
                  } transition-all duration-300 hover:shadow-xl`}
                >
                  <p className="whitespace-pre-wrap overflow-wrap-anywhere leading-relaxed">
                    {msg.content}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div
                    className={`p-2.5 rounded-xl ${
                      darkMode ? "bg-gray-700/50" : "bg-gray-200/50"
                    } h-fit shadow-lg border ${borderColor} backdrop-blur-sm`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
              <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div
                  className={`p-2.5 rounded-xl bg-gradient-to-br ${
                    darkMode ? "from-blue-600 to-purple-600" : "from-blue-500 to-indigo-600"
                  } h-fit shadow-lg`}
                >
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className={`rounded-2xl px-5 py-3.5 ${assistantMsgBg} shadow-lg border ${borderColor} backdrop-blur-sm`}>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div
        className={`fixed bottom-0 left-0 right-0 ${cardBg} border-t ${borderColor} backdrop-blur-xl shadow-2xl`}
      >
        <div className="w-full px-6 py-4">
          <div className="max-w-5xl mx-auto flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Type your message... (Shift+Enter for new line)"
                className={`w-full ${inputBg} ${textColor} rounded-2xl px-5 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  darkMode ? "focus:ring-offset-gray-800" : "focus:ring-offset-white"
                } resize-none max-h-32 transition-all duration-300 border ${borderColor} backdrop-blur-sm shadow-inner`}
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className={`p-3.5 rounded-2xl ${
                !input.trim() || isLoading
                  ? `${inputBg} opacity-50 cursor-not-allowed`
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30"
              } text-white transition-all duration-300 transform hover:scale-105 active:scale-95 border ${borderColor}`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}