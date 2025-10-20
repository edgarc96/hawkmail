#!/bin/bash

echo "=== Configuración Post-Despliegue de Hawkmail.app ==="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "Error: No se encuentra package.json. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

# Configurar dominio personalizado
echo "1. Configurando dominio hawkmail.app..."
vercel domains add hawkmail.app

echo ""
echo "2. Mostrando registros DNS necesarios:"
echo "   A: 76.76.19.19"
echo "   A: 76.76.21.21"
echo "   CNAME: cname.vercel-dns.com"
echo ""

# Listar dominios configurados
echo "3. Verificando dominios configurados:"
vercel domains ls

echo ""
echo "4. Variables de entorno requeridas en el dashboard de Vercel:"
echo "   - TURSO_CONNECTION_URL"
echo "   - TURSO_AUTH_TOKEN"
echo "   - BETTER_AUTH_SECRET"
echo "   - BETTER_AUTH_URL=https://hawkmail.app"
echo "   - NEXT_PUBLIC_APP_URL=https://hawkmail.app"
echo "   - NEXT_PUBLIC_SITE_URL=https://hawkmail.app"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   - STRIPE_SECRET_KEY"
echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo ""

echo "5. Para configurar las variables de entorno:"
echo "   ve al dashboard de Vercel -> Project Settings -> Environment Variables"
echo ""

echo "6. Una vez configuradas las variables, ejecuta:"
echo "   vercel env pull .env.production"
echo "   vercel --prod"
echo ""

echo "=== Configuración completada ==="