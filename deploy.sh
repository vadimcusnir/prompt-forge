#!/bin/bash

# 🚀 PROMPTFORGE™ v3.0 - SCRIPT DE DEPLOYMENT AUTOMAT
# Acest script configurează și deployează PromptForge pe Vercel

echo "🚀 PROMPTFORGE™ v3.0 - DEPLOYMENT AUTOMAT"
echo "=============================================="

# 1. Verifică dependențele
echo "📦 Verifică dependențele..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nu este instalat!"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm nu este instalat!"
    exit 1
fi

if ! command -v vercel &> /dev/null; then
    echo "📥 Instalează Vercel CLI..."
    npm install -g vercel
fi

# 2. Instalează dependențele
echo "📥 Instalează dependențele..."
pnpm install

# 3. Testează build-ul local
echo "🔨 Testează build-ul local..."
pnpm build

if [ $? -ne 0 ]; then
    echo "❌ Build-ul a eșuat! Verifică erorile."
    exit 1
fi

echo "✅ Build-ul local funcționează!"

# 4. Verifică fișierele de configurare
echo "🔍 Verifică configurația..."
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json lipsește!"
    exit 1
fi

if [ ! -f "cursor/init" ]; then
    echo "❌ /cursor/init lipsește!"
    exit 1
fi

if [ ! -f "agent.ts" ]; then
    echo "❌ agent.ts lipsește!"
    exit 1
fi

echo "✅ Toate fișierele de configurare sunt prezente!"

# 5. Deploy pe Vercel
echo "🚀 Deploy pe Vercel..."
echo "⚠️  Asigură-te că ești logat în Vercel!"

read -p "Vrei să continui cu deployment-ul? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment anulat."
    exit 1
fi

# Deploy
vercel --prod

if [ $? -eq 0 ]; then
    echo "🎉 PROMPTFORGE™ v3.0 a fost deployat cu succes!"
    echo ""
    echo "📋 URMĂTORII PAȘI:"
    echo "1. Configurează environment variables în Vercel Dashboard"
    echo "2. Conectează la Supabase production"
    echo "3. Configurează Stripe production"
    echo "4. Testează toate funcționalitățile"
    echo "5. Configurează domain-ul personal"
    echo ""
    echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"
    echo "📚 Documentație: https://vercel.com/docs"
else
    echo "❌ Deployment-ul a eșuat! Verifică erorile."
    exit 1
fi

echo ""
echo "🎯 PROMPTFORGE™ v3.0 este gata de producție!"
