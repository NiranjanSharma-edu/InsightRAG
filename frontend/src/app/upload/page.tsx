"use client";

import React, { useState, useEffect } from "react";
import { 
  Upload, FileText, Trash2, RefreshCw, CheckCircle, AlertCircle, 
  Layers, Eye, X 
} from "lucide-react";
import { 
  getDocuments, uploadDocument, processDocument, deleteDocument, 
  getDocumentChunks, DocumentItem, DocumentChunk 
} from "@/lib/api";

export default function UploadPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedChunks, setSelectedChunks] = useState<{ docName: string; chunks: DocumentChunk[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err: any) {
      setErrorMsg("Failed to connect to backend server. Make sure FastAPI is running on http://localhost:8000.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.name.toLowerCase().endsWith(".pdf")) {
          setErrorMsg("Only PDF files are supported.");
          continue;
        }

        const uploadedDoc = await uploadDocument(file);
        setProcessingId(uploadedDoc.id);
        await processDocument(uploadedDoc.id);
      }
      await loadDocuments();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during file upload.");
    } finally {
      setUploading(false);
      setProcessingId(null);
    }
  };

  const handleProcess = async (docId: string) => {
    setProcessingId(docId);
    setErrorMsg(null);
    try {
      await processDocument(docId);
      await loadDocuments();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process document.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document and its vector embeddings?")) return;
    try {
      await deleteDocument(docId);
      await loadDocuments();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete document.");
    }
  };

  const handleInspectChunks = async (doc: DocumentItem) => {
    try {
      const chunks = await getDocumentChunks(doc.id);
      setSelectedChunks({ docName: doc.filename, chunks });
    } catch (err: any) {
      setErrorMsg("Failed to load chunk preview.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Upload className="w-7 h-7 text-indigo-400" /> Document Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload PDF documents for text parsing, sliding window chunking, and FAISS vector indexing.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/50 border border-rose-500/50 p-4 rounded-xl text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div className="relative border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-10 text-center bg-slate-900/40 hover:bg-slate-900/60 transition group cursor-pointer">
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {uploading ? "Uploading and indexing PDF..." : "Click or drag & drop PDF files to upload"}
              </p>
              <p className="text-xs text-slate-500 mt-1">Supports multi-page research papers, user manuals, and technical reports.</p>
            </div>
          </div>
        </div>

        {/* Document List Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Uploaded Documents ({documents.length})
            </h2>
            <button
              onClick={loadDocuments}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition"
              title="Refresh list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {documents.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-xs">
                No documents uploaded yet. Upload a PDF document above to start indexing.
              </div>
            ) : (
              documents.map((doc) => {
                const isProcessing = processingId === doc.id;
                return (
                  <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/80 transition">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-slate-200 truncate">{doc.filename}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>{doc.page_count} Pages</span>
                          <span>•</span>
                          <span>{doc.num_chunks} Chunks</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {doc.processed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Vector Indexed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400 text-xs font-medium">
                          <AlertCircle className="w-3.5 h-3.5" /> Pending Indexing
                        </span>
                      )}

                      {doc.processed && (
                        <button
                          onClick={() => handleInspectChunks(doc)}
                          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-lg transition"
                          title="Inspect Extracted Chunks"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleProcess(doc.id)}
                        disabled={isProcessing}
                        className="p-2 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition"
                        title="Reprocess Document"
                      >
                        <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin text-indigo-400" : ""}`} />
                      </button>

                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Chunk Inspection Modal */}
      {selectedChunks && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-slate-200">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-lg">Extracted Text Chunks - {selectedChunks.docName}</h3>
              </div>
              <button
                onClick={() => setSelectedChunks(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {selectedChunks.chunks.map((chk) => (
                <div key={chk.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>Chunk #{chk.chunk_index}</span>
                    <span>Page {chk.page_number} • {chk.end_char - chk.start_char} chars</span>
                  </div>
                  <p className="text-xs font-mono text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/40">
                    {chk.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedChunks(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
