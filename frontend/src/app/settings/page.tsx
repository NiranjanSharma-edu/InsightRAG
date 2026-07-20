"use client";

import React, { useState, useEffect } from "react";
import { Sliders, Save, Cpu, Key, Database, RefreshCw, CheckCircle2 } from "lucide-react";
import { getSettings, updateSettings, SystemSettings } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    chunk_size: 500,
    chunk_overlap: 50,
    top_k: 4,
    embedding_model: "all-MiniLM-L6-v2",
    temperature: 0.2,
    llm_provider: "mock",
    api_key: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setMessage("Settings updated successfully!");
    } catch (err: any) {
      setMessage(`Failed to update settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Sliders className="w-7 h-7 text-indigo-400" /> System Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure RAG text chunking strategies, top-K retrieval parameters, and LLM provider credentials.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
              message.includes("successfully")
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/40 border-rose-500/40 text-rose-300"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Chunking Settings Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" /> Document Chunking Strategy
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Chunk Size (Characters)
                </label>
                <input
                  type="number"
                  value={settings.chunk_size}
                  onChange={(e) => setSettings({ ...settings, chunk_size: parseInt(e.target.value) || 100 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Target length for sliding text windows.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Chunk Overlap (Characters)
                </label>
                <input
                  type="number"
                  value={settings.chunk_overlap}
                  onChange={(e) => setSettings({ ...settings, chunk_overlap: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Character overlap between adjacent chunks.
                </span>
              </div>
            </div>
          </div>

          {/* Retrieval Settings Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" /> Retrieval & Embedding Parameters
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Top-K Retrieved Chunks
                </label>
                <input
                  type="number"
                  value={settings.top_k}
                  min={1}
                  max={20}
                  onChange={(e) => setSettings({ ...settings, top_k: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Number of vector passages to query from FAISS.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Embedding Model
                </label>
                <input
                  type="text"
                  disabled
                  value={settings.embedding_model}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Sentence Transformers (384-dimensional).
                </span>
              </div>
            </div>
          </div>

          {/* LLM Provider Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" /> LLM Generation Engine
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  LLM Provider
                </label>
                <select
                  value={settings.llm_provider}
                  onChange={(e) => setSettings({ ...settings, llm_provider: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="mock">Built-in Offline Engine (No API Key Required)</option>
                  <option value="openai">OpenAI (GPT-3.5 / GPT-4)</option>
                  <option value="groq">Groq (Llama-3 High-Speed)</option>
                  <option value="gemini">Google Gemini 1.5 Flash</option>
                  <option value="ollama">Ollama (Local Server)</option>
                </select>
              </div>

              {settings.llm_provider !== "mock" && settings.llm_provider !== "ollama" && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={settings.api_key || ""}
                    onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                    placeholder={`Enter ${settings.llm_provider.toUpperCase()} API Key`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Temperature ({settings.temperature})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
                <span className="text-[11px] text-slate-500 block">
                  Lower temperature (e.g. 0.2) guarantees strictly grounded factual responses.
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
