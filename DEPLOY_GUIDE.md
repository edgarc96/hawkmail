# Guía de Deploy para HawkMail

## Pasos para hacer deploy de los cambios recientes

### 1. Preparar el repositorio

Asegúrate de que todos los cambios estén commit en tu repositorio de Git:

```bash
git add .
git commit -m "feat: Add email content viewing and reply functionality"
git push origin main
```

### 2. Deploy en Vercel

Opción A: Desde la línea de comandos (si tienes Vercel CLI instalado)

```bash
npx vercel --prod
```

Opción B: Desde el dashboard de Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta
3. Selecciona el proyecto de HawkMail
4. Haz clic en "Deploy" o "Redeploy"

### 3. Verificar la migración de la base de datos

Como hemos agregado un nuevo campo a la tabla `emails`, es posible que necesites ejecutar la migración en la base de datos de producción:

1. Ve al dashboard de Turso (o tu proveedor de base de datos)
2. Ejecuta la siguiente consulta SQL:

```sql
ALTER TABLE emails ADD COLUMN body_content text;
```

### 4. Configurar variables de entorno

Asegúrate de que todas las variables de entorno necesarias estén configuradas en Vercel:

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

### 5. Verificar la funcionalidad

Una vez que el deploy esté completo, verifica las siguientes funcionalidades:

1. Ve a `https://hawkmail.app/dashboard`
2. Haz clic en "View Details" en cualquier correo
3. Verifica que el contenido del correo se muestre correctamente
4. Haz clic en "Reply to Email"
5. Escribe una respuesta y envíala
6. Verifica que la respuesta se envíe correctamente

## Solución de problemas

### Si el contenido del correo no se muestra

1. Verifica que la migración de la base de datos se haya ejecutado correctamente
2. Revisa las logs de Vercel para ver si hay algún error en la API
3. Verifica que el campo `body_content` exista en la tabla `emails`

### Si la respuesta no se envía

1. Verifica que las credenciales de Gmail/Outlook estén configuradas correctamente
2. Revisa las logs de Vercel para ver si hay algún error en la API de respuesta
3. Asegúrate de que el usuario tenga permisos para enviar correos

## Notas importantes

- Los cambios locales no se reflejarán en línea hasta que hagas un deploy
- Es importante hacer un backup de la base de datos antes de ejecutar cualquier migración
- Si encuentras algún problema, puedes revertir los cambios haciendo un deploy de la versión anterior