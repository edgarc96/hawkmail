# 👥 Guía de Gestión de Team Members

## 🎯 Cómo Funciona el Sistema de Team Members

### Conceptos Clave

**Roles:**
- **Manager**: Puede ver performance de todo el equipo, asignar emails, configurar SLAs
- **Agent**: Solo ve emails asignados a él/ella, responde y resuelve tickets

**Flujo de Trabajo:**
```
1. Manager agrega agentes al equipo
2. Emails llegan y se sincronizan desde Gmail
3. Manager (o sistema automático) asigna emails a agentes
4. Agentes responden sus emails asignados
5. Manager monitorea performance en tiempo real
```

---

## 📋 Cómo Agregar Team Members

### Opción 1: Desde la UI

1. **Ve a Settings** → Sección "Team Members"

2. **Click en "Add Team Member"**

3. **Llena el formulario:**
   - Name: Juan Pérez
   - Email: juan@company.com
   - Role: Agent (o Manager)
   - Status: Active

4. **Click "Save"**

### Opción 2: Via API

```bash
curl -X POST http://localhost:3000/api/team \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@company.com",
    "role": "agent",
    "isActive": true
  }'
```

**Respuesta:**
```json
{
  "id": 1,
  "userId": "user_123",
  "name": "Juan Pérez",
  "email": "juan@company.com",
  "role": "agent",
  "isActive": true,
  "createdAt": "2025-10-08T22:00:00Z"
}
```

---

## 📊 Cómo Ver Performance de Team Members

### 1. Ver Lista de Team Members

```bash
GET /api/team
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@company.com",
    "role": "agent",
    "isActive": true
  },
  {
    "id": 2,
    "name": "María García",
    "email": "maria@company.com",
    "role": "agent",
    "isActive": true
  }
]
```

### 2. Ver Performance Completo del Equipo

```bash
GET /api/team/performance
```

**Respuesta:**
```json
{
  "teamPerformance": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@company.com",
      "role": "agent",
      "isActive": true,
      "metrics": {
        "totalAssigned": 45,
        "replied": 42,
        "pending": 2,
        "overdue": 1,
        "avgReplyTimeMinutes": 85,
        "resolutionRate": 93
      }
    },
    {
      "id": 2,
      "name": "María García",
      "email": "maria@company.com",
      "role": "agent",
      "isActive": true,
      "metrics": {
        "totalAssigned": 38,
        "replied": 35,
        "pending": 3,
        "overdue": 0,
        "avgReplyTimeMinutes": 92,
        "resolutionRate": 92
      }
    }
  ],
  "summary": {
    "totalMembers": 2,
    "activeMembers": 2,
    "totalEmailsAssigned": 83,
    "totalReplied": 77,
    "totalPending": 5,
    "totalOverdue": 1
  }
}
```

---

## ✉️ Cómo Asignar Emails a Team Members

### 1. Asignar Email a un Agente

```bash
POST /api/emails/123/assign
Content-Type: application/json

{
  "teamMemberId": 1
}
```

**Respuesta:**
```json
{
  "email": {
    "id": 123,
    "subject": "Help with billing issue",
    "assignedTo": 1,
    "status": "pending"
  },
  "assignedTo": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@company.com"
  },
  "message": "Email assigned to Juan Pérez"
}
```

### 2. Desasignar Email

```bash
DELETE /api/emails/123/assign
```

---

## 🎨 Cómo Visualizar Team Members en el Dashboard

### Implementación Recomendada

#### 1. **Team Overview Section (Dashboard Principal)**

```jsx
// En src/app/dashboard/page.tsx

const [teamPerformance, setTeamPerformance] = useState([]);

useEffect(() => {
  async function fetchTeamPerformance() {
    const res = await fetch('/api/team/performance', {
      credentials: 'include',
    });
    const data = await res.json();
    setTeamPerformance(data.teamPerformance);
  }
  fetchTeamPerformance();
}, []);

// Renderizar
<div className="team-overview">
  <h2>Team Performance</h2>
  
  {teamPerformance.map((member) => (
    <div key={member.id} className="team-member-card">
      <div className="member-info">
        <h3>{member.name}</h3>
        <span className="role">{member.role}</span>
      </div>
      
      <div className="member-stats">
        <div className="stat">
          <span className="label">Assigned</span>
          <span className="value">{member.metrics.totalAssigned}</span>
        </div>
        
        <div className="stat">
          <span className="label">Replied</span>
          <span className="value">{member.metrics.replied}</span>
        </div>
        
        <div className="stat">
          <span className="label">Pending</span>
          <span className="value">{member.metrics.pending}</span>
        </div>
        
        <div className="stat">
          <span className="label">Avg Time</span>
          <span className="value">
            {Math.round(member.metrics.avgReplyTimeMinutes / 60)}h
          </span>
        </div>
        
        <div className="stat">
          <span className="label">Resolution</span>
          <span className="value">{member.metrics.resolutionRate}%</span>
        </div>
      </div>
      
      {member.metrics.overdue > 0 && (
        <div className="alert">
          ⚠️ {member.metrics.overdue} overdue emails
        </div>
      )}
    </div>
  ))}
</div>
```

#### 2. **Leaderboard (Ranking)**

```jsx
const sortedTeam = [...teamPerformance].sort(
  (a, b) => b.metrics.resolutionRate - a.metrics.resolutionRate
);

<div className="leaderboard">
  <h2>🏆 Top Performers</h2>
  {sortedTeam.slice(0, 3).map((member, index) => (
    <div key={member.id} className="leaderboard-entry">
      <span className="rank">
        {index === 0 && '🥇'}
        {index === 1 && '🥈'}
        {index === 2 && '🥉'}
      </span>
      <span className="name">{member.name}</span>
      <span className="score">{member.metrics.resolutionRate}%</span>
    </div>
  ))}
</div>
```

#### 3. **Email Assignment Dropdown**

```jsx
const [selectedMember, setSelectedMember] = useState(null);

async function assignEmail(emailId, memberId) {
  await fetch(`/api/emails/${emailId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ teamMemberId: memberId }),
  });
  
  toast.success('Email assigned!');
  refreshDashboard();
}

// En el modal de email details
<select 
  value={selectedMember} 
  onChange={(e) => assignEmail(email.id, e.target.value)}
>
  <option value="">Assign to...</option>
  {teamMembers.map((member) => (
    <option key={member.id} value={member.id}>
      {member.name} ({member.metrics?.pending || 0} pending)
    </option>
  ))}
</select>
```

---

## 📈 Métricas Clave por Team Member

### KPIs que deberías mostrar:

1. **Total Assigned**: Emails asignados al agente
2. **Replied**: Emails respondidos exitosamente
3. **Pending**: Emails sin responder
4. **Overdue**: Emails que violaron SLA
5. **Avg Reply Time**: Tiempo promedio de primera respuesta
6. **Resolution Rate**: % de emails resueltos del total asignado
7. **SLA Compliance**: % de emails respondidos dentro del SLA

### Comparación Visual

```
Juan Pérez        ████████░░ 93%
María García      ████████░░ 92%
Pedro López       ███████░░░ 85%
```

---

## 🔔 Alertas por Team Member

### Alertas que deberías implementar:

1. **Overload Alert**
   - Se activa cuando un agente tiene >10 emails pending
   - Sugerencia: "Reasignar emails a otros agentes"

2. **Performance Alert**
   - Se activa cuando la resolution rate < 80%
   - Sugerencia: "Agente necesita capacitación o reducir carga"

3. **SLA Risk Alert**
   - Se activa cuando hay emails próximos a vencer
   - Sugerencia: "Escalar o reasignar email urgente"

---

## 🚀 Próximos Pasos

1. **Agrega algunos team members de prueba:**
   ```bash
   # Agente 1
   curl -X POST http://localhost:3000/api/team \
     -H "Content-Type: application/json" \
     -d '{"name": "Juan Pérez", "email": "juan@test.com", "role": "agent"}'
   
   # Agente 2
   curl -X POST http://localhost:3000/api/team \
     -H "Content-Type: application/json" \
     -d '{"name": "María García", "email": "maria@test.com", "role": "agent"}'
   ```

2. **Asigna algunos emails:**
   ```bash
   # Asignar email 1 a Juan
   curl -X POST http://localhost:3000/api/emails/1/assign \
     -H "Content-Type: application/json" \
     -d '{"teamMemberId": 1}'
   ```

3. **Visualiza la performance:**
   ```bash
   curl http://localhost:3000/api/team/performance
   ```

---

## 💡 Tips para Managers

1. **Balance de Carga**: Distribuye emails equitativamente
2. **Especialización**: Asigna emails según expertise del agente
3. **Monitoreo Constante**: Revisa el dashboard cada hora
4. **Ayuda Proactiva**: Si ves overdue, reasigna inmediatamente
5. **Reconocimiento**: Celebra a los top performers

---

## ❓ FAQs

**Q: ¿Puedo agregar managers?**
A: Sí, usa `"role": "manager"` al crear el team member.

**Q: ¿Los agentes pueden ver emails de otros agentes?**
A: No, solo ven sus emails asignados (feature a implementar).

**Q: ¿Puedo reasignar un email ya asignado?**
A: Sí, simplemente asigna el email a otro miembro.

**Q: ¿Cómo funciona la asignación automática?**
A: Feature pendiente. Se basará en carga actual y performance.

**Q: ¿Puedo desactivar un team member?**
A: Sí, marca `"isActive": false` y ya no podrás asignarle emails.

---

¿Necesitas ayuda implementando alguna de estas funciones? ¡Avísame!
