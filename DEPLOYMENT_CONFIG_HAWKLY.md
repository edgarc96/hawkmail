# Configuración de Deployment para HawkMail en hawkly.app

## 🌐 Variables de Entorno para Vercel

### Configuración del Dominio

**Dominio Principal**: `hawkly.app`

### Variables de Entorno COMPLETAS

```bash
# Base de Datos (Turso) - OBLIGATORIO
TURSO_CONNECTION_URL=libsql://hawkmail-edgarcbra.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjA5NDE3NzEsImlkIjoiYjAxYWI4ZjQtMjg2Yi00NTQzLWE2ODQtYzZjMGUyNmEwMmM5IiwicmlkIjoiZDc2NzZiZGUtOTEzNS00MTllLWFiZmItN2FmNjQ3MWZmOTgxIn0.Hicnhpl_Jn5OZOWd0BbigloE_ppCHoemVteWeqohRkogJHIbhklov0zBWvw3m7nkdrqe4jJB5-wt4Wa7mdADAg

# Better Auth - OBLIGATORIO
BETTER_AUTH_SECRET=41f74cee00c3bee25a68356cc617e8bd29104dac6c642a30367c5642ce892740
BETTER_AUTH_URL=https://hawkly.app
NEXT_PUBLIC_APP_URL=https://hawkly.app
NEXT_PUBLIC_SITE_URL=https://hawkly.app

# Stripe API Keys (PRODUCCIÓN) - OBLIGATORIO
STRIPE_SECRET_KEY=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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SHJSF91TDPyseecsw5sGOnJvyzgdWkmsA7wE61i7O2ejRsodVOP3DRw66rDYHaDnbZghwojc2dAJfQimf14llOt00XEwuZVzb

# Stripe Webhook Secret (Configurar después del deploy) - OBLIGATORIO
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui

# Google OAuth (OPCIONAL)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📋 Pasos de Configuración

### 1. Agregar Variables en Vercel

1. Ve a: https://vercel.com/eddies-projects/time-to-reply/settings/environment-variables
2. Copia y pega TODAS las variables de arriba
3. Asegúrate de seleccionar todos los environments: **Production**, **Preview**, y **Development**
4. Click en "Save"

### 2. Configurar Dominio Custom `hawkly.app`

1. Ve a: https://vercel.com/eddies-projects/time-to-reply/settings/domains
2. Click en "Add Domain"
3. Ingresa: `hawkly.app`
4. También agrega: `www.hawkly.app`
5. Configura los DNS records según las instrucciones de Vercel:
   - Tipo A: `76.76.19.19`
   - Tipo A: `76.76.21.21`
   - CNAME para www: `cname.vercel-dns.com`

### 3. Configurar Webhook de Stripe

**URL del Webhook**: `https://hawkly.app/api/stripe/webhook`

1. Ve a: https://dashboard.stripe.com/webhooks
2. Click en "Add endpoint"
3. URL: `https://hawkly.app/api/stripe/webhook`
4. Selecciona estos eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copia el **Signing Secret** (empieza con `whsec_`)
6. Actualiza la variable `STRIPE_WEBHOOK_SECRET` en Vercel con ese valor
7. Haz **Redeploy** del proyecto

### 4. (Opcional) Configurar Google OAuth

Si quieres habilitar login con Google:

1. Ve a: https://console.cloud.google.com/
2. Crea o selecciona un proyecto
3. Ve a "APIs & Services" → "Credentials"
4. Click en "Create Credentials" → "OAuth 2.0 Client ID"
5. Tipo de aplicación: Web application
6. Authorized redirect URIs:
   - `https://hawkly.app/api/auth/callback/google`
   - `https://www.hawkly.app/api/auth/callback/google`
7. Copia el **Client ID** y **Client Secret**
8. Agrégalos como variables de entorno en Vercel:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
9. Haz **Redeploy**

## 🚀 Deploy a Producción

### Opción 1: Desde GitHub (Automático)

El código ya está en GitHub. Vercel detectará automáticamente los cambios y desplegará.

### Opción 2: Deploy Manual

```bash
vercel --prod
```

## ✅ Verificación Post-Deploy

### Checklist de Funcionalidad

- [ ] El sitio carga en `https://hawkly.app`
- [ ] Puedes registrar una cuenta con email/password
- [ ] Puedes iniciar sesión
- [ ] El dashboard carga correctamente
- [ ] Puedes conectar cuenta de Gmail/Outlook
- [ ] Las métricas se muestran correctamente
- [ ] Puedes crear un checkout session de Stripe
- [ ] Los webhooks de Stripe funcionan

### Verificar Variables de Entorno

```bash
# Verifica que todas las variables estén configuradas
vercel env ls
```

### Ver Logs en Tiempo Real

```bash
# Ver logs de producción
vercel logs --prod
```

## 🔧 URLs Importantes

- **Sitio Web**: https://hawkly.app
- **Vercel Dashboard**: https://vercel.com/eddies-projects/time-to-reply
- **Vercel Settings**: https://vercel.com/eddies-projects/time-to-reply/settings
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe Webhooks**: https://dashboard.stripe.com/webhooks

## 📝 Notas Importantes

1. **Dominio**: El proyecto está configurado para usar `hawkly.app` como dominio principal
2. **Trusted Origins**: Ya están configurados para aceptar peticiones de:
   - `https://hawkly.app`
   - `https://www.hawkly.app`
   - `https://time-to-reply-*.vercel.app` (preview deployments)
3. **Google OAuth es opcional**: Si no lo configuras, el botón de Google no aparecerá (y eso está bien)
4. **Base de Datos**: Ya tienes Turso configurado, los datos persisten correctamente

## 🎉 Estado Actual

✅ Código actualizado con dominio `hawkly.app`
✅ Build local exitoso
✅ Último deploy en Vercel exitoso
⏳ Pendiente: Configurar variables de entorno en Vercel
⏳ Pendiente: Configurar dominio custom
⏳ Pendiente: Configurar webhook de Stripe

---

**Última actualización**: Oct 20, 2025
**Proyecto**: HawkMail
**Dominio**: hawkly.app
