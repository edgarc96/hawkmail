# Post-Deployment Checklist para HawkMail

## ✅ Cambios Implementados

### Correcciones de Build
- [x] Eliminadas exportaciones inválidas del route handler WebSocket
- [x] Excluida carpeta `scripts` del build de TypeScript
- [x] Corregidos tipos de Stripe Subscription
- [x] Agregado Suspense a componentes con `useSearchParams()`
- [x] Hecho Google OAuth opcional (no requerido)
- [x] Agregado soporte para Vercel preview deployments
- [x] Configurado secret de Better Auth con fallback

## 🔐 Variables de Entorno Requeridas en Vercel

### Base de Datos (Turso) - **OBLIGATORIO**
```bash
TURSO_CONNECTION_URL=libsql://hawkmail-edgarcbra.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjA5NDE3NzEsImlkIjoiYjAxYWI4ZjQtMjg2Yi00NTQzLWE2ODQtYzZjMGUyNmEwMmM5IiwicmlkIjoiZDc2NzZiZGUtOTEzNS00MTllLWFiZmItN2FmNjQ3MWZmOTgxIn0.Hicnhpl_Jn5OZOWd0BbigloE_ppCHoemVteWeqohRkogJHIbhklov0zBWvw3m7nkdrqe4jJB5-wt4Wa7mdADAg
```

### Better Auth - **OBLIGATORIO**
```bash
BETTER_AUTH_SECRET=41f74cee00c3bee25a68356cc617e8bd29104dac6c642a30367c5642ce892740
BETTER_AUTH_URL=https://tu-dominio.vercel.app
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
```

⚠️ **IMPORTANTE**: Reemplaza `tu-dominio.vercel.app` con tu URL real de Vercel después del primer deploy.

### Stripe API Keys (PRODUCCIÓN) - **OBLIGATORIO**
```bash
STRIPE_SECRET_KEY=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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SHJSF91TDPyseecsw5sGOnJvyzgdWkmsA7wE61i7O2ejRsodVOP3DRw66rDYHaDnbZghwojc2dAJfQimf14llOt00XEwuZVzb
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

⚠️ **NOTA**: El `STRIPE_WEBHOOK_SECRET` se obtiene después de configurar el webhook en Stripe Dashboard.

### Google OAuth - **OPCIONAL**
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Si no configuras estas variables, el botón de Google Sign-In no estará disponible (y eso está bien).

## 📝 Pasos Post-Deployment

### 1. Primer Deploy
```bash
# El código ya está en GitHub, Vercel lo desplegará automáticamente
# O puedes hacer deploy manual con:
vercel --prod
```

### 2. Actualizar URLs de Better Auth
Después del primer deploy exitoso:
1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Actualiza estas variables con la URL real:
   - `BETTER_AUTH_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SITE_URL`
3. Haz un Redeploy

### 3. Configurar Webhook de Stripe
1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Crea un nuevo webhook endpoint: `https://tu-dominio.vercel.app/api/stripe/webhook`
3. Selecciona los eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copia el **Signing Secret** (comienza con `whsec_`)
5. Agrega `STRIPE_WEBHOOK_SECRET` en Vercel con ese valor
6. Haz un Redeploy

### 4. Configurar Dominio Personalizado (Opcional)
Si tienes `hawkmail.app`:
1. Ve a Vercel Dashboard → Settings → Domains
2. Agrega `hawkmail.app`
3. Configura DNS según las instrucciones de Vercel
4. Actualiza las variables de entorno con el nuevo dominio
5. Haz un Redeploy

### 5. Configurar Google OAuth (Opcional)
Si quieres habilitar Google Sign-In:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea o selecciona un proyecto
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Agrega Authorized redirect URIs:
   - `https://tu-dominio.vercel.app/api/auth/callback/google`
6. Copia Client ID y Client Secret
7. Agrégalos en Vercel Environment Variables
8. Haz un Redeploy

## 🧪 Verificación Post-Deployment

### Funcionalidad Básica
- [ ] El sitio carga correctamente
- [ ] Puedes registrar una nueva cuenta
- [ ] Puedes iniciar sesión con email/password
- [ ] El dashboard carga correctamente

### Base de Datos
- [ ] Los datos se guardan correctamente
- [ ] Las consultas funcionan sin errores

### Stripe
- [ ] Puedes iniciar un checkout session
- [ ] Los webhooks se reciben correctamente
- [ ] Las suscripciones se crean en la base de datos

### Google OAuth (Si está configurado)
- [ ] El botón de Google aparece
- [ ] Puedes iniciar sesión con Google
- [ ] Se crea el usuario correctamente

## 🚨 Solución de Problemas Comunes

### Error: "Better Auth Error - invalid_code"
**Causa**: Las variables de entorno no están configuradas correctamente.
**Solución**: 
1. Verifica que `BETTER_AUTH_SECRET` esté configurado
2. Verifica que las URLs (`BETTER_AUTH_URL`, etc.) sean correctas
3. Haz un Redeploy después de cambiar variables

### Error: Build Failed - TypeScript
**Causa**: Errores de tipo o archivos no excluidos.
**Solución**: Ya corregido en el código actual.

### Error: Database Connection
**Causa**: Variables de Turso incorrectas o expiradas.
**Solución**:
1. Verifica `TURSO_CONNECTION_URL`
2. Verifica `TURSO_AUTH_TOKEN`
3. Regenera el token si es necesario

### Error: Stripe Webhook
**Causa**: Secret de webhook incorrecto.
**Solución**:
1. Verifica el secret en Stripe Dashboard
2. Actualiza `STRIPE_WEBHOOK_SECRET` en Vercel
3. Haz un Redeploy

## 📊 Estado Actual

**Última actualización**: Oct 20, 2025
**Código en GitHub**: ✅ Actualizado
**Build Status**: ⏳ Pendiente verificación
**Variables configuradas**: ⚠️ Pendiente configuración en Vercel

## 🔄 Próximos Pasos

1. **Inmediato**: Configurar variables de entorno en Vercel Dashboard
2. **Después del deploy**: Actualizar URLs con el dominio real
3. **Configuración Stripe**: Configurar webhook endpoint
4. **Opcional**: Configurar Google OAuth si se desea
5. **Testing**: Verificar toda la funcionalidad

---

💡 **Tip**: Guarda este archivo para referencia futura. Todas las correcciones necesarias ya están implementadas en el código.
