# 🚀 Desplegar Integración de Stripe

## Cambios realizados:

### **Nuevos archivos creados:**
- ✅ `/src/lib/stripe.ts` - Configuración de Stripe
- ✅ `/src/app/api/stripe/create-checkout-session/route.ts` - API checkout
- ✅ `/src/app/api/stripe/create-portal-session/route.ts` - API portal
- ✅ `/src/app/api/stripe/webhook/route.ts` - API webhook
- ✅ `/src/app/stripe/checkout/page.tsx` - Página de checkout
- ✅ `/src/app/stripe/success/page.tsx` - Página de éxito
- ✅ `/src/app/stripe/cancel/page.tsx` - Página de cancelación
- ✅ `/src/components/sections/pricing-section.tsx` - Componente de pricing

### **Archivos modificados:**
- ✅ `/src/app/page.tsx` - Landing page actualizada con integración de Stripe
- ✅ `.env.local` - Variables de entorno de Stripe agregadas
- ✅ `.env.example` - Ejemplo actualizado

---

## 📦 Paso 1: Desplegar a Vercel

```bash
# Asegúrate de estar en el directorio correcto
cd /Users/edgarcabrera/Downloads/time-to-reply

# Commit de los cambios
git add .
git commit -m "feat: Add Stripe integration to landing page"

# Push a tu repositorio
git push origin main
```

Vercel automáticamente desplegará los cambios.

---

## 🔐 Paso 2: Configurar Variables de Entorno en Vercel

Ve a: https://vercel.com/eddies-projects/time-to-reply/settings/environment-variables

Agrega estas variables:

```bash
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here

STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui

NEXT_PUBLIC_APP_URL=https://hawkmail.com
```

**Importante:** Después de agregar las variables, haz **Redeploy** del proyecto.

---

## ⚙️ Paso 3: Configurar Stripe Dashboard

### **A. Webhook**

URL: `https://hawkmail.com/api/stripe/webhook`

Eventos:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Copia el **webhook secret** y actualiza la variable en Vercel.

### **B. Productos**

Crea 3 productos con estos lookup keys:
- `starter_plan` - $20/mes
- `pro_plan` - $50/mes
- `enterprise_plan` - $200/mes

### **C. Customer Portal**

Activa el portal en: https://dashboard.stripe.com/settings/billing/portal

---

## ✅ Verificar que funciona:

1. Ve a: https://hawkmail.com
2. Scroll a la sección "Pricing"
3. Click en "Start Free Trial" de cualquier plan
4. Deberías ser redirigido a Stripe Checkout
5. Usa una tarjeta de prueba: `4242 4242 4242 4242`
6. Completa el checkout
7. Deberías ser redirigido a: https://hawkmail.com/stripe/success

---

## 🐛 Troubleshooting:

### Error: "Price not found"
- Verifica que los productos tengan los lookup keys correctos
- Los lookup keys son case-sensitive

### Error: "Webhook signature verification failed"
- Verifica que el `STRIPE_WEBHOOK_SECRET` en Vercel sea correcto
- Asegúrate de hacer redeploy después de agregar la variable

### Los botones no funcionan
- Verifica que las variables de entorno estén en Vercel
- Revisa los logs en Vercel: https://vercel.com/eddies-projects/time-to-reply/logs

---

## 📊 Monitorear:

- **Pagos:** https://dashboard.stripe.com/payments
- **Suscripciones:** https://dashboard.stripe.com/subscriptions
- **Webhooks:** https://dashboard.stripe.com/webhooks
- **Logs de Vercel:** https://vercel.com/eddies-projects/time-to-reply/logs
