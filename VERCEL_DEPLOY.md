# 🚀 Vercel Deployment Guide

## ✅ Código Pusheado a GitHub

El código ya está en GitHub con todos los cambios:
- ✅ Sistema de tickets Zendesk-style
- ✅ Layout de 3 paneles
- ✅ Nuevas tablas de BD
- ✅ API routes completas
- ✅ Componentes frontend

---

## 📋 Pasos para Completar el Deploy

### 1. **Configurar Variables de Entorno en Vercel**

Ve a tu proyecto en Vercel Dashboard y agrega estas variables:

#### **Base de Datos (Turso)**
```
TURSO_CONNECTION_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-token
```

#### **Better Auth**
```
BETTER_AUTH_SECRET=your-secret-key-minimum-32-chars
BETTER_AUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

#### **Google OAuth (Opcional para Gmail sync)**
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

#### **Stripe (Opcional para pagos)**
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

### 2. **Aplicar Migraciones a la BD de Producción**

Una vez deployado, necesitas aplicar las migraciones a Turso:

```bash
# Conectar a tu BD de producción
npx drizzle-kit push --config=drizzle.config.ts

# O si usas Turso CLI
turso db shell your-database < drizzle/0015_rapid_storm.sql
```

---

### 3. **Seed de Datos de Prueba (Opcional)**

Para poblar la BD de producción con emails de prueba:

```bash
# Modificar el script para usar la BD de producción
npm run seed:test
```

O mejor, usa la interfaz web para crear tickets manualmente.

---

### 4. **Verificar el Deploy**

Una vez que Vercel termine el deploy:

#### **A. Verificar que el sitio carga**
```
https://your-app.vercel.app
```

#### **B. Verificar APIs**
```bash
# Lista de tickets
curl https://your-app.vercel.app/api/tickets/list

# Ticket específico
curl https://your-app.vercel.app/api/tickets/1
```

#### **C. Probar el sistema de tickets**
1. Navega a: `https://your-app.vercel.app/tickets`
2. Deberías ver la lista de tickets
3. Click en un ticket para ver el detalle
4. Verifica que los 3 paneles se muestren correctamente

---

## 🔧 Troubleshooting

### Error: "Database connection failed"
**Solución:** Verifica que `TURSO_CONNECTION_URL` y `TURSO_AUTH_TOKEN` estén correctamente configurados en Vercel.

### Error: "Table does not exist"
**Solución:** Aplica las migraciones a la BD de producción:
```bash
npx drizzle-kit push
```

### Error: "Authentication required"
**Solución:** Algunos endpoints requieren auth. Para testing, usa los endpoints públicos:
- `/api/tickets/list` - No requiere auth
- `/api/tickets/[id]` - No requiere auth

### Tickets no aparecen
**Solución:** 
1. Verifica que la BD tenga datos
2. Usa Drizzle Studio para ver la BD de producción
3. O corre el seed script

---

## 📊 Arquitectura en Producción

```
┌─────────────────────────────────────────┐
│         Vercel Edge Network             │
│  (Next.js App + API Routes)             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Turso Database                  │
│  (SQLite/LibSQL)                        │
│  - emails                               │
│  - ticket_messages                      │
│  - ticket_attachments                   │
│  - ticket_events                        │
└─────────────────────────────────────────┘
```

---

## 🎯 Features Disponibles en Producción

### ✅ Funcionando
- Lista de tickets con filtros
- Vista de detalle con 3 paneles
- Thread de mensajes
- Perfil del cliente
- Timeline de actividad
- Editor de respuestas
- Cambio de status/priority
- HTML rendering seguro (DOMPurify)

### ⚠️ Pendiente de Configurar
- Gmail sync (requiere OAuth configurado)
- Envío de emails (requiere SMTP)
- Attachments download (requiere storage)
- WebSocket para tiempo real
- Macros y templates

---

## 🔐 Seguridad en Producción

### Variables de Entorno
- ✅ Nunca commitear `.env.local` a Git
- ✅ Usar Vercel Environment Variables
- ✅ Rotar secrets regularmente

### Base de Datos
- ✅ Usar Turso con autenticación
- ✅ Habilitar backups automáticos
- ✅ Monitorear queries lentas

### APIs
- ✅ Rate limiting (Vercel lo maneja)
- ✅ CORS configurado correctamente
- ✅ Validación de inputs

---

## 📈 Monitoreo

### Vercel Analytics
- Habilitar en Dashboard → Analytics
- Ver performance metrics
- Monitorear errores

### Logs
```bash
# Ver logs en tiempo real
vercel logs your-app --follow

# Ver logs de producción
vercel logs your-app --prod
```

---

## 🚀 Próximos Pasos

1. **Configurar Gmail OAuth**
   - Crear credenciales en Google Cloud Console
   - Agregar a Vercel env vars
   - Probar sync de emails

2. **Configurar SMTP para envío**
   - Usar Gmail API o SendGrid
   - Implementar en `/api/tickets/[id]/reply`

3. **Storage para Attachments**
   - Configurar Vercel Blob o S3
   - Implementar upload/download

4. **WebSocket para Tiempo Real**
   - Usar Vercel Edge Functions
   - O integrar Pusher/Ably

---

## 📞 Soporte

Si tienes problemas:
1. Revisa logs en Vercel Dashboard
2. Verifica variables de entorno
3. Checa que las migraciones estén aplicadas
4. Consulta la documentación en `ZENDESK_ROADMAP.md`

---

**Deploy Status:** En progreso...
**URL:** Se mostrará cuando termine el deploy
