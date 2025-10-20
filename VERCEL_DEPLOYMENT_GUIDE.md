# Guía de Despliegue de Hawkmail.app en Vercel

## Pasos para el Despliegue

### 1. Preparación del Proyecto
- [x] Verificar instalación de Vercel CLI
- [x] Crear archivo vercel.json con configuración específica
- [x] Preparar variables de entorno para producción

### 2. Configuración de Variables de Entorno
Las siguientes variables deben configurarse en el dashboard de Vercel:

#### Base de Datos
- `TURSO_CONNECTION_URL`: URL de la base de datos Turso
- `TURSO_AUTH_TOKEN`: Token de autenticación de Turso

#### Autenticación
- `BETTER_AUTH_SECRET`: Clave secreta para Better Auth
- `BETTER_AUTH_URL`: https://hawkmail.app
- `NEXT_PUBLIC_APP_URL`: https://hawkmail.app
- `NEXT_PUBLIC_SITE_URL`: https://hawkmail.app

#### Google OAuth
- `GOOGLE_CLIENT_ID`: Client ID de Google OAuth
- `GOOGLE_CLIENT_SECRET`: Client Secret de Google OAuth

#### Stripe
- `STRIPE_SECRET_KEY`: Clave secreta de Stripe (producción)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Clave pública de Stripe (producción)
- `STRIPE_WEBHOOK_SECRET`: Secreto de webhook de Stripe

### 3. Despliegue
```bash
# Iniciar sesión en Vercel
vercel login

# Desplegar proyecto
vercel --prod

# Configurar dominio personalizado
vercel domains add hawkmail.app
```

### 4. Configuración del Dominio
1. Agregar dominio hawkmail.app en el dashboard de Vercel
2. Configurar registros DNS:
   - Tipo A: 76.76.19.19
   - Tipo A: 76.76.21.21
   - Tipo CNAME: cname.vercel-dns.com

### 5. Verificación
- [ ] Verificar que el sitio carga correctamente
- [ ] Probar funcionalidad de autenticación
- [ ] Verificar integración con Stripe
- [ ] Probar conexión a base de datos

## Comandos Útiles

```bash
# Ver logs de despliegue
vercel logs

# Re-desplegar con cambios
vercel --prod

# Verificar configuración del dominio
vercel domains ls
```

## Troubleshooting

### Problemas Comunes
1. **Error de construcción**: Verificar que todas las dependencias estén instaladas
2. **Variables de entorno**: Asegurarse que todas las variables requeridas estén configuradas
3. **Dominio**: Verificar configuración DNS puede tomar hasta 24 horas

### Soporte
- Documentación de Vercel: https://vercel.com/docs
- Soporte de Vercel: https://vercel.com/support