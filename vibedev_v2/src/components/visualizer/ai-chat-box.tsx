"use client";

import React, { useState, useRef, useEffect } from "react";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { Send, Terminal, Bot, User, Sparkles, X, Minimize2, Maximize2 } from "lucide-react";

interface AIChatBoxProps {
  onClose: () => void;
}

export function AIChatBox({ onClose }: AIChatBoxProps) {
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedNode = useVisualizerStore((state) => state.selectedNode);
  const chatHistories = useVisualizerStore((state) => state.chatHistories);
  const isActionPending = useVisualizerStore((state) => state.isActionPending);
  const askNodeQuestion = useVisualizerStore((state) => state.askNodeQuestion);

  const nodeId = selectedNode ? String(selectedNode.id || selectedNode._id || "") : "";
  const currentChat = nodeId ? chatHistories[nodeId] || [] : [];

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChat, isActionPending, isMinimized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !nodeId || isActionPending) return;

    const userQuery = input.trim();
    setInput("");
    await askNodeQuestion(nodeId, userQuery);
  };

  return (
    <div 
      className={`absolute bottom-6 right-6 w-85 bg-zinc-950/95 backdrop-blur-md border border-zinc-800/80 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden transition-all duration-300 ease-in-out origin-bottom-right ${
        isMinimized ? "h-12 w-64 shadow-lg" : "h-[450px]"
      }`}
    >
      {/* FLOATING HEADER BAR */}
      <div className="h-12 border-b border-zinc-900 flex items-center justify-between px-4 bg-zinc-900/60 cursor-pointer select-none" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1 bg-indigo-500/10 rounded-md border border-indigo-500/20 text-indigo-400">
            <Terminal size={12} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider">
              AI Query Assistant
            </span>
            <span className="text-[9px] font-mono text-zinc-500 truncate max-w-[140px]">
              {selectedNode ? (selectedNode.label || selectedNode.name) : "No Node Selected"}
            </span>
          </div>
        </div>
        
        {/* WINDOW CONTROLS */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
          </button>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400 transition-colors"
          >
            <X size={11} />
          </button>
        </div>
      </div>

      {/* CHAT BODY - Hidden when minimized */}
      {!isMinimized && (
        <>
          {/* MESSAGES LAYER */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-none bg-zinc-950/40">
            {currentChat.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="p-2.5 bg-indigo-500/5 rounded-full border border-indigo-500/10 mb-2.5">
                  <Sparkles size={14} className="text-indigo-400/80 animate-pulse" />
                </div>
                <p className="text-[11px] font-mono text-zinc-400">
                  Ask me anything about this target context:
                </p>
                <p className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 mt-1.5 max-w-full truncate">
                  {selectedNode ? (selectedNode.label || selectedNode.name) : "Select a card"}
                </p>
              </div>
            ) : (
              currentChat.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-2 max-w-[88%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`p-1.5 h-5 w-5 rounded shrink-0 flex items-center justify-center border text-[9px] ${
                    msg.role === "user" 
                      ? "bg-zinc-800 border-zinc-700 text-zinc-400" 
                      : "bg-indigo-950/60 border-indigo-500/20 text-indigo-400"
                  }`}>
                    {msg.role === "user" ? <User size={9} /> : <Bot size={9} />}
                  </div>
                  <div className={`p-2.5 rounded-lg border text-[10px] font-mono leading-relaxed break-words whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-zinc-900 border-zinc-800 text-zinc-100"
                      : "bg-zinc-900/30 border-zinc-900 text-zinc-300"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}

            {isActionPending && (
              <div className="flex gap-2 max-w-[85%] mr-auto">
                <div className="p-1.5 h-5 w-5 rounded shrink-0 flex items-center justify-center bg-indigo-950/60 border border-indigo-500/20 text-indigo-400">
                  <Bot size={9} />
                </div>
                <div className="p-2.5 rounded-lg border border-zinc-900 bg-zinc-900/20 text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FIELD BAR */}
          <form onSubmit={handleSendMessage} className="p-2.5 border-t border-zinc-900 bg-zinc-950/80">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!nodeId || isActionPending}
                placeholder={nodeId ? "Ask a question..." : "Select a node context"}
                className="w-full bg-zinc-900 text-[11px] font-mono border border-zinc-800 rounded-md pl-2.5 pr-8 h-7 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={!nodeId || !input.trim() || isActionPending}
                className="absolute right-1.5 p-1 text-zinc-500 hover:text-indigo-400 transition-colors disabled:opacity-20"
              >
                <Send size={10} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}