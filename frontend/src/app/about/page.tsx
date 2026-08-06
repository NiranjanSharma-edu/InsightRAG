"use client";

import React from "react";
import { BookOpen } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-medium">
            <BookOpen className="w-3.5 h-3.5" /> Technical Documentation & Learning Objectives
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">About InsightRAG</h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            InsightRAG was designed to showcase line-by-line understanding of fundamental RAG mechanics without relying on high-level frameworks like LlamaIndex or complex multi-agent layers.
          </p>
        </div>

        {/* Core Concepts */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-3">
            What is Retrieval-Augmented Generation (RAG)?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Large Language Models (LLMs) possess vast general knowledge but lack access to private, proprietary, or recently created technical documents. RAG solves this by retrieving relevant text passages from an indexed document repository and passing them directly into the LLM prompt context at query time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <h3 className="font-semibold text-indigo-400 text-xs uppercase tracking-wider mb-2">1. Ingestion Phase</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                PDF text is extracted page by page via PyMuPDF, broken into overlapping character windows, encoded into dense 384D vectors, and indexed in FAISS.
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <h3 className="font-semibold text-indigo-400 text-xs uppercase tracking-wider mb-2">2. Generation Phase</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                User questions are embedded into the same vector space, top-K chunks are retrieved via Cosine Similarity, and an answer with verifiable citations is generated.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Tradeoffs & Interview Questions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-100">Interview Defense & Design Tradeoffs</h2>

          <div className="space-y-4">
            {[
              {
                q: "Why PyMuPDF over default pypdf?",
                a: "PyMuPDF (fitz) provides high extraction speeds and native C-bindings while preserving exact page number metadata needed for accurate citation mapping."
              },
              {
                q: "Why FAISS IndexFlatIP?",
                a: "IndexFlatIP computes Inner Product scores. When embeddings are L2 normalized (as done in SentenceTransformers), Inner Product is mathematically identical to Cosine Similarity."
              },
              {
                q: "How are hallucinations mitigated?",
                a: "Through strict system prompt engineering instructions requiring the LLM to explicitly state when information is absent from the provided context."
              },
              {
                q: "Why sliding window chunking with overlap?",
                a: "Chunk overlap ensures that key semantic statements spanning across block boundaries are not severed during vector embedding."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl space-y-2">
                <h3 className="font-semibold text-sm text-indigo-300">Q: {faq.q}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
