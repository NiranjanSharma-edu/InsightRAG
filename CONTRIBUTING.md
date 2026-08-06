# Contributing to InsightRAG

Thank you for your interest in contributing to InsightRAG! We welcome pull requests, bug reports, and suggestions from all developers. Following these guidelines helps ensure a smooth, high-quality development lifecycle for our open-source codebase.

---

## 🛠️ Local Development Setup

To test changes, you can set up the codebase locally either directly on your host machine or via Docker.

### Option A: Direct Host Setup

#### 1. Backend Prerequisites (Python 3.12)
- Navigate to the `backend/` directory:
  ```bash
  cd backend
  ```
- Create and activate a Python virtual environment:
  ```bash
  python -m venv venv
  # Windows (PowerShell):
  .\venv\Scripts\Activate.ps1
  # Linux/macOS:
  source venv/bin/activate
  ```
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Start the development server:
  ```bash
  uvicorn main:app --reload --port 8000
  ```

#### 2. Frontend Prerequisites (Node.js 20)
- Navigate to the `frontend/` directory:
  ```bash
  cd frontend
  ```
- Install dependencies:
  ```bash
  npm install
  ```
- Run the development compiler:
  ```bash
  npm run dev
  ```

### Option B: Containerized Development (Recommended)

Our development container setup supports hot-reloading (via directory mounts) for both frontend and backend code.

- Spin up development containers:
  ```bash
  docker compose -f docker-compose.dev.yml up --build
  ```
  *(Alternatively, you can run `.\scripts\dev.ps1` on Windows or `./scripts/dev.sh` on Unix).*
- The backend listens on port `8000` (API documentation at `/docs`), and the frontend listens on port `3000`.

---

## 🌿 Git Branch Conventions

To keep history clear and searchable, name your branches using the following prefixes:

- `feature/<short-description>`: Adding new functionality (e.g. `feature/add-settings-db`)
- `bugfix/<short-description>`: Resolving software defects (e.g. `bugfix/fix-cors-headers`)
- `docs/<short-description>`: Modifying documentation files (e.g. `docs/update-architecture`)
- `refactor/<short-description>`: Modifying code without adding features or fixing bugs (e.g. `refactor/multi-stage-build`)
- `chore/<short-description>`: Routine tasks or configuration updates (e.g. `chore/update-git-ignore`)

---

## 📝 Commit Message Formatting

We follow semantic commit message guidelines. Write commit messages in the **imperative mood** (e.g. "Add validation" instead of "Added validation"). Use the following structure:

`type: description`

### Common Types:
- `feat`: A new user-facing feature.
- `fix`: A bug fix.
- `docs`: Documentation-only changes.
- `style`: Changes that do not affect code logic (formatting, semi-colons).
- `refactor`: Code restructuring that neither fixes a bug nor adds a feature.
- `test`: Adding or correcting tests.
- `chore`: Modifying build scripts, dependencies, or gitignores.

*Example:* `feat: add custom non-root system user inside production containers`

---

## 🤝 Pull Request Process

1. **Fork and Branch**: Fork the repository, create a new branch from `main`, and implement your changes.
2. **Local Testing**: Verify that all core functionality is working. If you've modified backend code, run tests using:
   ```bash
   cd backend
   pytest -v
   ```
3. **Submit a PR**: Submit a Pull Request targeting our `main` branch. 
4. **Use the Template**: Fill out the Pull Request Template completely:
   - Provide a concise summary of your changes.
   - Link any related issue numbers (e.g. `Closes #123`).
   - Detail the automated/manual verification you performed.
   - Include screenshots or recordings of any visual UI changes.

---

## 📐 Code Style Expectations

### Python (Backend)
- Adhere to the **PEP 8** style guide.
- Keep functions modular with clear type hints where applicable.
- Preserve all existing logging statements and docstrings.

### TypeScript / React (Frontend)
- Use functional React components with proper TypeScript typing.
- Style UI components using CSS or Tailwind classes.
- Ensure proper accessibility and semantic HTML layout.
