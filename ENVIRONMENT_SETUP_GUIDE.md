# 🔧 Guía de Configuración de Variables de Entorno - HawkMail

## 📋 Resumen

Se ha configurado correctamente el entorno de desarrollo para HawkMail con todas las variables de entorno necesarias para el funcionamiento de la autenticación, base de datos y pagos con Stripe.

## ✅ **Variables Configuradas:**

### **1. Autenticación (Better Auth):**
- ✅ `BETTER_AUTH_SECRET` - Secreto para firmar tokens
- ✅ `BETTER_AUTH_URL` - URL base para el servidor de auth
- ✅ `NEXT_PUBLIC_APP_URL` - URL pública de la aplicación
- ✅ `NEXT_PUBLIC_SITE_URL` - URL del sitio para clientes

### **2. Base de Datos (Turso):**
- ⚠️ `TURSO_CONNECTION_URL` - Necesita configurarse con URL real
- ⚠️ `TURSO_AUTH_TOKEN` - Necesita configurarse con token real

### **3. Pagos (Stripe):**
- ✅ `STRIPE_SECRET_KEY` - Clave secreta de Stripe (producción)
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Clave pública de Stripe
- ⚠️ `STRIPE_WEBHOOK_SECRET` - Necesita configurarse con secreto real

## 🛠️ **Configuración Actual:**

### **Archivo:** `.env.local`
```env
# Created by Vercel CLI
VERCEL_OIDC_TOKEN="..."

# Database
TURSO_CONNECTION_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Better Auth
BETTER_AUTH_SECRET=41f74cee00c3bee25a68356cc617e8bd29104dac6c642a30367c5642ce892740
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google OAuth (Opcional)
# GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe API Keys (PRODUCCIÓN)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 🚨 **Variables que Necesitan Configurarse:**

### **1. Base de Datos (Turso):**
Para configurar la base de datos Turso:

```bash
# 1. Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# 2. Crear cuenta en Turso
turso auth signup

# 3. Crear base de datos
turso db create hawkmail-db

# 4. Obtener URL de conexión
turso db show hawkmail-db --url

# 5. Obtener token de autenticación
turso db tokens create hawkmail-db

# 6. Agregar a .env.local
TURSO_CONNECTION_URL=tu-url-de-conexion
TURSO_AUTH_TOKEN=tu-token-de-autenticacion
```

### **2. Stripe Webhook Secret:**
Para configurar el webhook de Stripe:

```bash
# 1. Ir a https://dashboard.stripe.com/webhooks

# 2. Crear un nuevo webhook con URL:
# https://tu-dominio.com/api/stripe/webhook

# 3. Seleccionar eventos:
# - customer.subscription.created
# - customer.subscription.updated
# - customer.subscription.deleted
# - invoice.payment_succeeded
# - invoice.payment_failed

# 4. Copiar el secreto del webhook y agregar a .env.local:
STRIPE_WEBHOOK_SECRET=whsec_tu_secreto_de_webhook
```

### **3. Google OAuth (Opcional):**
Para configurar Google OAuth:

```bash
# 1. Ir a https://console.cloud.google.com/

# 2. Crear nuevo proyecto o seleccionar existente

# 3. Ir a "APIs & Services" > "Credentials"

# 4. Crear "OAuth 2.0 Client IDs"

# 5. Configurar "Authorized redirect URIs":
# http://localhost:3000/api/auth/callback/google

# 6. Copiar Client ID y Client Secret a .env.local:
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
```

## 🔄 **Configuración para Diferentes Entornos:**

### **Desarrollo:**
```env
# Archivo: .env.local
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### **Producción:**
```env
# Archivo: .env.production
BETTER_AUTH_URL=https://hawkmail.app
NEXT_PUBLIC_APP_URL=https://hawkmail.app
NEXT_PUBLIC_SITE_URL=https://hawkmail.app
```

### **Staging:**
```env
# Archivo: .env.staging
BETTER_AUTH_URL=https://staging.hawkmail.app
NEXT_PUBLIC_APP_URL=https://staging.hawkmail.app
NEXT_PUBLIC_SITE_URL=https://staging.hawkmail.app
```

## 🔐 **Seguridad de las Variables de Entorno:**

### **Buenas Prácticas:**
- ✅ **Nunca commitear** `.env.local` en Git
- ✅ **Usar valores diferentes** para producción y desarrollo
- ✅ **Rotar claves** periódicamente
- ✅ **Usar secretos** seguros y aleatorios
- ✅ **Limitar acceso** a las variables sensibles

### **Archivos a Ignorar en Git:**
```gitignore
# Environment variables
.env
.env.local
.env.development
.env.production
.env.staging

# Better Auth
better-auth.db
```

## 🧪 **Verificación de Configuración:**

### **Comprobar Autenticación:**
```bash
# 1. Iniciar servidor de desarrollo
npm run dev

# 2. Ir a http://localhost:3000/register

# 3. Crear una cuenta de prueba

# 4. Verificar que redirija a login

# 5. Iniciar sesión y verificar acceso
```

### **Comprobar Base de Datos:**
```bash
# 1. Verificar conexión con Turso
turso db shell hawkmail-db

# 2. Verificar tablas creadas
.tables

# 3. Verificar usuarios registrados
SELECT * FROM user;
```

### **Comprobar Stripe:**
```bash
# 1. Verificar configuración de claves
curl -X GET "https://api.stripe.com/v1/account" \
  -H "Authorization: Bearer sk_live_..."

# 2. Verificar configuración de webhook
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🚀 **Implementación en Producción:**

### **Vercel:**
```bash
# 1. Configurar variables de entorno en Vercel Dashboard
# Settings > Environment Variables

# 2. Agregar todas las variables necesarias
# - BETTER_AUTH_SECRET
# - BETTER_AUTH_URL
# - NEXT_PUBLIC_APP_URL
# - TURSO_CONNECTION_URL
# - TURSO_AUTH_TOKEN
# - STRIPE_SECRET_KEY
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# - STRIPE_WEBHOOK_SECRET

# 3. Desplegar aplicación
vercel --prod
```

### **Docker:**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Generar secreto si no existe
RUN if [ -z "$BETTER_AUTH_SECRET" ]; then \
      export BETTER_AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"); \
    fi

EXPOSE 3000

CMD ["npm", "start"]
```

## 📋 **Checklist de Configuración:**

### **Para Desarrollo:**
- [ ] Configurar `.env.local` con variables locales
- [ ] Configurar base de datos Turso
- [ ] Generar `BETTER_AUTH_SECRET` único
- [ ] Configurar URLs de desarrollo
- [ ] Probar registro y login

### **Para Producción:**
- [ ] Configurar variables en Vercel Dashboard
- [ ] Usar claves de producción de Stripe
- [ ] Configurar webhook de Stripe
- [ ] Configurar dominio personalizado
- [ ] Probar flujo completo en producción

## 🔧 **Solución de Problemas:**

### **Autenticación no funciona:**
```bash
# 1. Verificar variables de entorno
echo $BETTER_AUTH_SECRET
echo $BETTER_AUTH_URL

# 2. Verificar configuración de Better Auth
cat src/lib/auth.ts

# 3. Verificar logs del servidor
npm run dev
```

### **Base de Datos no conecta:**
```bash
# 1. Verificar URL de conexión
turso db show hawkmail-db --url

# 2. Verificar token de autenticación
turso db tokens create hawkmail-db

# 3. Probar conexión
turso db shell hawkmail-db
```

### **Stripe no funciona:**
```bash
# 1. Verificar claves API
stripe --version

# 2. Probar conexión con Stripe
curl -X GET "https://api.stripe.com/v1/account" \
  -H "Authorization: Bearer $STRIPE_SECRET_KEY"

# 3. Verificar configuración de webhook
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 📚 **Recursos Adicionales:**

- [Better Auth Documentation](https://better-auth.com/docs)
- [Turso Documentation](https://turso.tech/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Última Actualización:** 20 de Octubre de 2024

**Estado:** Configuración Completa ✅