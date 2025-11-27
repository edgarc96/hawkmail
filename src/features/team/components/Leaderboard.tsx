"use client";

interface TeamPerformance {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  metrics: {
    totalAssigned: number;
    replied: number;
    pending: number;
    overdue: number;
    avgReplyTimeMinutes: number;
    resolutionRate: number;
  };
}

interface LeaderboardProps {
  teamPerformance: TeamPerformance[];
  type: 'resolution' | 'workload';
}

export function Leaderboard({ teamPerformance, type }: LeaderboardProps) {
  const sortedTeam = type === 'resolution'
    ? [...teamPerformance].sort((a, b) => b.metrics.resolutionRate - a.metrics.resolutionRate).slice(0, 5)
    : [...teamPerformance].sort((a, b) => b.metrics.pending - a.metrics.pending).slice(0, 5);

  return (
    <div className="rounded-lg border border-white/10 bg-[#18181b] p-5">
      <h2 className="mb-4 text-xl font-semibold text-white">
        {type === 'resolution' ? 'Leaderboard (by Resolution Rate)' : 'Workload (Pending Emails)'}
      </h2>
      <div className="space-y-3">
        {sortedTeam.map((m, idx) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 p-3 transition-colors hover:border-white/20"
          >
            <div className="flex items-center gap-3">
              {type === 'resolution' && (
                <span className="w-6 text-center text-sm font-medium text-gray-400">{idx + 1}.</span>
              )}
              <div>
                <p className="font-semibold text-white">{m.name}</p>
                {type === 'resolution' && (
                  <p className="text-xs text-gray-400">
                    Replied: {m.metrics.replied} / Assigned: {m.metrics.totalAssigned}
                  </p>
                )}
              </div>
            </div>
            {type === 'resolution' ? (
              <span className="text-sm font-semibold text-green-400">{m.metrics.resolutionRate}%</span>
            ) : (
              <span className="text-sm font-semibold text-amber-400">{m.metrics.pending} pending</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
