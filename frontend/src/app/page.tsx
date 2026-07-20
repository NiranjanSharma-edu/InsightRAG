"use client";

import Link from "next/link";
import { 
  Sparkles, FileText, Cpu, Database, Search, MessageSquareQuote, 
  CheckCircle2, ArrowRight, ShieldCheck, Zap, Layers 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden border-b border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-medium shadow-inner backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interview-Ready Production RAG Pipeline</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight max-w-4xl mx-auto">
            Extract Deep Answers from Technical PDFs with <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">Grounded Citations</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            InsightRAG is an open-source Retrieval-Augmented Generation engine built from scratch with FastAPI, FAISS, Sentence Transformers, and Next.js 15.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/upload"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition transform hover:-translate-y-0.5"
            >
              Upload PDF Documents <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 font-medium text-sm flex items-center justify-center transition"
            >
              Explore Architecture
            </Link>
          </div>
        </div>
      </section>

      {/* RAG Workflow Interactive Diagram */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Clean RAG Architecture Pipeline</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Separated responsibilities ensuring performance, scalability, and modular component swapping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[
              { icon: FileText, title: "1. PyMuPDF", desc: "Page-level PDF text extraction & metadata preserving." },
              { icon: Layers, title: "2. Sliding Window", desc: "Configurable recursive text chunking." },
              { icon: Cpu, title: "3. Embeddings", desc: "SentenceTransformer all-MiniLM-L6-v2 vector encoding." },
              { icon: Database, title: "4. FAISS Store", desc: "IndexFlatIP Cosine similarity vector search index." },
              { icon: Search, title: "5. Prompt Construction", desc: "Context assembly with document metadata." },
              { icon: MessageSquareQuote, title: "6. LLM Generation", desc: "Grounded answer + precise page citations." },
            ].map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-indigo-500/40 transition group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-200 text-sm">{step.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Breakdown */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Modern Engineering Tech Stack</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Built using industry-standard open-source technologies designed for reproducibility and clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Next.js 15 & React 19", category: "Frontend", desc: "App Router, TypeScript, Tailwind CSS" },
              { name: "FastAPI & Python 3.11", category: "Backend API", desc: "Async execution, Pydantic, Clean architecture" },
              { name: "FAISS & SQLite", category: "Storage Engine", desc: "In-memory/on-disk vector search + metadata store" },
              { name: "Sentence Transformers", category: "ML Engine", desc: "384-dim dense vector embeddings" },
            ].map((tech, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl hover:border-slate-700 transition">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-indigo-400 font-mono uppercase tracking-wider">{tech.category}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-200 mt-3">{tech.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-300">InsightRAG</span> – Open-Source AI Technical Document Assistant
          </div>
          <div>Built with Next.js 15, FastAPI, FAISS & SentenceTransformers</div>
        </div>
      </footer>
    </div>
  );
}
