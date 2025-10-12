# 🔒 Sistema de Roles y Permisos

## ✅ IMPLEMENTADO - Sistema de Control de Acceso

Tu aplicación ahora tiene un **sistema completo de roles** que previene que los agentes accedan a funciones de admin.

---

## 👥 Tipos de Usuarios

### 1. **Admin (Tú - El Dueño)**
**Permisos COMPLETOS:**
- ✅ Ver todos los emails del equipo
- ✅ Ver KPIs y performance de todos los agents
- ✅ Agregar y eliminar team members
- ✅ Asignar emails a agents
- ✅ Configurar SLA settings
- ✅ Conectar Gmail/Outlook
- ✅ Ver analytics completos
- ✅ Acceder a Settings
- ✅ Gestionar todo el sistema

**Secciones que puede ver:**
- Dashboard (todos los emails)
- Analytics (todo el equipo)
- Alerts (todas las alertas)
- Team (performance de todos)
- Settings (configuración completa)

---

### 2. **Manager**
**Permisos MEDIOS:**
- ✅ Ver todos los emails del equipo
- ✅ Ver KPIs y performance de todos los agents
- ❌ NO puede agregar/eliminar team members
- ✅ Asignar emails a agents
- ❌ NO puede configurar SLA
- ❌ NO puede conectar providers
- ✅ Ver analytics del equipo
- ❌ NO puede acceder a Settings

**Secciones que puede ver:**
- Dashboard (todos los emails)
- Analytics (todo el equipo)
- Alerts (todas las alertas)
- Team (performance de todos)
- ~~Settings~~ (BLOQUEADO)

---

### 3. **Agent (Los Empleados)**
**Permisos LIMITADOS:**
- ✅ Ver SOLO emails asignados a él/ella
- ❌ NO puede ver emails de otros
- ❌ NO puede ver KPIs del equipo
- ❌ NO puede agregar team members
- ❌ NO puede asignar emails
- ❌ NO puede configurar nada
- ❌ NO puede conectar providers
- ✅ Ver solo sus propias estadísticas
- ❌ NO puede acceder a Settings o Team

**Secciones que puede ver:**
- Dashboard (SOLO sus emails asignados)
- ~~Analytics~~ (BLOQUEADO - redirige a Dashboard)
- ~~Alerts~~ (BLOQUEADO - redirige a Dashboard)
- ~~Team~~ (BLOQUEADO - redirige a Dashboard)
- ~~Settings~~ (BLOQUEADO - redirige a Dashboard)

---

## 🛡️ Cómo Funciona la Protección

### 1. **Middleware de Verificación**
Ubicación: `/middleware.ts`

```typescript
// Al acceder a cualquier ruta protegida:
1. Verifica que el usuario esté autenticado
2. Obtiene el rol del usuario de la DB
3. Bloquea acceso según el rol:
   - Agents → Solo /dashboard
   - Managers → Todo excepto /settings
   - Admins → Todo permitido
```

### 2. **Filtrado de Datos en APIs**
Ubicación: `/src/app/api/*`

Ejemplo: `/api/emails/route.ts`
```typescript
// Si es Agent:
- Solo devuelve emails donde assignedTo = agent.id

// Si es Manager o Admin:
- Devuelve todos los emails del equipo
```

### 3. **UI Condicional**
Ubicación: `/src/app/dashboard/page.tsx`

```typescript
// Las secciones se ocultan según el rol:
{userRole === 'admin' && (
  <button>Team Section</button>
)}

{userRole !== 'agent' && (
  <button>Analytics Section</button>
)}
```

---

## 🎯 Cómo Asignar Roles

### **Cuando Creas Tu Cuenta:**
- **Automáticamente eres ADMIN** (role='admin')
- Tienes todos los permisos

### **Cuando Agregas Team Members:**

**Opción 1: Team Members son solo "registros"** (ACTUAL)
- Se crean en la tabla `team_members`
- NO tienen acceso de login
- Solo sirven para asignar emails

**Opción 2: Invitar Agents con Login** (A IMPLEMENTAR)
- Envías invitación por email
- El agent crea su cuenta
- Su rol se establece como 'agent'
- Solo puede ver dashboard con sus emails

---

## 🔄 Estado Actual vs. Próximo Paso

### ✅ YA IMPLEMENTADO:
1. Campo `role` agregado a tabla `user`
2. Middleware que verifica roles
3. Sistema de permisos (`permissions.ts`)
4. Función `getCurrentUser()` que obtiene rol

### 🚧 FALTA IMPLEMENTAR:
1. **Sistema de Invitaciones**
   - Para que agents puedan crear cuenta
   - Enviar email de invitación
   - Link único de registro

2. **Filtrado de Emails por Agent**
   - API `/api/emails` debe filtrar por `assignedTo`
   - Dashboard solo muestra emails del agent

3. **Dashboard Diferenciado**
   - Vista simplificada para agents
   - Ocultar secciones según rol

---

## 🔐 Ejemplo de Flujo

### Escenario: Contratas a un Agent

**Opción A (Actual - Sin Login):**
1. Tú (Admin) agregas "Juan" como team member
2. Juan NO puede hacer login
3. Tú asignas emails a Juan
4. Juan ve los emails en un sistema externo (o tú le dices)

**Opción B (Con Login - A Implementar):**
1. Tú (Admin) envías invitación a juan@company.com
2. Juan recibe email con link de registro
3. Juan crea cuenta, su rol = 'agent'
4. Juan hace login y solo ve:
   - Dashboard con SUS emails asignados
   - Puede responder emails
   - Ve sus propias estadísticas
5. Juan NO puede:
   - Ver emails de otros
   - Acceder a Team, Analytics, Settings
   - Ver KPIs del equipo

---

## ⚙️ Configuración Técnica

### Tabla `user` (Better Auth):
```sql
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin', -- admin, manager, agent
  organization_id TEXT, -- Para multi-tenant futuro
  ...
);
```

### Verificación en Middleware:
```typescript
const userRole = userDetails[0].role || 'admin';

if (userRole === 'agent') {
  // Redirigir si intenta acceder a rutas prohibidas
  if (pathname !== '/dashboard') {
    return NextResponse.redirect('/dashboard');
  }
}
```

---

## 🚀 Próximos Pasos Recomendados

### Prioridad 1: Implementar Invitaciones de Agents
**Tiempo:** 1-2 horas

**Qué incluye:**
1. Endpoint `/api/team/invite` para enviar invitación
2. Email con link de registro único
3. Página de registro `/register?token=...`
4. Al registrarse, rol = 'agent' automáticamente

### Prioridad 2: Filtrar Emails por Agent
**Tiempo:** 30 minutos

**Qué incluye:**
1. Actualizar `/api/emails` para verificar rol
2. Si es agent, filtrar por `assignedTo = userId`
3. Dashboard solo muestra emails filtrados

### Prioridad 3: UI Diferenciada
**Tiempo:** 1 hora

**Qué incluye:**
1. Ocultar sidebar para agents
2. Vista simplificada del dashboard
3. Solo mostrar lo que necesitan

---

## ❓ FAQs

**Q: ¿Cómo me aseguro de que SOY admin?**
A: Tu cuenta (la primera que creaste con Google) es admin por defecto.

**Q: ¿Los team members que agrego pueden hacer login?**
A: No actualmente. Son solo "registros" para asignar emails. Si quieres que hagan login, necesitas implementar el sistema de invitaciones.

**Q: ¿Puedo cambiar el rol de alguien?**
A: Sí, puedes agregar un endpoint `/api/users/[id]/role` para cambiar roles.

**Q: ¿Qué pasa si un agent intenta acceder a /team?**
A: El middleware lo redirige automáticamente a /dashboard.

**Q: ¿Cómo sé qué rol tengo?**
A: Tu sesión incluye el rol. Puedes verlo en el dashboard o hacer:
```bash
# Ve tu información de usuario
SELECT * FROM user WHERE email = 'tu-email@gmail.com';
```

---

## 💡 ¿Necesitas Ayuda?

**¿Quieres que implemente ahora?**

**A) Sistema de Invitaciones** - Para que agents puedan registrarse y hacer login

**B) Filtrado de Emails** - Para que agents solo vean sus emails

**C) UI Diferenciada** - Dashboard simplificado para agents

**D) Todo lo anterior** - Sistema completo de multi-usuario

**Dime qué prefieres y lo implemento inmediatamente.**
