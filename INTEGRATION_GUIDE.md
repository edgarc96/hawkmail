# Integration Guide - Quick Wins

## 🔧 Pasos para Integrar Todo

### 1. Agregar ThemeProvider al Layout

**Archivo:** `src/app/layout.tsx`

```typescript
import { ThemeProvider } from '@/lib/contexts/theme-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2. Agregar ThemeToggle al Dashboard

**Archivo:** `src/app/dashboard/page.tsx`

En la sección del header, agregar:

```typescript
import { ThemeToggle } from '@/components/ui/theme-toggle';

// En el header del dashboard:
<div className="flex items-center gap-4">
  <ThemeToggle />
  <button onClick={handleSignOut}>Sign Out</button>
</div>
```

### 3. Usar EmailClassificationBadge en EmailList

**Archivo:** `src/features/emails/components/EmailList.tsx`

```typescript
import { EmailClassificationBadge } from './EmailClassificationBadge';

// Reemplazar los badges actuales con:
<EmailClassificationBadge
  priority={email.priority}
  category={email.category} // Si lo tienes en el schema
  sentiment={email.sentiment} // Si lo tienes en el schema
/>
```

### 4. Usar EnhancedMetricsCard en Dashboard

**Archivo:** `src/app/dashboard/page.tsx`

```typescript
import { EnhancedMetricsCard } from '@/features/analytics/components/EnhancedMetricsCard';
import { Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Reemplazar las cards actuales:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <EnhancedMetricsCard
    title="Total Emails"
    value={dashboardData.totalEmails}
    icon={Mail}
    gradient="from-purple-500 to-pink-500"
    delay={0}
  />
  <EnhancedMetricsCard
    title="Pending"
    value={dashboardData.pendingEmails}
    icon={Clock}
    gradient="from-yellow-500 to-amber-500"
    delay={0.1}
  />
  <EnhancedMetricsCard
    title="Replied"
    value={dashboardData.repliedEmails}
    icon={CheckCircle}
    gradient="from-green-500 to-emerald-500"
    trend={{ value: 12, isPositive: true }}
    delay={0.2}
  />
  <EnhancedMetricsCard
    title="Overdue"
    value={dashboardData.overdueEmails}
    icon={AlertCircle}
    gradient="from-red-500 to-orange-500"
    delay={0.3}
  />
</div>
```

### 5. (Opcional) Actualizar Database Schema

Si quieres guardar la clasificación en la BD:

**Archivo:** `src/db/schema.ts`

```typescript
export const emails = sqliteTable('emails', {
  // ... existing fields ...
  category: text('category').default('other'), // sales, support, billing, etc.
  sentiment: text('sentiment').default('neutral'), // urgent, positive, neutral, negative
  classificationConfidence: integer('classification_confidence'), // 0-100
  suggestedTags: text('suggested_tags'), // JSON array of tags
});
```

Luego crear migración:
```bash
npm run db:generate
npm run db:push
```

### 6. Actualizar Webhook para Guardar Clasificación

**Archivo:** `src/app/api/webhooks/gmail/route.ts`

Si agregaste los campos al schema:

```typescript
const classification = EmailClassifier.classify(subject, bodyText);

const inserted = await db.insert(emails).values({
  // ... existing fields ...
  priority: classification.priority,
  category: classification.category,
  sentiment: classification.sentiment,
  classificationConfidence: classification.confidence,
  suggestedTags: JSON.stringify(classification.suggestedTags),
}).returning();
```

---

## 📋 Checklist de Integración

### Must Have (Crítico)
- [ ] ✅ Agregar ThemeProvider al layout
- [ ] ✅ Agregar ThemeToggle al dashboard header
- [ ] ✅ Verificar que EmailClassifier funciona correctamente
- [ ] ✅ Probar clasificación con emails de prueba

### Nice to Have (Opcional)
- [ ] Actualizar schema de BD con campos de clasificación
- [ ] Integrar EmailClassificationBadge en EmailList
- [ ] Reemplazar MetricsCards con EnhancedMetricsCard
- [ ] Agregar animaciones a más componentes

---

## 🧪 Testing

### 1. Probar Email Classifier

```typescript
// En un archivo de test o consola
import { EmailClassifier } from '@/lib/services/email-classifier';

// Test casos de alta prioridad
const test1 = EmailClassifier.classify(
  "URGENT: System Down",
  "We have a critical issue that needs immediate attention"
);
console.log('Test 1:', test1);
// Expected: { priority: 'high', category: 'support', sentiment: 'urgent' }

// Test casos de billing
const test2 = EmailClassifier.classify(
  "Question about invoice",
  "I have a question regarding my last payment"
);
console.log('Test 2:', test2);
// Expected: { priority: 'medium', category: 'billing', sentiment: 'neutral' }

// Test casos de sales
const test3 = EmailClassifier.classify(
  "Pricing inquiry",
  "Can you send me a quote for your enterprise plan?"
);
console.log('Test 3:', test3);
// Expected: { priority: 'medium', category: 'sales', sentiment: 'neutral' }
```

### 2. Probar Theme Toggle

1. Abrir dashboard
2. Click en el botón de tema
3. Verificar transición suave
4. Refrescar página
5. Verificar que el tema persiste

### 3. Probar Animaciones

1. Observar cards en dashboard
2. Verificar fade-in en carga
3. Hacer hover sobre cards
4. Verificar shimmer effect

---

## 🎨 Customización

### Cambiar Colores de Gradientes

```typescript
// En EnhancedMetricsCard
<EnhancedMetricsCard
  gradient="from-blue-500 to-cyan-500" // Personalizado
/>
```

### Agregar Más Keywords al Classifier

```typescript
// En email-classifier.ts
const PRIORITY_KEYWORDS = {
  high: [
    ...existing,
    'outage', 'down', 'broken', 'error 500' // Agregar más
  ]
};
```

### Cambiar Velocidad de Animaciones

```css
/* En globals.css */
.animate-shimmer {
  animation: shimmer 1s infinite; /* Cambiar de 2s a 1s */
}
```

---

## ⚠️ Troubleshooting

### Problema: Theme no persiste
**Solución:** Verificar que ThemeProvider está en layout.tsx y que localStorage está disponible

### Problema: Animaciones no funcionan
**Solución:** 
1. Verificar que framer-motion está instalado: `npm list framer-motion`
2. Verificar que el componente tiene "use client"

### Problema: Clasificador siempre retorna 'medium'
**Solución:** 
1. Verificar que el texto no está vacío
2. Agregar más keywords específicos
3. Revisar logs para ver qué scores se calculan

### Problema: CSS animations no se ven
**Solución:**
1. Verificar que globals.css está importado en layout
2. Hard refresh (Cmd+Shift+R o Ctrl+Shift+R)
3. Verificar que Tailwind está procesando el CSS

---

## 📊 Monitoreo

### Métricas a Observar

1. **Precisión de Clasificación**
   - Revisar alertas generadas
   - Comparar con clasificación manual
   - Ajustar keywords según resultados

2. **Uso del Theme Toggle**
   - Analytics de localStorage
   - Preferencia dark vs light

3. **Performance**
   - Tiempo de carga de dashboard
   - FPS durante animaciones
   - Bundle size con framer-motion

---

## 🚀 Deployment

### Antes de Deploy

- [ ] Correr `npm run build` localmente
- [ ] Verificar que no hay errores TypeScript
- [ ] Probar en modo producción: `npm run start`
- [ ] Revisar bundle size: `npm run build -- --analyze`
- [ ] Probar en diferentes navegadores

### Después de Deploy

- [ ] Verificar que theme persiste en producción
- [ ] Probar clasificación con emails reales
- [ ] Monitorear logs de errores
- [ ] Revisar performance en production

---

## 📝 Notas Finales

- **Framer Motion** añade ~32KB al bundle (gzipped)
- **ThemeProvider** no afecta performance
- **EmailClassifier** es síncrono y muy rápido (<1ms)
- Todas las animaciones usan GPU acceleration

**Estado:** ✅ LISTO PARA INTEGRAR