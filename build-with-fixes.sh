#!/bin/bash
# Build Script mit allen Cache-Fixes für Replit.com Hosting

echo "🔧 Build mit Replit.com Hosting Fixes"

# Cache-Fixes anwenden
source enhanced-pre-build.sh

# Normale Build-Prozess
vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Static Files für Production Server vorbereiten
bash replit-hosting-complete-fix.sh

echo "✅ Build mit Hosting-Fixes complete"