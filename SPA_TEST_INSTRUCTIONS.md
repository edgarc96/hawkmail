# Instructions para probar la navegación SPA

## 🎯 Objetivo
Verificar que el dashboard funciona como una Single Page Application (SPA) sin recargas, mientras que `/settings` mantiene su layout propio.

## 🧪 Pasos para probar

### 1. Iniciar la aplicación
```bash
npm run dev
```
Abre http://localhost:3000/dashboard en tu navegador

### 2. Probar navegación SPA en el dashboard
Desde `/dashboard`, prueba los siguientes botones de navegación:

1. **Dashboard** (ícono de casa)
   - ✅ Debe cambiar el contenido sin recargar la página
   - ✅ La URL debe permanecer `/dashboard`

2. **Analytics** (ícono de gráficos)
   - ✅ Debe mostrar el contenido de analytics sin recargar
   - ✅ La URL debe permanecer `/dashboard`

3. **Alerts** (ícono de campana)
   - ✅ Debe mostrar el contenido de alerts sin recargar
   - ✅ La URL debe permanecer `/dashboard`

4. **Team** (ícono de usuarios)
   - ✅ Debe mostrar el contenido de team sin recargar
   - ✅ La URL debe permanecer `/dashboard`

### 3. Probar navegación a Settings
5. **Settings** (ícono de engranaje)
   - ✅ Debe redirigir a `/settings` (cambio de URL)
   - ✅ Debe mostrar el layout de settings diferente al dashboard
   - ✅ Debe mantener el diseño de 3 columnas con sidebar

### 4. Verificar sin recargas
Abre la consola del navegador (F12) y observa:
- No debe haber recargas de página al navegar entre dashboard, analytics, alerts, team
- Solo debe haber una recarga al hacer clic en settings

### 5. Probar navegación de regreso
Desde `/settings`, prueba navegar de vuelta:
- Usa el botón "Dashboard" en el sidebar
- Debe regresar a `/dashboard` con toda la funcionalidad SPA intacta

## ✅ Resultados esperados

| Navegación | Comportamiento | URL | Layout |
|------------|----------------|-----|--------|
| Dashboard → Analytics | SPA (sin recarga) | `/dashboard` | Dashboard |
| Dashboard → Alerts | SPA (sin recarga) | `/dashboard` | Dashboard |
| Dashboard → Team | SPA (sin recarga) | `/dashboard` | Dashboard |
| Dashboard → Settings | Redirección | `/settings` | Settings |
| Settings → Dashboard | Redirección | `/dashboard` | Dashboard |

## 🔍 Señales de que funciona correctamente

1. **Sin recargas**: El contenido cambia instantáneamente sin parpadeo de página
2. **URL consistente**: La URL se mantiene en `/dashboard` para todas las secciones SPA
3. **Settings separado**: `/settings` tiene su propio layout y URL
4. **Estado preservado**: Los datos y filtros se mantienen al cambiar entre secciones

## 🐛 Problemas comunes a verificar

- Si la página se recarga al cambiar entre secciones → No está funcionando como SPA
- Si settings usa el mismo layout que dashboard → No mantiene su layout propio
- Si los datos se pierden al cambiar de sección → Problema con el estado

## 📝 Notas
- La implementación usa `useState` para manejar la sección activa
- Settings usa `router.push()` para redirigir a una página separada
- Las otras secciones usan `setActiveSection()` para navegación interna