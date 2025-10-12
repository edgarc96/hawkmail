# 🚀 Acciones Inmediatas - Time To Reply

## ✅ Lo Que Ya Funciona (Listo para Usar)

1. **OAuth con Gmail** ✅
2. **Sincronización de emails** ✅ (50 emails de últimos 7 días)
3. **Envío de respuestas reales** ✅
4. **Dashboard básico con métricas** ✅
5. **Sistema de team members** ✅ (Backend completo)
6. **Asignación de emails a agentes** ✅ (Backend completo)
7. **API de performance por agente** ✅

---

## 🎯 PARA PROBAR EL SISTEMA AHORA

### 1. Reinicia el Servidor

```bash
# El servidor debe estar corriendo
npm run dev
```

### 2. Agrega Team Members

```bash
# Agrega 2-3 agentes de prueba
curl -X POST http://localhost:3000/api/team \
  -H "Content-Type: application/json" \
  -H "Cookie: [tu_cookie_de_sesión]" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@test.com",
    "role": "agent",
    "isActive": true
  }'

curl -X POST http://localhost:3000/api/team \
  -H "Content-Type: application/json" \
  -H "Cookie: [tu_cookie_de_sesión]" \
  -d '{
    "name": "María García", 
    "email": "maria@test.com",
    "role": "agent",
    "isActive": true
  }'
```

### 3. Asigna Emails a Agentes

```bash
# Primero, obtén el ID de un team member
curl http://localhost:3000/api/team

# Luego asigna un email (reemplaza los IDs)
curl -X POST http://localhost:3000/api/emails/1/assign \
  -H "Content-Type: application/json" \
  -H "Cookie: [tu_cookie_de_sesión]" \
  -d '{
    "teamMemberId": 1
  }'
```

### 4. Ve la Performance del Equipo

```bash
curl http://localhost:3000/api/team/performance
```

---

## 🎨 INTERFAZ A ACTUALIZAR (Próximos Pasos)

### Prioridad 1: Team Dashboard (2-3 horas)

**Ubicación:** `src/app/dashboard/page.tsx` → Sección "Team"

**Agregar:**

1. **Lista de Team Members con Métricas**
```jsx
{activeSection === 'team' && (
  <div className="space-y-6">
    {/* Resumen del Equipo */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="stat-card">
        <h3>Total Miembros</h3>
        <p className="text-3xl">{teamPerformance.summary.totalMembers}</p>
      </div>
      <div className="stat-card">
        <h3>Emails Asignados</h3>
        <p className="text-3xl">{teamPerformance.summary.totalEmailsAssigned}</p>
      </div>
      <div className="stat-card">
        <h3>Respondidos</h3>
        <p className="text-3xl">{teamPerformance.summary.totalReplied}</p>
      </div>
      <div className="stat-card">
        <h3>Overdue</h3>
        <p className="text-3xl text-red-500">{teamPerformance.summary.totalOverdue}</p>
      </div>
    </div>

    {/* Performance por Agente */}
    <div className="team-members-grid">
      {teamPerformance.teamPerformance?.map((member) => (
        <div key={member.id} className="member-card">
          <div className="member-header">
            <h3>{member.name}</h3>
            <span className="role-badge">{member.role}</span>
          </div>
          
          <div className="metrics">
            <div className="metric">
              <span>Asignados</span>
              <strong>{member.metrics.totalAssigned}</strong>
            </div>
            <div className="metric">
              <span>Respondidos</span>
              <strong>{member.metrics.replied}</strong>
            </div>
            <div className="metric">
              <span>Pendientes</span>
              <strong>{member.metrics.pending}</strong>
            </div>
            <div className="metric">
              <span>Tiempo Promedio</span>
              <strong>{Math.round(member.metrics.avgReplyTimeMinutes / 60)}h</strong>
            </div>
            <div className="metric">
              <span>Tasa Resolución</span>
              <strong className="text-green-500">{member.metrics.resolutionRate}%</strong>
            </div>
          </div>
          
          {member.metrics.overdue > 0 && (
            <div className="alert alert-warning">
              ⚠️ {member.metrics.overdue} emails overdue
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Botón Agregar Team Member */}
    <button 
      onClick={() => setShowAddMemberModal(true)}
      className="btn btn-primary"
    >
      + Add Team Member
    </button>
  </div>
)}
```

2. **Modal de Asignación de Emails**
```jsx
// En el modal de email details, agregar:
<div className="assign-section">
  <label>Assign to Agent:</label>
  <select 
    onChange={(e) => handleAssignEmail(selectedEmail.id, e.target.value)}
  >
    <option value="">Unassigned</option>
    {teamMembers.map((member) => (
      <option key={member.id} value={member.id}>
        {member.name} ({member.metrics?.pending || 0} pending)
      </option>
    ))}
  </select>
</div>
```

3. **Modal para Agregar Team Members**
```jsx
const [showAddMemberModal, setShowAddMemberModal] = useState(false);

async function handleAddMember(memberData) {
  await fetch('/api/team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(memberData),
  });
  toast.success('Team member added!');
  fetchTeamPerformance();
}

{showAddMemberModal && (
  <Modal>
    <form onSubmit={handleAddMember}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <select name="role" required>
        <option value="agent">Agent</option>
        <option value="manager">Manager</option>
      </select>
      <button type="submit">Add Member</button>
    </form>
  </Modal>
)}
```

---

### Prioridad 2: Live Alerts (3-4 horas)

**Agregar en Dashboard:**

```jsx
const [liveAlerts, setLiveAlerts] = useState([]);

useEffect(() => {
  // Poll for alerts every 30 seconds
  const interval = setInterval(() => {
    fetchLiveAlerts();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);

async function fetchLiveAlerts() {
  // Buscar emails próximos a vencer (< 2 horas)
  const overdueEmails = emails.filter(email => {
    const now = new Date();
    const deadline = new Date(email.slaDeadline);
    const hoursRemaining = (deadline - now) / (1000 * 60 * 60);
    return hoursRemaining < 2 && hoursRemaining > 0;
  });
  
  setLiveAlerts(overdueEmails);
}

// Renderizar alertas
{liveAlerts.length > 0 && (
  <div className="live-alerts">
    <h3>🔔 Live Alerts</h3>
    {liveAlerts.map((email) => (
      <div key={email.id} className="alert alert-warning">
        <span>⚠️ Email "{email.subject}" vence en 
          {Math.round((new Date(email.slaDeadline) - new Date()) / 60000)} minutos
        </span>
        <button onClick={() => handleViewEmail(email.id)}>
          View
        </button>
      </div>
    ))}
  </div>
)}
```

---

### Prioridad 3: Analytics Mejorados (2-3 horas)

**Agregar gráficas con Recharts:**

```bash
npm install recharts
```

```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

{activeSection === 'analytics' && (
  <div className="analytics-section">
    <h2>Response Time Trends</h2>
    
    <LineChart width={800} height={400} data={dashboardData.recentMetrics}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line 
        type="monotone" 
        dataKey="avgFirstReplyTimeMinutes" 
        stroke="#8884d8" 
        name="Avg Reply Time (min)"
      />
      <Line 
        type="monotone" 
        dataKey="resolutionRate" 
        stroke="#82ca9d" 
        name="Resolution Rate (%)"
      />
    </LineChart>
    
    <h2 className="mt-8">Team Comparison</h2>
    <BarChart width={800} height={400} data={teamPerformance.teamPerformance}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="metrics.replied" fill="#82ca9d" name="Replied" />
      <Bar dataKey="metrics.pending" fill="#ffc658" name="Pending" />
      <Bar dataKey="metrics.overdue" fill="#ff7c7c" name="Overdue" />
    </BarChart>
  </div>
)}
```

---

## 🔥 FEATURES DIFERENCIADORES

### Lo Que Te Hace ÚNICO vs. Competencia

1. **Real-time Team Visibility** ✅
   - Managers ven EXACTAMENTE qué hace cada agente
   - Performance en tiempo real
   - Leaderboards automáticos

2. **Smart Assignment** (A implementar)
   - Asignación automática basada en carga
   - Balance inteligente

3. **Predictive Alerts** (A implementar)
   - Alertas ANTES de violar SLA
   - No después (como la competencia)

4. **AI-Powered** (A implementar)
   - Análisis de prioridad automático
   - Sugerencias de respuesta

---

## 📊 MÉTRICAS CLAVE QUE DEBES MOSTRAR

### Dashboard Principal:
- [x] Total Emails
- [x] Pending
- [x] Replied
- [x] Overdue
- [x] Avg Reply Time
- [ ] **NEW:** Emails Sin Asignar
- [ ] **NEW:** Team Utilization (% de capacidad)

### Team Dashboard:
- [x] Performance por agente
- [ ] **NEW:** Leaderboard (Top 3)
- [ ] **NEW:** Workload balance (quién está sobrecargado)
- [ ] **NEW:** SLA compliance por agente

### Analytics:
- [x] Tendencias de tiempo de respuesta
- [ ] **NEW:** Predicción de carga
- [ ] **NEW:** Comparación mes a mes
- [ ] **NEW:** Heatmap de actividad

---

## 💡 QUICK WINS (Implementa AHORA)

### 1. Agregar "Unassigned Emails" Counter

```jsx
const unassignedCount = emails.filter(e => !e.assignedTo).length;

<div className="stat-card">
  <Mail className="text-yellow-400" />
  <div>
    <p className="text-sm text-gray-400">Unassigned</p>
    <p className="text-2xl font-bold">{unassignedCount}</p>
  </div>
</div>
```

### 2. Agregar Indicador de Asignación en Email List

```jsx
{emails.map((email) => (
  <div key={email.id} className="email-row">
    <span className="subject">{email.subject}</span>
    <span className="from">{email.senderEmail}</span>
    
    {/* NUEVO */}
    {email.assignedTo ? (
      <span className="assigned-badge">
        👤 {getAgentName(email.assignedTo)}
      </span>
    ) : (
      <span className="unassigned-badge">
        ⚠️ Unassigned
      </span>
    )}
    
    <span className="status">{email.status}</span>
  </div>
))}
```

### 3. Quick Assign Button

```jsx
<button 
  onClick={() => autoAssignEmail(email.id)}
  className="btn-sm"
>
  ⚡ Auto Assign
</button>
```

---

## 🎯 ROADMAP SUGERIDO

### Semana 1:
- [x] OAuth & Sync funcionando
- [x] Backend de team members
- [ ] UI de team dashboard
- [ ] Asignación manual desde UI

### Semana 2:
- [ ] Live alerts system
- [ ] Analytics mejorados con gráficas
- [ ] Email templates

### Semana 3:
- [ ] Auto-assignment algorithm
- [ ] AI para clasificación de prioridad
- [ ] Notificaciones push

### Semana 4:
- [ ] Mobile responsive mejorado
- [ ] Reportes PDF
- [ ] Integraciones (Slack, webhooks)

---

## ❓ ¿Necesitas Ayuda?

**Para implementar el Team Dashboard completo:**
1. Dame luz verde y actualizo el componente de Dashboard
2. Agrego las gráficas de analytics
3. Implemento el sistema de alertas en tiempo real

**¿Qué quieres implementar primero?**
- A) Team Dashboard visual completo
- B) Live alerts system
- C) AI para clasificación automática
- D) Analytics avanzados

¡Dime y lo implementamos juntos!
