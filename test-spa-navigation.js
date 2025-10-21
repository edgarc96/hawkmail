// Script para probar la navegación SPA en el dashboard
// Este script se puede ejecutar en la consola del navegador

console.log('🧪 Testing SPA Navigation...');

// Función para simular clics en los botones de navegación
function testNavigation() {
  const navigationButtons = [
    { selector: 'button[title="Dashboard"]', section: 'dashboard' },
    { selector: 'button[title="Analytics"]', section: 'analytics' },
    { selector: 'button[title="Alerts"]', section: 'alerts' },
    { selector: 'button[title="Team"]', section: 'team' },
    { selector: 'button[title="Settings"]', section: 'settings' }
  ];

  navigationButtons.forEach(({ selector, section }) => {
    const button = document.querySelector(selector);
    if (button) {
      console.log(`✅ Found ${section} button`);
      
      // Simular clic
      button.click();
      
      // Verificar que el contenido cambió sin recargar la página
      setTimeout(() => {
        const header = document.querySelector('h1');
        if (header) {
          console.log(`📄 Current header: ${header.textContent}`);
        }
        
        // Verificar que la URL no cambió para las secciones SPA
        if (section !== 'settings') {
          if (window.location.pathname === '/dashboard') {
            console.log(`✅ ${section} navigation: SPA working (no page reload)`);
          } else {
            console.log(`❌ ${section} navigation: Page reloaded (URL changed to ${window.location.pathname})`);
          }
        } else {
          // Settings debe redirigir a /settings
          if (window.location.pathname === '/settings') {
            console.log(`✅ Settings navigation: Redirected to separate page (maintains layout)`);
          } else {
            console.log(`❌ Settings navigation: Failed to redirect`);
          }
        }
      }, 500);
    } else {
      console.log(`❌ ${section} button not found`);
    }
  });
}

// Función para verificar que no hay recargas de página
function checkForPageReloads() {
  let navigationCount = 0;
  
  // Monitorear eventos de navegación
  window.addEventListener('beforeunload', () => {
    navigationCount++;
    console.log(`🔄 Page reload detected! Count: ${navigationCount}`);
  });
  
  console.log('📊 Navigation monitoring started');
}

// Ejecutar pruebas
if (typeof window !== 'undefined') {
  console.log('🌐 Running in browser environment');
  checkForPageReloads();
  
  // Esperar a que la página cargue completamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testNavigation);
  } else {
    testNavigation();
  }
} else {
  console.log('❌ This script must be run in a browser environment');
}

// Instrucciones para usar este script:
// 1. Abre el dashboard en http://localhost:3000/dashboard
// 2. Abre la consola del navegador (F12)
// 3. Pega y ejecuta este script
// 4. Observa los resultados para verificar que la navegación SPA funciona correctamente