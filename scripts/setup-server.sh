#!/usr/bin/env bash
set -euo pipefail

PROJECT_PATH="${1:-$(pwd)}"
cd "$PROJECT_PATH"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Install Node 20+ and re-run."
  exit 1
fi

if [ ! -f ".env.local" ]; then
  echo "Creating .env.local..."
  read -rp "TMDB_API_KEY: " TMDB_API_KEY
  read -rp "NEXTAUTH_SECRET: " NEXTAUTH_SECRET
  read -rp "ADMIN_EMAIL: " ADMIN_EMAIL
  read -rp "ADMIN_PASSWORD: " ADMIN_PASSWORD

  cat <<EOF > .env.local
TMDB_API_KEY=$TMDB_API_KEY
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
DATABASE_URL="file:./dev.db"
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
EOF
fi

echo "Installing dependencies..."
npm install

echo "Setting up database..."
npm run prisma:generate
npm run prisma:push
npm run seed:admin

echo "Building production..."
npm run build

echo "Setup complete. Start with: npm run start"
