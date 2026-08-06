"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, Bot, User, FileText, CheckSquare, Square, RefreshCw, 
  BookOpen, ChevronRight, X 
} from "lucide-react";
import { getDocuments, sendChatMessage, DocumentItem, Citation } from "@/lib/api";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citations?: Citation[];
  timestamp: string;
}

export default function ChatPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "Hello! I am your InsightRAG AI Assistant. Upload documents and select them from the left sidebar to ask questions with grounded citations.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const fetchDocs = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data.filter((d) => d.processed));
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  };

  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllDocs = () => {
    if (selectedDocIds.length === documents.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(documents.map((d) => d.id));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userText = inputQuery.trim();
    setInputQuery("");

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const filterIds = selectedDocIds.length > 0 ? selectedDocIds : undefined;
      const res = await sendChatMessage(userText, filterIds);

      const botMsg: Message = {
        id: res.id,
        sender: "assistant",
        text: res.answer,
        citations: res.citations,
        timestamp: new Date(res.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        sender: "assistant",
        text: `Sorry, an error occurred while generating the answer: ${err.message || "Unknown error"}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-950 text-slate-100 overflow-hidden">
      {/* Left Sidebar: Document Filter */}
      <aside className="w-full md:w-80 bg-slate-900/60 border-r border-slate-800 flex flex-col p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-sm text-slate-200">Active Knowledge Base</h2>
          </div>
          <button
            onClick={fetchDocs}
            title="Refresh list"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="py-3 flex items-center justify-between text-xs text-slate-400">
          <span>{selectedDocIds.length > 0 ? `${selectedDocIds.length} selected` : "All documents active"}</span>
          <button
            onClick={selectAllDocs}
            className="text-indigo-400 hover:underline flex items-center gap-1"
          >
            {selectedDocIds.length === documents.length ? "Deselect all" : "Select all"}
          </button>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No processed documents. Upload documents on the Upload page to start querying.
            </div>
          ) : (
            documents.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleSelectDoc(doc.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                    isSelected
                      ? "bg-indigo-950/40 border-indigo-500/50 text-slate-100"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="mt-0.5">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium truncate text-slate-200">{doc.filename}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {doc.page_count} pages • {doc.num_chunks} chunks
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            FAISS Vector Engine
          </span>
          <span>all-MiniLM-L6-v2</span>
        </div>
      </aside>

      {/* Main Chat Feed */}
      <main className="flex-1 flex flex-col bg-slate-950/80 relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 md:gap-4 max-w-3xl ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-indigo-400 border border-slate-700"
                }`}
              >
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`flex flex-col space-y-2 max-w-[85%] ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-900/20"
                      : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Grounded Citations Display */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2 mt-1">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-medium text-[11px] uppercase tracking-wider">
                      <BookOpen className="w-3.5 h-3.5" />
                      Grounded Source Citations ({msg.citations.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((cit, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedCitation(cit)}
                          className="bg-slate-950/80 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/50 rounded-lg p-2.5 cursor-pointer transition flex items-center justify-between group"
                        >
                          <div className="overflow-hidden pr-2">
                            <p className="font-medium text-slate-300 truncate group-hover:text-indigo-300">
                              {cit.document_name}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Page {cit.page_number} • Match Score: {(cit.score * 100).toFixed(1)}%
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-[10px] text-slate-500 px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-sm text-slate-400 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span className="text-xs text-slate-400">Searching vector index & constructing response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask any natural language question about your technical documents..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-3.5 pl-4 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="absolute right-2.5 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="max-w-4xl mx-auto flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
            <span>InsightRAG pipeline: PyMuPDF ➔ SentenceTransformers ➔ FAISS ➔ Prompt Grounding</span>
            <span>Grounded Answers Guarantee</span>
          </div>
        </div>
      </main>

      {/* Citation Preview Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setSelectedCitation(null)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-indigo-400">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-semibold text-lg text-slate-100">Retrieved Context Chunk</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block">Source Document</span>
                <span className="font-medium text-slate-200 truncate block">{selectedCitation.document_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Page Number</span>
                <span className="font-medium text-slate-200">Page {selectedCitation.page_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Chunk Index</span>
                <span className="font-medium text-slate-200">#{selectedCitation.chunk_index}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Cosine Similarity Score</span>
                <span className="font-medium text-indigo-400">{(selectedCitation.score * 100).toFixed(2)}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400">Extracted Text Preview:</span>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
                {selectedCitation.snippet}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCitation(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
