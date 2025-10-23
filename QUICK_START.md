# 🚀 Quick Start - Zendesk-Level Ticket System

## ⚡ Pasos Rápidos para Empezar

### 1. **Aplicar Migraciones de Base de Datos**

```bash
# Generar archivos de migración
npx drizzle-kit generate

# Revisar y aplicar cambios a la BD
npx drizzle-kit push

# ✅ Confirmar cuando pregunte si quieres aplicar los cambios
```

### 2. **Verificar Tablas Nuevas**

```bash
# Abrir Drizzle Studio para ver la BD
npx drizzle-kit studio

# Navega a: http://localhost:4983
# Verifica que existan estas tablas:
# - ticket_messages
# - ticket_attachments  
# - ticket_events
# - automation_rules
# - ticket_macros
```

### 3. **Sincronizar Emails de Gmail**

```bash
# Iniciar servidor
npm run dev

# En otro terminal, trigger sync:
curl -X POST http://localhost:3000/api/sync/gmail \
  -H "Content-Type: application/json" \
  -d '{"providerId": "TU_PROVIDER_ID"}'
```

### 4. **Navegar a un Ticket**

```
http://localhost:3000/tickets/1
```

Deberías ver:
- ✅ Layout de 3 paneles
- ✅ Thread de mensajes
- ✅ Perfil del cliente
- ✅ Timeline de actividad
- ✅ Editor de respuestas

---

## 🧪 Testing Rápido

### Probar API de Tickets

```bash
# 1. Obtener ticket
curl http://localhost:3000/api/tickets/1

# 2. Obtener mensajes
curl http://localhost:3000/api/tickets/1/messages

# 3. Enviar respuesta (TEST)
curl -X POST http://localhost:3000/api/tickets/1/reply \
  -H "Content-Type: application/json" \
  -d '{
    "content": "<p>Thanks for your message!</p>",
    "isInternal": false,
    "recipientEmail": "customer@example.com",
    "userId": "test-user",
    "userName": "Support Agent",
    "userEmail": "agent@hawkmail.com"
  }'

# 4. Obtener timeline
curl http://localhost:3000/api/tickets/1/timeline

# 5. Actualizar status
curl -X PATCH http://localhost:3000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "replied"}'
```

---

## 📝 Checklist Post-Implementación

### Debe Funcionar ✅
- [ ] Ver lista de tickets en `/tickets`
- [ ] Click en ticket abre vista detallada
- [ ] Ver thread de mensajes
- [ ] Ver perfil del cliente
- [ ] Cambiar status del ticket
- [ ] Cambiar priority del ticket
- [ ] Escribir respuesta (se guarda en BD)
- [ ] Paneles son resizables
- [ ] Paneles son collapsibles

### Pendiente de Implementar ⚠️
- [ ] Envío real de emails (SMTP)
- [ ] Download de attachments
- [ ] Timeline auto-poblado con eventos
- [ ] WebSocket para updates en tiempo real
- [ ] Macros funcionales
- [ ] Templates funcionales

---

## 🐛 Troubleshooting

### "Ticket not found"
```bash
# Verificar que tengas emails en la BD
npx drizzle-kit studio
# Navega a tabla "emails" y verifica que haya registros
```

### "Failed to fetch ticket"
```bash
# Verificar que el servidor esté corriendo
npm run dev

# Verificar logs en consola
# Debe mostrar: ✓ Ready in XXXms
```

### "Schema mismatch"
```bash
# Re-generar y aplicar migraciones
npx drizzle-kit generate
npx drizzle-kit push
```

### Componentes no se ven
```bash
# Limpiar cache de Next.js
rm -rf .next
npm run dev
```

---

## 🎯 Demo Flow Completo

1. **Sync Gmail**
   ```
   POST /api/sync/gmail
   ```

2. **Ver Tickets**
   ```
   Navigate to: http://localhost:3000/tickets
   ```

3. **Abrir Ticket**
   ```
   Click en cualquier ticket
   Should open: http://localhost:3000/tickets/[id]
   ```

4. **Ver Layout Zendesk-Style**
   - Panel izquierdo: Thread de email original
   - Panel centro: Perfil del cliente con stats
   - Panel derecho: Timeline (mock data por ahora)

5. **Cambiar Status**
   ```
   Use selector en header: New → Open → Replied
   ```

6. **Escribir Respuesta**
   ```
   - Escribe en editor inferior
   - Click "Send Reply"
   - Debería guardarse en ticket_messages
   ```

7. **Verificar en BD**
   ```bash
   npx drizzle-kit studio
   # Ver tabla ticket_messages
   # Debe aparecer tu respuesta
   ```

---

## 📚 Archivos Importantes

### Documentación
- `ZENDESK_ROADMAP.md` - Roadmap completo con todas las fases
- `IMPLEMENTATION_SUMMARY.md` - Resumen de lo implementado
- `QUICK_START.md` - Este archivo

### Core Components
- `/src/components/tickets/TicketWorkspace.tsx` - Layout principal
- `/src/components/tickets/MessageThread.tsx` - Thread de mensajes
- `/src/components/emails/EmailMessageRenderer.tsx` - Renderizado HTML seguro

### API Routes
- `/src/app/api/tickets/[id]/route.ts` - GET/PATCH ticket
- `/src/app/api/tickets/[id]/messages/route.ts` - GET messages
- `/src/app/api/tickets/[id]/reply/route.ts` - POST reply

### Schema
- `/src/db/schema.ts` - Nuevas tablas agregadas

---

## 🔥 Próximos Pasos Prioritarios

### Esta Semana
1. ✅ Aplicar migraciones (TÚ AHORA)
2. ⚠️ Implementar envío SMTP real
3. ⚠️ Attachment download API
4. ⚠️ Timeline service automático

### Próxima Semana
5. ⚠️ WebSocket para tiempo real
6. ⚠️ Macros CRUD
7. ⚠️ Storage S3 para attachments

---

## 💡 Tips

### Performance
- Usa `npm run dev -- --turbo` para dev más rápido
- Drizzle Studio es tu mejor amigo para debugging

### Development
```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Drizzle Studio
npx drizzle-kit studio

# Terminal 3: API testing
curl ...
```

### Debugging
- Check browser console para errores
- Check terminal server para logs de API
- Check Drizzle Studio para datos en BD

---

**¡Listo para probar!** 🚀

Ejecuta los comandos en orden y deberías tener un sistema Zendesk-level funcionando.
