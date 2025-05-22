#!/bin/bash
# Clean frontend build and cache files

set -e

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/.."

cd "$FRONTEND_DIR"

# Remove .next, node_modules/.cache, and dist directories
rm -rf .next node_modules/.cache dist

echo "✅ Frontend cache and build artifacts have been cleaned!" 