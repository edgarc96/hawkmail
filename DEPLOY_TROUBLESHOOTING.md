# Guía de solución de problemas para el deploy en Vercel

## Error actual

```
Error: invalid json response body at https://api.vercel.com/v13/deployments/dpl_C5wBmMTYPrRMDGm24KKXSWHqgkKC?teamId=team_k5VCONtzyY4l42XXfHZBbugL reason: Unexpected token '<', "<html>
<h"... is not valid JSON
```

Este error indica que la API de Vercel está devolviendo una respuesta HTML en lugar de JSON, lo que sugiere que hay un problema durante el proceso de compilación o deploy.

## Soluciones

### Opción 1: Usar el dashboard de Vercel

La forma más fácil de hacer deploy es usando el dashboard de Vercel:

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta
3. Selecciona el proyecto de HawkMail
4. Haz clic en "Deploy" o "Redeploy"
5. Espera a que se complete el proceso

### Opción 2: Usar Git

Si tienes tu código en un repositorio de Git (GitHub, GitLab, Bitbucket):

1. Asegúrate de que todos los cambios estén commit:
   ```bash
   git add .
   git commit -m "feat: Add email content viewing and reply functionality"
   git push origin main
   ```

2. Vercel detectará automáticamente los cambios y hará un deploy

### Opción 3: Usar Vercel CLI con opciones adicionales

Si prefieres usar la línea de comandos, prueba con estas opciones adicionales:

```bash
npx vercel --prod --debug
```

El flag `--debug` te dará más información sobre lo que está sucediendo durante el deploy.

### Opción 4: Verificar el build localmente

Antes de hacer deploy, verifica que la aplicación se compile correctamente localmente:

```bash
npm run build
```

Si hay errores durante el build, revísalos y corrígelos antes de intentar hacer deploy.

### Opción 5: Revisar las logs de Vercel

1. Ve al dashboard de Vercel
2. Selecciona tu proyecto
3. Haz clic en la pestaña "Logs"
4. Busca errores o advertencias durante el proceso de deploy

## Problemas comunes y soluciones

### Error: "Module not found"

Este error ocurre cuando hay dependencias faltantes. Solución:

```bash
npm install
npm run build
```

### Error: "TypeScript compilation failed"

Este error ocurre cuando hay errores de TypeScript. Solución:

```bash
npm run lint
```

Corrige los errores de TypeScript antes de hacer deploy.

### Error: "Build failed"

Este error puede ocurrir por varias razones. Solución:

1. Revisa las logs de Vercel para identificar el problema específico
2. Asegúrate de que todas las variables de entorno necesarias estén configuradas
3. Verifica que no haya errores en el código

## Variables de entorno necesarias

Asegúrate de que las siguientes variables de entorno estén configuradas en Vercel:

- `TURSO_CONNECTION_URL`
- `TURSO_AUTH_TOKEN`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Migración de la base de datos

Después de hacer deploy, no olvides ejecutar la migración de la base de datos en producción:

```sql
ALTER TABLE emails ADD COLUMN body_content text;
```

## Verificación del deploy

Una vez que el deploy se haya completado, verifica que la aplicación funcione correctamente:

1. Ve a `https://hawkmail.app`
2. Inicia sesión
3. Intenta conectar tu cuenta de Gmail
4. Sincroniza tus correos
5. Verifica que puedas ver y responder correos

## Deploy manual

Si todas las opciones anteriores fallan, puedes hacer un deploy manual:

1. Compila la aplicación localmente:
   ```bash
   npm run build
   ```

2. Sube el directorio `.next` a un servicio de hosting como Netlify o AWS S3

3. Configura las variables de entorno necesarias

## Contacto con soporte

Si sigues teniendo problemas, puedes contactar con el soporte de Vercel:

- [Vercel Support](https://vercel.com/support)
- [Vercel Status](https://www.vercel-status.com/)