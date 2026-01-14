#!/usr/bin/env bash
set -euo pipefail

PROJECT_PATH="${1:-$(pwd)}"
cd "$PROJECT_PATH"

echo "Pulling latest changes..."
git pull --rebase

echo "Installing dependencies..."
npm install

echo "Updating database..."
npm run prisma:generate
npm run prisma:push

echo "Building production..."
npm run build

echo "Update complete. Restart the process manager if needed."
