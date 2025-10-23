# 🎯 Roadmap: Zendesk-Level Email Ticket System

## 📊 Estado Actual

### ✅ Componentes Frontend Implementados
- [x] `EmailMessageRenderer.tsx` - Renderizado seguro de HTML con DOMPurify
- [x] `TicketWorkspace.tsx` - Layout de 3 paneles resizable
- [x] `MessageThread.tsx` - Thread de mensajes con collapse/expand
- [x] `TicketHeader.tsx` - Barra global con acciones
- [x] `UserProfilePanel.tsx` - Perfil del cliente con stats
- [x] `InteractionTimeline.tsx` - Timeline de actividad
- [x] `TicketReplyEditor.tsx` - Editor de respuestas con attachments

### ⚠️ Gaps Críticos Identificados

#### 1. Schema de Base de Datos
Falta crear tablas para:
- `ticket_messages` - Mensajes con threading (parentId, messageId, references)
- `ticket_attachments` - Adjuntos con soporte inline (cid)
- `ticket_events` - Timeline de eventos automáticos
- Migración de `emails` → estructura ticket

#### 2. API Routes Faltantes
- `GET /api/tickets/[id]` - Obtener ticket completo
- `GET /api/tickets/[id]/messages` - Mensajes con threading
- `POST /api/tickets/[id]/reply` - Enviar respuesta + guardar
- `GET /api/tickets/[id]/timeline` - Eventos del ticket
- `GET /api/customers/[id]` - Perfil del cliente
- `GET /api/customers/[id]/timeline` - Historial completo
- `GET /api/attachments/[id]` - Descargar adjunto
- `POST /api/attachments` - Upload de adjuntos

#### 3. Email Processing
- Mejorar Gmail sync para capturar threading headers (Message-ID, In-Reply-To, References)
- Parsear attachments de Gmail API
- Detectar threads existentes
- Manejar inline images (cid: protocol)

#### 4. Envío de Emails
- Integración SMTP para enviar respuestas
- Aplicar templates/macros
- Guardar copia en ticket_messages
- Registrar evento en timeline

---

## 🚀 Roadmap Priorizado

### **FASE 1: Core Funcional** (1-2 semanas) ⚡ CRÍTICO

#### 1.1 Schema de Base de Datos
```sql
-- Crear tabla ticket_messages
CREATE TABLE ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id TEXT NOT NULL,
  thread_id TEXT NOT NULL,
  parent_id TEXT,  -- Para threading
  is_internal BOOLEAN DEFAULT FALSE,
  sender_id TEXT,
  sender_name TEXT,
  sender_email TEXT,
  recipient_email TEXT,
  subject TEXT,
  html_content TEXT,
  text_content TEXT,
  raw_headers TEXT,  -- JSON
  message_id TEXT,   -- Email Message-ID header
  in_reply_to TEXT,  -- Email In-Reply-To header
  references TEXT,   -- Email References header
  timestamp TIMESTAMP NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla ticket_attachments
CREATE TABLE ticket_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER REFERENCES ticket_messages(id) ON DELETE CASCADE,
  ticket_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_url TEXT NOT NULL,  -- S3 o local path
  storage_provider TEXT DEFAULT 'local',  -- 'local', 's3', 'gmail'
  external_id TEXT,  -- Gmail attachment ID
  is_inline BOOLEAN DEFAULT FALSE,
  content_id TEXT,  -- Para inline images (cid:)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla ticket_events
CREATE TABLE ticket_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id TEXT NOT NULL,
  event_type TEXT NOT NULL,  -- 'created', 'status_changed', 'assigned', 'replied', 'note_added', etc.
  title TEXT NOT NULL,
  description TEXT,
  metadata TEXT,  -- JSON con detalles específicos
  created_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_thread_id ON ticket_messages(thread_id);
CREATE INDEX idx_ticket_messages_message_id ON ticket_messages(message_id);
CREATE INDEX idx_ticket_attachments_message_id ON ticket_attachments(message_id);
CREATE INDEX idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);
CREATE INDEX idx_ticket_events_ticket_id ON ticket_events(ticket_id);
```

#### 1.2 Mejorar Gmail Sync con Threading
Ubicación: `/src/app/api/sync/gmail/route.ts`

**Cambios necesarios:**
```typescript
// Línea 164-168, capturar headers de threading:
const messageId = headers.find(h => h.name === "Message-ID")?.value || "";
const inReplyTo = headers.find(h => h.name === "In-Reply-To")?.value || "";
const references = headers.find(h => h.name === "References")?.value || "";

// Detectar thread existente:
// 1. Por In-Reply-To header
// 2. Por References header
// 3. Por subject similarity

// Parsear attachments:
function extractAttachments(payload: any): Attachment[] {
  const attachments: Attachment[] = [];
  
  function walk(part: any) {
    if (part.filename && part.body?.attachmentId) {
      const contentDisposition = part.headers?.find(
        h => h.name?.toLowerCase() === 'content-disposition'
      )?.value || '';
      
      const contentId = part.headers?.find(
        h => h.name?.toLowerCase() === 'content-id'
      )?.value || '';
      
      attachments.push({
        attachmentId: part.body.attachmentId,
        filename: part.filename,
        mimeType: part.mimeType,
        sizeBytes: part.body.size,
        isInline: contentDisposition.includes('inline'),
        contentId: contentId.replace(/[<>]/g, ''), // Remove < >
      });
    }
    if (part.parts) part.parts.forEach(walk);
  }
  
  walk(payload);
  return attachments;
}
```

#### 1.3 Crear API Routes Core

**A. GET /api/tickets/[id]/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { emails } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ticketId = params.id;
  
  const ticket = await db
    .select()
    .from(emails)
    .where(eq(emails.id, parseInt(ticketId)))
    .limit(1);
    
  if (!ticket.length) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }
  
  return NextResponse.json(ticket[0]);
}
```

**B. GET /api/tickets/[id]/messages/route.ts**
```typescript
// Retorna mensajes del thread con threading
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ticketId = params.id;
  
  // TODO: Query ticket_messages table
  // Construir árbol de mensajes usando parentId
  
  return NextResponse.json({ messages: [] });
}
```

**C. POST /api/tickets/[id]/reply/route.ts**
```typescript
// Enviar respuesta y guardar en DB
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { content, attachments, isInternal } = await req.json();
  
  // 1. Si no es interno, enviar email via Gmail/SMTP
  // 2. Guardar en ticket_messages
  // 3. Crear evento en ticket_events
  // 4. Actualizar ticket (lastReplyAt, status si es primera respuesta)
  
  return NextResponse.json({ success: true });
}
```

#### 1.4 Crear Página de Detalle de Ticket
Ubicación: `/src/app/(dashboard)/tickets/[id]/page.tsx`

```typescript
import { TicketWorkspace } from '@/components/tickets/TicketWorkspace';

export default async function TicketDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Fetch data
  const ticketRes = await fetch(`/api/tickets/${params.id}`);
  const ticket = await ticketRes.json();
  
  const messagesRes = await fetch(`/api/tickets/${params.id}/messages`);
  const { messages } = await messagesRes.json();
  
  const customerRes = await fetch(`/api/customers/${ticket.customerId}`);
  const customer = await customerRes.json();
  
  async function handleReply(content: string, attachments?: File[]) {
    'use server';
    // Send to API
  }
  
  return (
    <TicketWorkspace
      ticket={ticket}
      messages={messages}
      customer={customer}
      onReply={handleReply}
      onStatusChange={async (statusId) => {
        'use server';
        // Update status
      }}
      onPriorityChange={async (priorityId) => {
        'use server';
        // Update priority
      }}
      onAssigneeChange={async (assigneeId) => {
        'use server';
        // Update assignee
      }}
    />
  );
}
```

---

### **FASE 2: Enriquecimiento** (2-3 semanas)

#### 2.1 Sistema de Adjuntos Completo
- [ ] Upload handler con validación
- [ ] Storage en S3 o local filesystem
- [ ] API para download de adjuntos
- [ ] Preview de imágenes inline
- [ ] Thumbnails para PDFs/documentos

#### 2.2 Timeline Service
- [ ] Event dispatcher automático
- [ ] Eventos: ticket_created, status_changed, assigned, replied, note_added, etc.
- [ ] UI de timeline mejorada con filtros

#### 2.3 Macros y Templates
```sql
-- Ya existe reply_templates, agregar:
CREATE TABLE ticket_macros (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  shortcut TEXT,  -- e.g., "/greeting"
  content TEXT NOT NULL,
  actions TEXT,  -- JSON: [{type: 'status', value: 'solved'}]
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- [ ] UI para crear/editar macros
- [ ] Shortcut engine (/ commands)
- [ ] Variables dinámicas: {{customer.name}}, {{agent.name}}, etc.

#### 2.4 CRM Integration
- [ ] Sync customer data con HubSpot/Salesforce
- [ ] Enrichment automático (company info, social profiles)
- [ ] Custom fields dinámicos

---

### **FASE 3: Tiempo Real** (1 semana)

#### 3.1 WebSocket Infrastructure
```typescript
// /lib/websocket-server.ts
import { Server } from 'socket.io';

export function initializeWebSocket(server: any) {
  const io = new Server(server);
  
  io.on('connection', (socket) => {
    // Join ticket room
    socket.on('join:ticket', (ticketId) => {
      socket.join(`ticket:${ticketId}`);
    });
    
    // Typing indicators
    socket.on('typing:start', ({ ticketId, agentName }) => {
      socket.to(`ticket:${ticketId}`).emit('agent:typing', { agentName });
    });
    
    // New message notification
    socket.on('message:new', ({ ticketId, message }) => {
      socket.to(`ticket:${ticketId}`).emit('message:received', message);
    });
  });
  
  return io;
}
```

#### 3.2 Cliente WebSocket
```typescript
// /hooks/useTicketSocket.ts
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function useTicketSocket(ticketId: string) {
  useEffect(() => {
    const socket = io();
    
    socket.emit('join:ticket', ticketId);
    
    socket.on('message:received', (message) => {
      // Update UI
    });
    
    socket.on('agent:typing', ({ agentName }) => {
      // Show typing indicator
    });
    
    return () => socket.disconnect();
  }, [ticketId]);
}
```

#### 3.3 Features Tiempo Real
- [ ] Notificaciones de nuevos mensajes
- [ ] Presence indicators (quién está viendo el ticket)
- [ ] Typing indicators
- [ ] Auto-refresh de timeline

---

### **FASE 4: Automatización** (2 semanas)

#### 4.1 Rule Engine
```sql
CREATE TABLE automation_rules (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  trigger_type TEXT NOT NULL,  -- 'email_received', 'status_changed', 'time_based'
  conditions TEXT NOT NULL,  -- JSON: [{field: 'subject', operator: 'contains', value: 'urgent'}]
  actions TEXT NOT NULL,  -- JSON: [{type: 'assign', value: 'agent-1'}, {type: 'priority', value: 'high'}]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Ejemplos de reglas:**
- Auto-assign tickets de dominios VIP a senior agents
- Escalar a "urgent" si keyword "emergency" en subject
- Auto-close tickets sin respuesta por 7 días
- SLA warning notifications

#### 4.2 Email Triggers
- [ ] Detectar intención de cierre ("thanks", "resolved")
- [ ] Auto-tag basado en contenido (ML básico)
- [ ] Sentiment analysis (positivo/negativo)

#### 4.3 Integraciones
- [ ] Slack notifications
- [ ] Teams notifications
- [ ] Webhooks salientes para otros sistemas

---

## 📝 Checklist de Implementación

### Semana 1-2: Core
- [ ] Crear schema completo (ticket_messages, ticket_attachments, ticket_events)
- [ ] Migrar datos existentes de emails → tickets
- [ ] Mejorar Gmail sync con threading
- [ ] Implementar parser de attachments
- [ ] API: GET /api/tickets/[id]
- [ ] API: GET /api/tickets/[id]/messages
- [ ] API: POST /api/tickets/[id]/reply
- [ ] Página: /tickets/[id] con TicketWorkspace
- [ ] Conectar TicketList → TicketWorkspace

### Semana 3-4: Enriquecimiento
- [ ] Sistema de adjuntos completo
- [ ] Timeline service automático
- [ ] Macros básicos
- [ ] Templates UI

### Semana 5: Tiempo Real
- [ ] WebSocket server
- [ ] Cliente WebSocket
- [ ] Notificaciones live

### Semana 6: Automatización
- [ ] Rule engine básico
- [ ] Auto-assignment
- [ ] SLA triggers

---

## 🔧 Comandos Útiles

### Desarrollo
```bash
npm run dev              # Iniciar dev server
npm run build            # Build para producción
npm run lint             # Linter
```

### Base de Datos
```bash
npx drizzle-kit generate  # Generar migraciones
npx drizzle-kit push      # Aplicar schema a DB
npx drizzle-kit studio    # UI para explorar DB
```

### Testing
```bash
npm run test:e2e         # Tests end-to-end con Playwright
```

---

## 📚 Referencias Técnicas

### Arquitectura de Threading
- **Message-ID**: Identificador único del email
- **In-Reply-To**: Message-ID del email padre
- **References**: Lista de todos los Message-IDs en el thread

### Gmail API
- `users.messages.list()` - Listar mensajes
- `users.messages.get()` - Obtener mensaje completo
- `users.messages.attachments.get()` - Descargar adjunto
- `users.messages.send()` - Enviar email

### DOMPurify Config
```typescript
DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['p', 'div', 'a', 'img', 'blockquote', ...],
  FORBID_TAGS: ['script', 'iframe', 'object'],
  FORCE_BODY: true,
});
```

---

## 🎯 Métricas de Éxito

### Performance
- [ ] Tiempo de carga de ticket < 1s
- [ ] Renderizado de HTML seguro < 200ms
- [ ] WebSocket latency < 100ms

### Funcionalidad
- [ ] Threading correcto en 100% de casos
- [ ] Zero XSS vulnerabilities
- [ ] Soporte para imágenes inline
- [ ] Adjuntos hasta 25MB

### UX
- [ ] Layout responsive
- [ ] Paneles resizables
- [ ] Keyboard shortcuts
- [ ] Offline support (service worker)

---

**Última actualización:** Oct 23, 2025
**Versión:** 1.0
**Autor:** Sistema Hawkmail
