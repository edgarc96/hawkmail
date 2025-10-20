# ⚡ Configuración Rápida de Stripe

## ✅ Lo que ya está hecho:

1. ✅ Integración completa de Stripe en el código
2. ✅ Sección de pricing en landing page conectada a Stripe
3. ✅ Tus credenciales de producción configuradas
4. ✅ URL de tu app configurada: `https://hawkmail.com`

---

## 🚀 Pasos finales (5 minutos):

### **1. Configurar el Webhook en Stripe**

En la pantalla donde estás ahora:

**URL del punto de conexión:**
```
https://hawkmail.com/api/stripe/webhook
```

**Descripción:**
```
Webhook para eventos de suscripciones de HawkMail
```

Luego click en **"Continuar"** y selecciona estos eventos:
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `customer.subscription.trial_will_end`
- ✅ `checkout.session.completed`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

Después de guardar, copia el **Signing secret** (empieza con `whsec_...`) y actualiza tu `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_tu_secret_aqui
```

---

### **2. Crear Productos en Stripe**

Ve a: https://dashboard.stripe.com/products

Crea estos 3 productos:

#### **Producto 1:**
- Nombre: `Starter Plan`
- Precio: `$20.00 USD/mes`
- **Lookup key:** `starter_plan` ⚠️ Exacto

#### **Producto 2:**
- Nombre: `Professional Plan`
- Precio: `$50.00 USD/mes`
- **Lookup key:** `pro_plan` ⚠️ Exacto

#### **Producto 3:**
- Nombre: `Enterprise Plan`
- Precio: `$200.00 USD/mes`
- **Lookup key:** `enterprise_plan` ⚠️ Exacto

---

### **3. Activar Customer Portal**

Ve a: https://dashboard.stripe.com/settings/billing/portal

- Click en **"Activate"**
- Permite a los clientes:
  - ✅ Actualizar plan
  - ✅ Cancelar suscripción
  - ✅ Actualizar método de pago

---

## 🎉 ¡Listo!

Ahora cuando los usuarios visiten **https://hawkmail.com** y hagan click en cualquier plan de la sección de pricing, serán redirigidos automáticamente a Stripe Checkout.

### **Flujo del usuario:**

1. Usuario visita `hawkmail.com`
2. Hace scroll a la sección "Pricing"
3. Click en "Start Free Trial" de cualquier plan
4. Es redirigido a Stripe Checkout
5. Completa el pago
6. Es redirigido a `hawkmail.com/stripe/success`
7. Puede gestionar su suscripción desde el Customer Portal

---

## 🧪 Probar:

1. Ve a: https://hawkmail.com
2. Scroll a la sección de pricing
3. Click en cualquier plan
4. Deberías ser redirigido a Stripe Checkout

---

## 📝 Notas:

- Los precios en el landing page son: $20, $50, $200
- Asegúrate de crear los productos en Stripe con esos precios
- Los lookup keys DEBEN ser exactos: `starter_plan`, `pro_plan`, `enterprise_plan`
