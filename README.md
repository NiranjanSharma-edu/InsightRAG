# InsightRAG – AI Research & Document Assistant

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000.svg?style=flat&logo=Next.js&logoColor=white)](https://nextjs.org/)
[![FAISS](https://img.shields.io/badge/FAISS-CPU-blue.svg)](https://github.com/facebookresearch/faiss)
[![Sentence Transformers](https://img.shields.io/badge/SentenceTransformers-all--MiniLM--L6--v2-orange.svg)](https://www.sbert.net/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**InsightRAG** is a production-grade, modular Retrieval-Augmented Generation (RAG) system built from scratch to query dense technical PDF documents with natural language and receive grounded answers backed by exact page-level citations.

---

## 🌟 Key Features

- **Document Parsing**: Fast PDF text extraction preserving exact 1-indexed page boundaries via `PyMuPDF` (`fitz`).
- **Configurable Sliding Window Chunking**: Isolated `TextChunker` module supporting custom chunk sizes and character overlaps.
- **Dense Vector Embeddings**: Local text embedding generation with `SentenceTransformers` (`all-MiniLM-L6-v2`, 384-dim).
- **FAISS Vector Search**: `IndexFlatIP` Cosine Similarity index management with metadata mapping and disk persistence.
- **Grounded Citation Engine**: Interactively view exact source document name, page number, and chunk snippet preview modal for every answer.
- **Multi-Provider LLM Engine**: Seamlessly switch between **OpenAI**, **Groq (Llama-3)**, **Google Gemini**, **Ollama**, and a **Built-in Offline Provider** (works out-of-the-box without API keys).
- **SaaS UI Aesthetic**: Modern Next.js 15 interface built with Tailwind CSS, Lucide icons, dark mode, and micro-animations.

---

## 🏗️ Project Architecture

```
insight-rag/
├── backend/
│   ├── api/                 # FastAPI routers (documents, chat, settings, health)
│   ├── core/                # Central config and structured logging
│   ├── database/            # SQLite engine, models, session manager
│   ├── models/              # Pydantic schemas
│   ├── rag/                 # Core RAG pipeline modules
│   │   ├── loader.py        # PyMuPDF PDF loader & cleaner
│   │   ├── chunker.py       # Sliding window recursive text chunker
│   │   ├── embeddings.py    # SentenceTransformers embedding service
│   │   ├── vector_store.py  # FAISS index management & persistence
│   │   ├── retriever.py     # Similarity search pipeline
│   │   ├── prompt_builder.py# Grounded context prompt builder
│   │   └── generator.py     # Multi-provider LLM generator (OpenAI, Groq, Gemini, Ollama, Mock)
│   ├── services/            # Document processing & deletion services
│   ├── tests/               # Pytest suite (loader, chunker, vector store, API)
│   └── main.py              # FastAPI app entrypoint
│
├── frontend/                # Next.js 15 App Router Frontend
│   ├── src/
│   │   ├── app/             # Page routes (/, /upload, /chat, /settings, /about)
│   │   ├── components/      # Reusable UI components (Navbar, Cards, Modals)
│   │   └── lib/             # Typed API client for FastAPI
├── docker/                  # Dockerfiles for Backend and Frontend
├── docs/                    # Architecture diagrams and Learning Notes / Interview Q&A
└── docker-compose.yml       # Single-command spin up
```

---

## ⚡ Quick Start

### Option 1: Docker Compose (Recommended)

Run the entire application in containerized mode with one command:

```bash
docker-compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Local Manual Setup

#### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Development Workflow

The local development environment uses Docker Compose with **Hot Reloading** enabled for both the frontend (Next.js Fast Refresh) and backend (FastAPI / Uvicorn reload). You don't have to rebuild the containers when editing code.

### 1. Initial Setup
A template environment file `.env.example` is provided in the root directory.
The startup scripts will automatically copy `.env.example` to `.env` if it does not already exist. You can populate `.env` with your LLM provider API keys:
- `OPENAI_API_KEY`
- `GROQ_API_KEY`
- `GEMINI_API_KEY`

### 2. Development Commands
You can start the development server using the helper scripts:

**For Windows (PowerShell):**
```powershell
.\scripts\dev.ps1
```

**For Unix (Linux/macOS/Git Bash):**
```bash
./scripts/dev.sh
```

These scripts will spin up the development containers in the foreground. If you need to force-rebuild the containers (e.g., after updating dependencies), pass the build flag:
- PowerShell: `.\scripts\dev.ps1 -Build`
- Bash: `./scripts/dev.sh --build` (or `-b`)

Alternatively, you can run Docker Compose directly:
```bash
docker compose -f docker-compose.dev.yml up
```

### 3. Folder Structure & Environment Strategy
The Docker refactor introduces a clean separation between development and production configurations:
* `docker/`
  * `Dockerfile.backend.dev`: Development backend Dockerfile (uses uvicorn reload).
  * `Dockerfile.backend.prod`: Production backend Dockerfile (no reload, lightweight).
  * `Dockerfile.frontend.dev`: Development frontend Dockerfile (npm install/run dev).
  * `Dockerfile.frontend.prod`: Production frontend Dockerfile (production node build).
* `docker-compose.dev.yml`: Configured for developers with directory mounting, explicit container names, named networks, healthchecks, and polling enabled for file watching.
* `docker-compose.prod.yml`: Matches production deployments with restart always policies and container isolation.
* `.dockerignore`: Root-level ignore file to keep local dependency modules and database files out of Docker context.
* Environment files:
  * `.env`: Holds developer-specific keys (uncommitted).
  * `.env.development`: Holds development configurations (committed).
  * `.env.production`: Holds production configurations (uncommitted).

### 4. Hot Reload Behavior
- **Backend (FastAPI)**: On Windows hosts, file events inside Docker bind-mounts might not propagate. To address this, the environment parameter `WATCHFILES_FORCE_POLLING=true` is automatically set in development. This forces `watchfiles` to poll the backend source directory, guaranteeing immediate reload when you save a python file.
- **Frontend (Next.js)**: Similarly, `WATCHPACK_POLLING=true` and `CHOKIDAR_USEPOLLING=true` are configured to force Next.js Webpack 5 development watchpack to check files periodically. Editing any UI component triggers Fast Refresh instantly.

### 5. Troubleshooting & Rebuilds
- **When is a Docker rebuild actually required?**
  - If you add or change dependencies in `backend/requirements.txt`.
  - If you add or change packages in `frontend/package.json`.
  - If you change any files inside the `docker/` folder (such as Dockerfiles).
  - *In these cases, run the startup script with the build parameter (e.g. `-Build` or `--build`).*
- **Database/Storage Persistence**:
  - The SQLite database, uploaded PDFs, and FAISS index are mounted directly from the host at `./backend/data`. Stopping or recreating the containers will not delete your indexed documents or chat history.

---

## 🧪 Running Automated Tests

Verify core RAG functions, FAISS indexing, PDF parsing, and API endpoints:

```bash
cd backend
pytest -v
```

---

## 📖 Technical Documentation & Learning Notes

- **[Architecture Deep-Dive](docs/architecture.md)**: Detailed breakdown of the Indexing and Generation pipelines.
- **[Interview Preparation & Learning Notes](docs/learning_notes.md)**: Frequently asked questions on vector math, chunking tradeoffs, PyMuPDF vs pypdf, and hallucination mitigation.
