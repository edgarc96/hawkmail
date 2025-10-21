#!/bin/bash

echo "🔧 Configuración de OAuth de Google para HawkMail"
echo "=============================================="
echo ""
echo "Este script te guiará a través del proceso de configuración de OAuth de Google."
echo "Por favor, sigue las instrucciones cuidadosamente."
echo ""

# Verificar si las variables de entorno ya están configuradas
if [ -f ".env.local" ] && grep -q "GOOGLE_CLIENT_ID=" .env.local && grep -q "GOOGLE_CLIENT_SECRET=" .env.local; then
    echo "⚠️ Las variables de entorno de Google OAuth ya están configuradas."
    echo "¿Deseas actualizarlas? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "❌ Configuración cancelada."
        exit 0
    fi
fi

echo "📋 Antes de continuar, necesitas:"
echo "1. Una cuenta de Google"
echo "2. Un proyecto en Google Cloud Console"
echo ""
echo "Si aún no tienes un proyecto, visita:"
echo "https://console.cloud.google.com/"
echo ""
echo "Presiona Enter para continuar cuando estés listo..."
read

echo "🌐 Abriendo Google Cloud Console..."
echo "Por favor, sigue estos pasos:"
echo "1. Crea un nuevo proyecto o selecciona uno existente"
echo "2. Habilita la Gmail API"
echo "3. Configura la pantalla de consentimiento de OAuth"
echo "4. Crea las credenciales de OAuth 2.0"
echo ""

# Abrir Google Cloud Console
if command -v open &> /dev/null; then
    open "https://console.cloud.google.com/"
elif command -v xdg-open &> /dev/null; then
    xdg-open "https://console.cloud.google.com/"
else
    echo "Por favor, abre manualmente: https://console.cloud.google.com/"
fi

echo "📝 Una vez que hayas creado las credenciales, ingresa los siguientes datos:"
echo ""

# Solicitar ID de cliente
echo "1. Ingresa tu ID de cliente (termina en .apps.googleusercontent.com):"
read -r client_id

# Solicitar cliente secreto
echo "2. Ingresa tu cliente secreto:"
read -r client_secret

# Verificar que los datos no estén vacíos
if [ -z "$client_id" ] || [ -z "$client_secret" ]; then
    echo "❌ Error: El ID de cliente y el cliente secreto no pueden estar vacíos."
    exit 1
fi

# Actualizar archivo .env.local
echo "🔧 Actualizando archivo .env.local..."

# Crear backup del archivo .env.local si existe
if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup
fi

# Agregar o actualizar las variables de entorno
if grep -q "GOOGLE_CLIENT_ID=" .env.local; then
    # Actualizar variables existentes
    sed -i.bak "s/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=$client_id/" .env.local
    sed -i.bak "s/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$client_secret/" .env.local
else
    # Agregar nuevas variables
    echo "" >> .env.local
    echo "# Google OAuth" >> .env.local
    echo "GOOGLE_CLIENT_ID=$client_id" >> .env.local
    echo "GOOGLE_CLIENT_SECRET=$client_secret" >> .env.local
fi

echo "✅ Variables de entorno configuradas correctamente."
echo ""
echo "🔄 Reinicia el servidor de desarrollo para aplicar los cambios:"
echo "npm run dev"
echo ""
echo "🎉 Una vez que el servidor se haya reiniciado, podrás:"
echo "1. Iniciar sesión en la aplicación"
echo "2. Ir a Settings > Email Providers"
echo "3. Hacer clic en 'Connect Gmail'"
echo "4. Sincronizar tus correos"
echo ""
echo "📚 Para más información, consulta la guía en GOOGLE_OAUTH_SETUP.md"