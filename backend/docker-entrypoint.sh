#!/bin/bash
set -e

# Pre-create directory paths under the runtime-mounted volume
mkdir -p /app/data/uploads /app/data/huggingface /app/data/vector_store
mkdir -p /app/cache/huggingface

# Chown the top-level directories to the backend user (non-recursive for model caches)
chown backend:backend /app/data /app/cache
chown backend:backend /app/data/huggingface /app/cache/huggingface

# Recursive chown only on small, user-specific data directories
chown -R backend:backend /app/data/uploads /app/data/vector_store

# Ensure SQLite database file is owned by the backend user if it exists
if [ -f /app/data/insight_rag.db ]; then
    chown backend:backend /app/data/insight_rag.db
fi

echo "Dropping privileges and executing command as backend..."
exec gosu backend "$@"
