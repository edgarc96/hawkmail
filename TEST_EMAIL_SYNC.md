# Guía para probar la sincronización y visualización de correos reales

## Prerrequisitos

Antes de comenzar, asegúrate de haber completado los siguientes pasos:

1. ✅ Configurar las credenciales de OAuth de Google (ver `GOOGLE_OAUTH_SETUP.md`)
2. ✅ Ejecutar el script de configuración: `npm run setup:google`
3. ✅ Reiniciar el servidor de desarrollo: `npm run dev`

## Paso 1: Iniciar sesión en la aplicación

1. Abre tu navegador y ve a `http://localhost:3000`
2. Inicia sesión con tu cuenta de usuario

## Paso 2: Conectar tu cuenta de Gmail

1. En el menú de navegación, haz clic en "Settings"
2. En la sección "Configuration", haz clic en "Email Providers"
3. Haz clic en el botón "Connect Gmail"
4. Serás redirigido a la página de consentimiento de Google
5. Inicia sesión con tu cuenta de Google y autoriza la aplicación
6. Deberías ser redirigido de vuelta a la aplicación con un mensaje de éxito

## Paso 3: Sincronizar tus correos

1. En la página de "Email Providers", deberías ver tu cuenta de Gmail conectada
2. Haz clic en el botón "Sync Now"
3. Espera a que se complete la sincronización (puede tardar unos minutos)
4. Deberías ver un mensaje indicando cuántos correos se han procesado

## Paso 4: Verificar los correos sincronizados

1. En el menú de navegación, haz clic en "Dashboard"
2. Deberías ver una lista de correos sincronizados
3. Si no ves correos, asegúrate de que:
   - La sincronización se haya completado correctamente
   - Tengas correos en tu bandeja de entrada de los últimos 7 días
   - No haya habido errores durante la sincronización

## Paso 5: Ver el contenido de un correo

1. Haz clic en "View Details" en cualquier correo de la lista
2. Deberías ver el contenido completo del correo
3. Verifica que el asunto, remitente, destinatario y contenido del correo se muestren correctamente

## Paso 6: Responder a un correo

1. En el diálogo de detalles del correo, haz clic en "Reply to Email"
2. Escribe una respuesta en el área de texto
3. Haz clic en "Send Reply"
4. Deberías ver un mensaje de éxito y la respuesta debería enviarse

## Paso 7: Marcar un correo como resuelto

1. En el diálogo de detalles del correo, haz clic en "Mark as Resolved"
2. El correo debería marcarse como resuelto y desaparecer de la lista de correos pendientes

## Paso 8: Verificar las métricas

1. En el menú de navegación, haz clic en "Analytics"
2. Deberías ver métricas basadas en los correos sincronizados
3. Verifica que las métricas se actualicen correctamente después de sincronizar correos

## Solución de problemas

### No puedo conectar mi cuenta de Gmail

1. Verifica que las credenciales de OAuth estén configuradas correctamente en `.env.local`
2. Asegúrate de que el URI de redireccionamiento en las credenciales de OAuth coincida con `http://localhost:3000/api/oauth/gmail/callback`
3. Verifica que tu correo electrónico esté en la lista de usuarios de prueba en la pantalla de consentimiento de OAuth

### La sincronización falla

1. Revisa las logs del servidor para ver si hay errores
2. Verifica que tengas permisos suficientes en tu cuenta de Gmail
3. Asegúrate de que la API de Gmail esté habilitada en tu proyecto de Google Cloud

### No veo correos después de sincronizar

1. Verifica que tengas correos en tu bandeja de entrada de los últimos 7 días
2. Revisa las logs del servidor para ver si hubo errores durante la sincronización
3. Verifica que los correos se hayan almacenado correctamente en la base de datos

### No puedo ver el contenido del correo

1. Asegúrate de que el campo `body_content` exista en la tabla `emails`
2. Verifica que el contenido del correo se haya extraído correctamente durante la sincronización
3. Revisa las logs del servidor para ver si hubo errores al extraer el contenido del correo

### No puedo responder a un correo

1. Verifica que tengas los permisos necesarios para enviar correos
2. Asegúrate de que el token de acceso sea válido y no haya expirado
3. Revisa las logs del servidor para ver si hubo errores al enviar la respuesta

## Notas importantes

- La sincronización solo obtiene correos de los últimos 7 días
- La sincronización se limita a 50 correos por vez para optimizar el rendimiento
- Los correos se procesan en lotes de 10 para acelerar la sincronización
- Las métricas se calculan automáticamente después de cada sincronización
- Los tokens de acceso se actualizan automáticamente cuando es necesario