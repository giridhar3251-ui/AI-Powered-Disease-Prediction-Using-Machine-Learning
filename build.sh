#!/usr/bin/env bash
set -e

echo "=== Building Frontend (React) ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Installing Backend (Python) ==="
cd api
pip install -r requirements.txt
echo "=== Build Complete ==="
