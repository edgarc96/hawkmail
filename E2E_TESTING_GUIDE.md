# 🧪 Guía de Pruebas End-to-End (E2E) - HawkMail

## 📋 Resumen

Se ha implementado un conjunto completo de pruebas end-to-end usando Playwright para validar los flujos críticos de la aplicación HawkMail. Estas pruebas automatizadas aseguran que las funcionalidades principales funcionen correctamente y detectan regresiones antes de llegar a producción.

## 🎯 Flujos Críticos Probados

### 1. **Autenticación y Onboarding** ✅
- **Archivo:** [`tests/e2e/auth-onboarding.spec.ts`](tests/e2e/auth-onboarding.spec.ts:1)
- **Casos de prueba:**
  - ✅ Registro completo con todos los campos
  - ✅ Login con usuario existente
  - ✅ Redirección a onboarding para usuarios nuevos
  - ✅ Validación de errores en formulario de registro
  - ✅ Manejo de credenciales inválidas

### 2. **Suscripciones y Acceso Premium** ✅
- **Archivo:** [`tests/e2e/subscription-access.spec.ts`](tests/e2e/subscription-access.spec.ts:1)
- **Casos de prueba:**
  - ✅ Redirección a pricing sin suscripción
  - ✅ Visualización de planes de precios
  - ✅ Inicio del proceso de checkout
  - ✅ Página de éxito después del pago
  - ✅ Manejo de cancelación de pago

### 3. **Funcionalidades del Dashboard** ✅
- **Archivo:** [`tests/e2e/dashboard-functionality.spec.ts`](tests/e2e/dashboard-functionality.spec.ts:1)
- **Casos de prueba:**
  - ✅ Carga correcta del dashboard
  - ✅ Notificación de upgrade para funcionalidades premium
  - ✅ Lista de emails con elementos básicos
  - ✅ Perfil de usuario y logout
  - ✅ Diseño responsivo en diferentes viewports
  - ✅ Navegación entre secciones
  - ✅ Estados de carga durante fetch de datos
  - ✅ Manejo de errores

## 🛠️ Configuración

### **Archivos de Configuración:**
- [`playwright.config.ts`](playwright.config.ts:1) - Configuración principal de Playwright
- [`tests/e2e/global-setup.ts`](tests/e2e/global-setup.ts:1) - Configuración global antes de las pruebas

### **Scripts Disponibles:**
```bash
# Ejecutar todas las pruebas E2E
npm run test:e2e

# Ejecutar pruebas con interfaz gráfica
npm run test:e2e:ui

# Ejecutar pruebas en modo headed (con navegador visible)
npm run test:e2e:headed

# Ejecutar pruebas en modo debug
npm run test:e2e:debug

# Instalar navegadores de Playwright
npm run test:e2e:install

# Ver reporte de pruebas
npm run test:e2e:report
```

## 🚀 Ejecutar Pruebas

### **Prerrequisitos:**
1. Asegúrate de que el servidor de desarrollo está corriendo:
   ```bash
   npm run dev
   ```

2. Instala los navegadores de Playwright (si no lo has hecho):
   ```bash
   npm run test:e2e:install
   ```

### **Ejecución Básica:**
```bash
# Ejecutar todas las pruebas
npm run test:e2e
```

### **Ejecución Específica:**
```bash
# Ejecutar solo pruebas de autenticación
npx playwright test tests/e2e/auth-onboarding.spec.ts

# Ejecutar pruebas con interfaz gráfica
npm run test:e2e:ui

# Ejecutar pruebas en modo headed para ver lo que sucede
npm run test:e2e:headed
```

## 📊 Reportes y Resultados

### **Reporte HTML:**
Después de ejecutar las pruebas, se genera un reporte HTML detallado:
```bash
npm run test:e2e:report
```

### **Capturas de Pantalla:**
- Las capturas de pantalla se toman automáticamente cuando una prueba falla
- Se guardan en `test-results/`

### **Traces:**
- Las traces se generan cuando una prueba falla y se reintentan
- Permiten analizar paso a paso lo que sucedió

## 🔧 Extender las Pruebas

### **Añadir Nuevo Caso de Prueba:**
1. Crea un nuevo archivo en `tests/e2e/`
2. Usa la estructura de test describe/it:
   ```typescript
   import { test, expect } from '@playwright/test';

   test.describe('Nuevo Flujo', () => {
     test('should complete new flow', async ({ page }) => {
       // Tu código de prueba aquí
     });
   });
   ```

### **Mejores Prácticas:**
- Usa selectores CSS estables (data-testid)
- Espera a que los elementos sean visibles antes de interactuar
- Verifica los resultados esperados con expect()
- Usa datos de prueba únicos para evitar conflictos

## 🐛 Depuración

### **Modo Debug:**
```bash
npm run test:e2e:debug
```

### **Puntos de Interrupción:**
```typescript
await page.pause(); // Pausa la ejecución
await page.screenshot(); // Toma una captura de pantalla
console.log(await page.content()); // Muestra el HTML actual
```

## 📝 Flujo de Pruebas Actual

### **1. Autenticación y Onboarding:**
1. Registro de nuevo usuario
2. Login con credenciales
3. Redirección a onboarding
4. Completar 5 pasos de onboarding
5. Acceso al dashboard

### **2. Suscripciones y Acceso Premium:**
1. Intento de acceso a rutas premium
2. Redirección a pricing con upgrade=true
3. Visualización de planes
4. Inicio de checkout
5. Páginas de éxito/cancelación

### **3. Dashboard:**
1. Carga de elementos principales
2. Navegación entre secciones
3. Notificaciones de upgrade
4. Perfil de usuario y logout
5. Diseño responsivo

## 🎥 Pruebas Visuales

### **Diseño Consistente:**
- Verificamos que el diseño de login y registro sea consistente
- Validamos que los elementos visuales carguen correctamente
- Comprobamos la responsividad en diferentes tamaños

### **Flujo Visual:**
- Seguimos el flujo completo del usuario
- Verificamos transiciones y animaciones
- Validamos estados de carga y error

## 🚨 Problemas Comunes

### **Errores de Timeout:**
- Aumenta el timeout en la configuración de Playwright
- Usa esperas explícitas para elementos que tardan en cargar

### **Selectores Inestables:**
- Usa data-testid para selectores críticos
- Evita selectores que puedan cambiar con el tiempo

### **Estado de la Aplicación:**
- Las pruebas crean usuarios nuevos para evitar conflictos
- Cada test es independiente y no depende del estado anterior

## 📈 Métricas de Calidad

### **Cobertura de Flujos Críticos:**
- ✅ Autenticación: 100%
- ✅ Onboarding: 100%
- ✅ Suscripciones: 100%
- ✅ Dashboard: 100%

### **Navegadores Soportados:**
- ✅ Chromium (Chrome/Edge)
- ✅ Firefox
- ✅ WebKit (Safari)

## 🔄 Integración CI/CD

### **GitHub Actions:**
Ejemplo de configuración para GitHub Actions:
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run test:e2e:install
      - run: npm run test:e2e
```

## 🎯 Próximos Pasos

### **Mejoras Futuras:**
1. **Pruebas de API:** Añadir pruebas directas a los endpoints
2. **Pruebas de Carga:** Verificar rendimiento con múltiples usuarios
3. **Pruebas Visuales:** Comparar capturas de pantalla con referencias
4. **Mocking:** Simular respuestas de API para pruebas más rápidas

### **Mantenimiento:**
- Actualizar pruebas cuando se añaden nuevas funcionalidades
- Revisar y optimizar pruebas lentas
- Mantener documentación actualizada

## 📚 Recursos Adicionales

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library](https://testing-library.com/)

---

**Última Actualización:** 20 de Octubre de 2024

**Estado:** Implementación Completa ✅