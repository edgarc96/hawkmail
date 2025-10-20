# 🔑 Cómo Agregar Lookup Keys en Stripe

## ⚠️ IMPORTANTE: Debes agregar lookup keys a tus productos

Veo que creaste los productos pero falta agregarles los **lookup keys**. Sin estos, la integración no funcionará.

---

## 📝 Pasos para agregar lookup keys:

### **1. Ve a tus productos:**
https://dashboard.stripe.com/products

### **2. Para cada producto, haz lo siguiente:**

#### **Producto: Starter Plan ($29)**
1. Click en el producto "Starter Plan"
2. En la sección del precio ($29.00), busca **"Lookup keys"**
3. Click en **"Add lookup key"**
4. Escribe exactamente: `starter_plan`
5. Click en **"Add"** o **"Save"**

#### **Producto: Pro ($40)**
1. Click en el producto "Pro"
2. En la sección del precio ($40.00), busca **"Lookup keys"**
3. Click en **"Add lookup key"**
4. Escribe exactamente: `pro_plan`
5. Click en **"Add"** o **"Save"**

#### **Producto: Enterprise ($200)**
1. Click en el producto "Enterprise"
2. En la sección del precio ($200.00), busca **"Lookup keys"**
3. Click en **"Add lookup key"**
4. Escribe exactamente: `enterprise_plan`
5. Click en **"Add"** o **"Save"**

---

## ✅ Verificar:

Después de agregar los lookup keys, deberías ver algo como:

```
Starter Plan
  $29.00 USD / month
  Lookup keys: starter_plan
```

```
Pro
  $40.00 USD / month
  Lookup keys: pro_plan
```

```
Enterprise
  $200.00 USD / month
  Lookup keys: enterprise_plan
```

---

## 🎯 ¿Por qué son importantes los lookup keys?

Los lookup keys permiten que tu código encuentre los productos sin necesidad de usar IDs que cambian entre entornos. Son como un "nombre único" para cada precio.

---

## 🧪 Probar después de agregar los lookup keys:

1. Guarda todos los cambios en Stripe
2. Ve a: https://hawkmail.com
3. Click en cualquier plan de la sección pricing
4. Ahora debería funcionar correctamente

---

## 🐛 Si sigue sin funcionar:

Verifica que:
- ✅ Los lookup keys estén escritos exactamente como se indica (minúsculas, con guión bajo)
- ✅ Los lookup keys estén en los **precios**, no en los productos
- ✅ No haya espacios antes o después del lookup key
