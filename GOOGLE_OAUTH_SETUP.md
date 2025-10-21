# Configuración de OAuth de Google para HawkMail

## Paso 1: Crear un proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en el selector de proyectos en la parte superior y haz clic en "NUEVO PROYECTO"
4. Dale un nombre a tu proyecto (ej. "HawkMail") y haz clic en "CREAR"

## Paso 2: Habilitar las API necesarias

1. En el menú de navegación, ve a "API y servicios" > "Biblioteca"
2. Busca y habilita las siguientes API:
   - "Gmail API"
   - "Google+ API" (opcional, para obtener información del perfil)

## Paso 3: Configurar la pantalla de consentimiento de OAuth

1. En el menú de navegación, ve a "API y servicios" > "Pantalla de consentimiento de OAuth"
2. Selecciona "Externo" y haz clic en "CREAR"
3. Completa la información requerida:
   - **Nombre de la aplicación**: HawkMail
   - **Correo electrónico de soporte**: tu correo electrónico
   - **URL de inicio de página de inicio**: http://localhost:3000 (para desarrollo) o https://hawkmail.app (para producción)
4. Haz clic en "GUARDAR Y CONTINUAR"
5. En la sección "Alcances", haz clic en "AGREGAR O QUITAR ALCANCES" y agrega los siguientes alcances:
   - `.../auth/gmail.readonly`
   - `.../auth/gmail.send`
   - `.../auth/gmail.modify`
   - `.../auth/userinfo.email`
6. Haz clic en "ACTUALIZAR" y luego en "GUARDAR Y CONTINUAR"
7. En la sección "Usuarios de prueba", agrega tu correo electrónico como usuario de prueba (esto es necesario mientras la aplicación esté en modo de prueba)

## Paso 4: Crear las credenciales de OAuth

1. En el menú de navegación, ve a "API y servicios" > "Credenciales"
2. Haz clic en "+ CREAR CREDENCIALES" y selecciona "ID de cliente de OAuth"
3. Selecciona "Aplicación web" como tipo de aplicación
4. Completa la información requerida:
   - **Nombre**: HawkMail Web Client
   - **Orígenes de JavaScript autorizados**: 
     - http://localhost:3000 (para desarrollo)
     - https://hawkmail.app (para producción)
   - **URI de redireccionamiento autorizados**:
     - http://localhost:3000/api/oauth/gmail/callback (para desarrollo)
     - https://hawkmail.app/api/oauth/gmail/callback (para producción)
5. Haz clic en "CREAR"
6. Anota el **ID de cliente** y el **Cliente secreto** que se muestran

## Paso 5: Configurar las variables de entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=tu-id-de-cliente.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-cliente-secreto
```

Reemplaza `tu-id-de-cliente.apps.googleusercontent.com` y `tu-cliente-secreto` con los valores que obtuviste en el paso anterior.

## Paso 6: Reiniciar el servidor

Reinicia el servidor de desarrollo para que los cambios en las variables de entorno surtan efecto:

```bash
npm run dev
```

## Paso 7: Probar la conexión

1. Inicia sesión en la aplicación
2. Ve a "Settings" > "Email Providers"
3. Haz clic en "Connect Gmail"
4. Deberías ser redirigido a la página de consentimiento de Google
5. Autoriza la aplicación y deberías ser redirigido de vuelta a la aplicación

## Paso 8: Sincronizar correos

1. Una vez que hayas conectado tu cuenta de Gmail, verás el proveedor en la lista
2. Haz clic en "Sync Now" para sincronizar tus correos
3. Espera a que se complete la sincronización
4. Ve a "Dashboard" para ver tus correos

## Solución de problemas

### Error: "redirect_uri_mismatch"

Asegúrate de que el URI de redireccionamiento en las credenciales de OAuth coincida exactamente con el que estás usando en la aplicación.

### Error: "invalid_client"

Verifica que el ID de cliente y el cliente secreto sean correctos.

### Error: "access_denied"

Asegúrate de que tu correo electrónico esté en la lista de usuarios de prueba en la pantalla de consentimiento de OAuth.

### Error: "insufficient authentication scopes"

Asegúrate de que todos los alcances necesarios estén configurados correctamente en la pantalla de consentimiento de OAuth.

## Notas importantes

- Mientras la aplicación esté en modo de prueba, solo los usuarios de prueba podrán usarla
- Para publicar la aplicación, necesitarás verificarla con Google
- Las credenciales de OAuth deben mantenerse seguras y nunca deben ser expuestas en el código del cliente