#!/bin/bash

# Script para probar el servidor corriendo en el puerto 3001
echo "🚀 Probando servidor en puerto 3001..."
echo ""

# Test basic server response
echo "1. Probando respuesta básica del servidor..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3001
echo ""

# Test dashboard
echo "2. Probando dashboard..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3001/dashboard
echo ""

# Test create user
echo "3. Creando usuario de prueba..."
curl -X POST http://localhost:3001/api/create-test-user \
  -H "Content-Type: application/json" \
  -d "{}" | jq '.'
echo ""

# Test authentication
echo "4. Probando autenticación..."
curl -X POST http://localhost:3001/api/test-auth \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpassword123"}' | jq '.'
echo ""

echo "✅ Pruebas completadas!"
echo "📝 Nota: El servidor está corriendo en http://localhost:3001"