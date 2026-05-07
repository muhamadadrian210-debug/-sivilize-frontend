#!/bin/bash

# Script untuk set environment variables di Vercel
# Jalankan: bash setup-vercel-env.sh

echo "🔧 Setting up Vercel environment variables..."

# Load dari .env lokal
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Set MONGODB_URI
if [ -z "$MONGODB_URI" ]; then
  echo "❌ MONGODB_URI tidak ditemukan di .env"
  exit 1
fi

echo "📝 Setting MONGODB_URI..."
npx vercel env add MONGODB_URI production <<< "$MONGODB_URI"

echo "📝 Setting JWT_SECRET..."
npx vercel env add JWT_SECRET production <<< "$JWT_SECRET"

echo "✅ Environment variables berhasil di-set!"
echo "🚀 Sekarang deploy ulang: vercel --prod"
