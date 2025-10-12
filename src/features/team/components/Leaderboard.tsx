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
    <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">
        {type === 'resolution' ? 'Leaderboard (by Resolution Rate)' : 'Workload (Pending Emails)'}
      </h2>
      <div className="space-y-2">
        {sortedTeam.map((m, idx) => (
          <div key={m.id} className="flex items-center justify-between bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-3">
            <div className="flex items-center gap-3">
              {type === 'resolution' && (
                <span className="text-purple-300 text-sm w-6 text-center">{idx + 1}.</span>
              )}
              <div>
                <p className="text-white font-semibold">{m.name}</p>
                {type === 'resolution' && (
                  <p className="text-xs text-purple-300">Replied: {m.metrics.replied} / Assigned: {m.metrics.totalAssigned}</p>
                )}
              </div>
            </div>
            {type === 'resolution' ? (
              <span className="text-green-400 font-bold">{m.metrics.resolutionRate}%</span>
            ) : (
              <div className="text-yellow-400 font-bold">{m.metrics.pending} pending</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}