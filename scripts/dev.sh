#!/bin/bash
# InsightRAG Development Environment Startup Script
# Usage: ./scripts/dev.sh [-b | --build]

# Exit on error
set -e

# Resolve the root directory of the project
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Ensure local .env exists to prevent startup failures
if [ ! -f ".env" ]; then
  echo -e "\033[1;33m[Info] Local .env file not found. Copying .env.example to .env...\033[0m"
  cp .env.example .env
fi

# Parse build flag
BUILD_FLAG=""
if [ "$1" == "--build" ] || [ "$1" == "-b" ]; then
  echo -e "\033[1;36m[Info] Rebuilding development container images...\033[0m"
  BUILD_FLAG="--build"
fi

echo -e "\033[1;32m=========================================================="
echo " Starting InsightRAG Development Environment..."
echo "=========================================================="
echo "• Frontend will be accessible at: http://localhost:3000"
echo "• Backend docs will be accessible at: http://localhost:8000/docs"
echo -e "==========================================================\033[0m"

docker compose -f docker-compose.dev.yml up $BUILD_FLAG
