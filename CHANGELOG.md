# Changelog

All notable changes to the InsightRAG project will be documented in this file. This project follows semantic versioning guidelines.

---

## [1.0.0] - 2026-08-06

### Added
- **Phase 1: Local Development Architecture**
  - Configured dockerized hot-reloading for the Next.js frontend (Webpack polling) and FastAPI backend (watchfiles polling).
  - Integrated SQLite database table structures with volume persistence.
  - Added terminal-based convenience scripts (`dev.ps1`, `dev.sh`) for rapid development boot.
  - Formulated clean development configurations in `docker-compose.dev.yml`, `.env.development`, and `.env.example`.

- **Phase 2: Production Docker Optimization**
  - Switched base images to `python:3.12-slim` and `node:20-alpine` for improved performance and security.
  - Implemented multi-stage Docker builds for both services to isolate compilers from runtime environments.
  - Shifted PyTorch installation to CPU-only wheels inside the backend container (saving ~2.3 GB of image size).
  - Configured Next.js standalone builds to compile pages and strip `devDependencies` (saving ~650 MB).
  - Added non-root system users `backend` (UID 10001) and `nextjs` (UID 1001) to containers for hardened runtime execution.
  - Configured a scalable model caching structure `/app/cache/huggingface` linked to persistent volumes, resolving startup HF model downloads.
  - Added pip/npm BuildKit cache mounts to accelerate Docker build times.
  - Integrated container-native `HEALTHCHECK` instructions for portability.

- **Phase 2.0.5: Repository Hardening & Open Source Readiness**
  - Added standard MIT `LICENSE` file.
  - Created `CONTRIBUTING.md` containing setup guides, semantic commit standards, and PR expectations.
  - Added `SECURITY.md` defining supported versions and responsible vulnerability disclosure contacts.
  - Created `.github/CODEOWNERS` referencing ownership rules.
  - Established standardized Pull Request and Issue Templates (`bug_report.md`, `feature_request.md`, `question_support.md`).
  - Redesigned `README.md` into a premium open-source home page with clear architecture layouts, Mermaid diagrams, folder trees, and roadmaps.
  - Performed cross-documentation terminology and setup audits.
