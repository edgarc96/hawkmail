import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { SlaComplianceDatum } from "./types";

interface ZendeskSLASectionProps {
  complianceData: SlaComplianceDatum[];
  conversationsPerDay?: number | null;
}

export function ZendeskSLASection({
  complianceData,
  conversationsPerDay,
}: ZendeskSLASectionProps) {
  const overallCompliance =
    complianceData.length > 0
      ? Math.round(
          complianceData.reduce((acc, item) => acc + item.met, 0) /
            complianceData.length
        )
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl text-white mb-2">
          SLA Report para mi compañía
        </h2>
        <p className="text-sm text-gray-400">
          Visualiza el desempeño de tus acuerdos de nivel de servicio.
        </p>
      </div>

      <Card className="p-6 md:p-8 bg-[#18181b] border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-white uppercase tracking-wide text-sm">
              Con horario laboral
            </h3>
            <button className="text-violet-400 hover:text-violet-300">
              <Info className="w-4 h-4" />
            </button>
          </div>
          {overallCompliance != null && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Cumplimiento promedio</span>
              <span className="text-white">{overallCompliance}%</span>
            </div>
          )}
        </div>

        <div className="bg-[#27272a] border border-white/10 rounded-lg p-4 mb-6 max-w-md">
          <p className="text-sm text-gray-300">
            Protege tus SLA manteniendo los objetivos configurados al día y
            monitoreando los incidentes críticos.
          </p>
          {overallCompliance != null && (
            <div className="mt-4">
              <div className="h-1.5 bg-white/10 rounded-full">
                <div
                  className="h-full bg-violet-600 rounded-full"
                  style={{ width: `${overallCompliance}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {overallCompliance}% de cumplimiento promedio
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complianceData.map((item) => (
            <Card key={item.category} className="p-4 bg-[#27272a] border-white/10">
              <p className="text-sm text-gray-400 mb-2">{item.category}</p>
              <p className="text-3xl text-white">{item.met}%</p>
              <p className="text-xs text-gray-500">
                {item.breached}% fuera de SLA
              </p>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-6 md:p-8 bg-[#18181b] border-white/10 text-center">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-white uppercase tracking-wide text-sm">
              Emails promedio por intervalo
            </h3>
            <button className="text-violet-400 hover:text-violet-300">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="py-10">
          <p className="text-6xl text-white mb-2">
            {conversationsPerDay != null
              ? conversationsPerDay.toFixed(2)
              : "—"}
          </p>
          <p className="text-gray-400">Conversaciones por día</p>
        </div>
      </Card>
    </div>
  );
}
