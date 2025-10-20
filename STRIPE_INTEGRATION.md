# 🎉 Integración Completa de Stripe

La integración de Stripe ha sido completamente implementada en tu proyecto. Este documento te guiará a través de los pasos finales para activarla.

## ✅ Lo que ya está implementado

### 1. **Código Backend (API Routes)**
- ✅ `/api/stripe/create-checkout-session` - Crea sesiones de checkout
- ✅ `/api/stripe/create-portal-session` - Portal de gestión de clientes
- ✅ `/api/stripe/webhook` - Maneja eventos de Stripe

### 2. **Páginas Frontend**
- ✅ `/stripe/checkout` - Página de selección de planes
- ✅ `/stripe/success` - Página de confirmación de pago
- ✅ `/stripe/cancel` - Página de cancelación

### 3. **Configuración**
- ✅ Utilidad de Stripe en `/src/lib/stripe.ts`
- ✅ Variables de entorno agregadas a `.env.local`
- ✅ Tus credenciales de producción ya están configuradas

---

## 🚀 Pasos para completar la integración

### **Paso 1: Crear Productos en Stripe Dashboard**

Ve a: **https://dashboard.stripe.com/products**

Debes crear **3 productos** con estos **lookup keys** exactos:

#### **Producto 1: Starter Plan**
- Nombre: `Starter Plan`
- Precio: `$20.00 USD` (o tu moneda)
- Tipo: `Recurring` (Mensual)
- **Lookup key:** `starter_plan` ⚠️ **IMPORTANTE: Debe ser exacto**

#### **Producto 2: Pro Plan**
- Nombre: `Pro Plan`
- Precio: `$50.00 USD`
- Tipo: `Recurring` (Mensual)
- **Lookup key:** `pro_plan` ⚠️ **IMPORTANTE: Debe ser exacto**

#### **Producto 3: Enterprise Plan**
- Nombre: `Enterprise Plan`
- Precio: `$200.00 USD`
- Tipo: `Recurring` (Mensual)
- **Lookup key:** `enterprise_plan` ⚠️ **IMPORTANTE: Debe ser exacto**

**Cómo agregar el lookup key:**
1. Crea el producto y precio
2. En la sección del precio, busca "Lookup keys"
3. Click en "Add lookup key"
4. Escribe exactamente: `starter_plan`, `pro_plan`, o `enterprise_plan`
5. Guarda

---

### **Paso 2: Configurar el Webhook**

Ve a: **https://dashboard.stripe.com/webhooks**

1. Click en **"Add endpoint"**
2. **Endpoint URL:** `https://tu-dominio.com/api/stripe/webhook`
   - Para desarrollo local, usa Stripe CLI (ver abajo)
3. **Selecciona estos eventos:**
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.trial_will_end`
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

4. Después de crear el webhook, copia el **Signing secret** (empieza con `whsec_...`)
5. Actualiza tu `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_tu_secret_aqui
   ```

---

### **Paso 3: Activar el Customer Portal**

Ve a: **https://dashboard.stripe.com/settings/billing/portal**

1. Click en **"Activate"**
2. Configura las opciones:
   - ✅ Permitir a los clientes actualizar su plan
   - ✅ Permitir a los clientes cancelar su suscripción
   - ✅ Permitir a los clientes actualizar métodos de pago
3. Guarda los cambios

---

### **Paso 4: Actualizar la URL de tu aplicación**

Cuando despliegues a producción, actualiza en `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

---

## 🧪 Probar la integración localmente

### **Opción 1: Usar Stripe CLI (Recomendado para desarrollo)**

1. Instala Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Autentícate:
   ```bash
   stripe login
   ```

3. Escucha webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copia el webhook secret que aparece (empieza con `whsec_...`) y actualiza tu `.env.local`

5. Inicia tu servidor:
   ```bash
   npm run dev
   ```

6. Ve a: `http://localhost:3000/stripe/checkout`

### **Opción 2: Usar modo de prueba**

1. Cambia tus keys a las de test en `.env.local`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. Usa tarjetas de prueba de Stripe:
   - **Éxito:** `4242 4242 4242 4242`
   - **Fallo:** `4000 0000 0000 0002`
   - Cualquier fecha futura y CVC

---

## 📁 Estructura de archivos creados

```
src/
├── lib/
│   └── stripe.ts                                    # Configuración de Stripe
├── app/
│   ├── api/
│   │   └── stripe/
│   │       ├── create-checkout-session/
│   │       │   └── route.ts                         # API: Crear sesión de checkout
│   │       ├── create-portal-session/
│   │       │   └── route.ts                         # API: Portal de cliente
│   │       └── webhook/
│   │           └── route.ts                         # API: Webhooks de Stripe
│   └── stripe/
│       ├── checkout/
│       │   └── page.tsx                             # Página de checkout
│       ├── success/
│       │   └── page.tsx                             # Página de éxito
│       └── cancel/
│           └── page.tsx                             # Página de cancelación
```

---

## 🔧 Variables de entorno configuradas

Tu archivo `.env.local` ahora incluye:

```bash
# Stripe API Keys (PRODUCTION)
STRIPE_SECRET_KEY=sk_live_51SHJSF91TDPyseec...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SHJSF91TDPyseec...

# Stripe Webhook Secret (Debes obtenerlo del dashboard)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## 🎨 Personalizar los planes

Para cambiar los planes, precios o características, edita:

**Archivo:** `/src/app/stripe/checkout/page.tsx`

```typescript
const plans = [
  {
    name: 'Starter Plan',
    price: '$20',
    period: 'month',
    lookupKey: 'starter_plan',  // Debe coincidir con Stripe
    features: [
      'Up to 1,000 emails per month',
      'Basic templates',
      // ... más características
    ],
  },
  // ... más planes
];
```

---

## 🔐 Seguridad

- ✅ Las claves secretas están en `.env.local` (no se suben a git)
- ✅ Los webhooks verifican la firma de Stripe
- ✅ Todas las operaciones sensibles se hacen en el servidor

---

## 📊 Monitorear pagos

Ve a: **https://dashboard.stripe.com/payments**

Aquí podrás ver:
- Todos los pagos
- Suscripciones activas
- Clientes
- Eventos de webhook

---

## 🆘 Solución de problemas

### **Error: "Price not found for the given lookup_key"**
- Verifica que creaste los productos con los lookup keys exactos
- Los lookup keys son case-sensitive

### **Error: "Webhook signature verification failed"**
- Verifica que el `STRIPE_WEBHOOK_SECRET` sea correcto
- Si usas Stripe CLI, copia el secret que aparece al ejecutar `stripe listen`

### **Error: "STRIPE_SECRET_KEY is not set"**
- Verifica que tu `.env.local` tenga las variables correctas
- Reinicia tu servidor después de agregar variables de entorno

---

## 📚 Recursos adicionales

- [Documentación de Stripe](https://stripe.com/docs)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Testing Stripe](https://stripe.com/docs/testing)

---

## ✨ Próximos pasos

1. ✅ Crear productos en Stripe Dashboard con lookup keys
2. ✅ Configurar webhook
3. ✅ Activar Customer Portal
4. ✅ Probar la integración
5. ✅ Desplegar a producción

---

**¡La integración está lista! Solo necesitas completar la configuración en Stripe Dashboard.** 🎉
