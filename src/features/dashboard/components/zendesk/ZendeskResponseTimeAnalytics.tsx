import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  AgentPerformanceDatum,
  ResponseTrendDatum,
  SlaComplianceDatum,
} from "./types";

interface ResponseTimeAnalyticsProps {
  trendData: ResponseTrendDatum[];
  agentPerformance: AgentPerformanceDatum[];
  slaCompliance: SlaComplianceDatum[];
}

export function ZendeskResponseTimeAnalytics({
  trendData,
  agentPerformance,
  slaCompliance,
}: ResponseTimeAnalyticsProps) {
  const hasTrendData = trendData.length > 0;
  const hasResolutionMinutes = trendData.some(
    (item) => item.resolutionMinutes != null && item.resolutionMinutes > 0
  );
  const hasAgentData = agentPerformance.length > 0;
  const hasSlaData = slaCompliance.length > 0;

  return (
    <Tabs defaultValue={hasTrendData ? "trends" : hasAgentData ? "agents" : "sla"}>
      <TabsList className="bg-[#18181b] border-white/10">
        <TabsTrigger
          value="trends"
          disabled={!hasTrendData}
          className="data-[state=active]:bg-violet-600"
        >
          Tendencias
        </TabsTrigger>
        <TabsTrigger
          value="agents"
          disabled={!hasAgentData}
          className="data-[state=active]:bg-violet-600"
        >
          Rendimiento de Agentes
        </TabsTrigger>
        <TabsTrigger
          value="sla"
          disabled={!hasSlaData}
          className="data-[state=active]:bg-violet-600"
        >
          Cumplimiento SLA
        </TabsTrigger>
      </TabsList>

      <TabsContent value="trends" className="mt-6">
        <Card className="p-6 bg-[#18181b] border-white/10">
          {hasTrendData ? (
            <>
              <h3 className="mb-4 text-white">
                Tiempos de Respuesta y Resolución (minutos)
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="firstReplyMinutes"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Primera Respuesta"
                  />
                  <Line
                    type="monotone"
                    dataKey="resolutionMinutes"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Resolución"
                  />
                  <Line
                    type="monotone"
                    dataKey="targetMinutes"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Objetivo SLA"
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-sm text-gray-400">
              Aún no hay datos suficientes para mostrar tendencias.
            </p>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="agents" className="mt-6">
        <Card className="p-6 bg-[#18181b] border-white/10">
          {hasAgentData ? (
            <>
              <h3 className="mb-4 text-white">Rendimiento por Agente</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agent" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar
                    dataKey="avgFirstReplyMinutes"
                    fill="#3b82f6"
                    name="Tiempo Primera Resp. (min)"
                  />
                  <Bar
                    dataKey="avgResolutionMinutes"
                    fill="#10b981"
                    name="Tiempo Resolución (min)"
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                {agentPerformance.map((agent) => (
                  <Card
                    key={agent.agent}
                    className="p-4 bg-[#27272a] border-white/10 space-y-2"
                  >
                    <p className="text-sm text-gray-400">{agent.agent}</p>
                    <p className="text-2xl text-white">{agent.tickets} tickets</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-gray-400">
                        <span>Primera resp.</span>
                        <span className="text-white">
                          {agent.avgFirstReplyMinutes}m
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Resolución</span>
                        <span className="text-white">
                          {Math.floor(agent.avgResolutionMinutes / 60)}h{" "}
                          {agent.avgResolutionMinutes % 60}m
                        </span>
                      </div>
                      {agent.satisfactionPercentage != null && (
                        <div className="flex justify-between text-gray-400">
                          <span>Satisfacción</span>
                          <span className="text-green-500">
                            {agent.satisfactionPercentage}%
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">
              No hay datos de desempeño de agentes para mostrar.
            </p>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="sla" className="mt-6">
        <Card className="p-6 bg-[#18181b] border-white/10">
          {hasSlaData ? (
            <>
              <h3 className="mb-4 text-white">
                Cumplimiento de SLA por Categoría
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={slaCompliance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="category" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="met" stackId="a" fill="#10b981" name="Cumplido %" />
                  <Bar
                    dataKey="breached"
                    stackId="a"
                    fill="#ef4444"
                    name="Incumplido %"
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {slaCompliance.map((item) => (
                  <Card
                    key={item.category}
                    className="p-4 bg-[#27272a] border-white/10"
                  >
                    <p className="text-sm text-gray-400 mb-2">{item.category}</p>
                    <p className="text-3xl text-white mb-1">{item.met}%</p>
                    <p className="text-xs text-gray-500">
                      {item.breached}% fuera de SLA
                    </p>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">
              Cuando tengas configuraciones de SLA verás el cumplimiento aquí.
            </p>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
}
