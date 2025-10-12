#!/bin/bash

# Script para agregar variables de entorno a Vercel

echo "Agregando variables de entorno a Vercel..."

# Obtener la URL del proyecto
PROJECT_URL="https://hiho.vercel.app"

echo "$BETTER_AUTH_SECRET" | vercel env add BETTER_AUTH_SECRET production
echo "$PROJECT_URL" | vercel env add BETTER_AUTH_URL production
echo "$PROJECT_URL" | vercel env add NEXT_PUBLIC_APP_URL production
echo "$PROJECT_URL" | vercel env add NEXT_PUBLIC_SITE_URL production
echo "$GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID production
echo "$GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET production
echo "$TURSO_CONNECTION_URL" | vercel env add TURSO_CONNECTION_URL production
echo "$TURSO_AUTH_TOKEN" | vercel env add TURSO_AUTH_TOKEN production

echo "✅ Variables de entorno agregadas exitosamente"
