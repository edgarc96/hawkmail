#!/bin/bash

echo "🚀 Iniciando el proceso de deploy de HawkMail usando Git..."

# Verificar si estamos en la rama main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "❌ Error: No estás en la rama main. Cambia a la rama main antes de hacer deploy."
    exit 1
fi

# Verificar si hay cambios sin commit
if ! git diff-index --quiet HEAD --; then
    echo "⚠️ Hay cambios sin commit. ¿Deseas hacer commit de los cambios? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        echo "📝 Haciendo commit de los cambios..."
        git add .
        git commit -m "feat: Add email content viewing and reply functionality"
        echo "✅ Commit realizado con éxito."
    else
        echo "❌ Deploy cancelado. Haz commit de los cambios primero."
        exit 1
    fi
fi

# Hacer push de los cambios
echo "📤 Haciendo push de los cambios al repositorio..."
git push origin main
echo "✅ Push realizado con éxito."

echo "🌐 Vercel detectará automáticamente los cambios y hará un deploy."
echo "📊 Puedes verificar el estado del deploy en: https://vercel.com/dashboard"
echo ""
echo "⏱️ El deploy puede tardar unos minutos en completarse."
echo ""
echo "📋 No olvides ejecutar la migración de la base de datos en producción:"
echo "   ALTER TABLE emails ADD COLUMN body_content text;"
echo ""
echo "🔗 Una vez que el deploy se complete, verifica la aplicación en: https://hawkmail.app"