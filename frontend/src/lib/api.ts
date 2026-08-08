// InsightRAG production frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface DocumentItem {
  id: string;
  filename: string;
  file_size: number;
  upload_date: string;
  processed: boolean;
  num_chunks: number;
  page_count: number;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  text: string;
  page_number: number;
  start_char: number;
  end_char: number;
}

export interface Citation {
  document_id: string;
  document_name: string;
  page_number: number;
  chunk_index: number;
  score: number;
  snippet: string;
}

export interface ChatResponse {
  id: string;
  question: string;
  answer: string;
  citations: Citation[];
  created_at: string;
}

export interface SystemSettings {
  chunk_size: number;
  chunk_overlap: number;
  top_k: number;
  embedding_model: string;
  temperature: number;
  llm_provider: string;
  api_key?: string;
}

export async function getDocuments(): Promise<DocumentItem[]> {
  const res = await fetch(`${API_BASE_URL}/documents`);
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function uploadDocument(file: File): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function processDocument(documentId: string): Promise<DocumentItem> {
  const res = await fetch(`${API_BASE_URL}/documents/${documentId}/process`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Processing failed");
  return res.json();
}

export async function getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
  const res = await fetch(`${API_BASE_URL}/documents/${documentId}/chunks`);
  if (!res.ok) throw new Error("Failed to fetch chunks");
  return res.json();
}

export async function deleteDocument(documentId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Deletion failed");
}

export async function sendChatMessage(
  question: string,
  documentIds?: string[]
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      document_ids: documentIds,
      stream: false,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Chat request failed");
  }
  return res.json();
}

export async function getSettings(): Promise<SystemSettings> {
  const res = await fetch(`${API_BASE_URL}/settings`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export async function updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
}
