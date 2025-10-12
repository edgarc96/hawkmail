"use client";

import { AlertCircle, CheckCircle } from "lucide-react";

interface Alert {
  id: number;
  emailId: number;
  message: string;
  alertType: string;
  isRead: boolean;
  createdAt: string;
}

interface AlertsListProps {
  alerts: Alert[];
  isLive?: boolean;
  lastEventAt?: Date | null;
}

export function AlertsList({ alerts, isLive = false, lastEventAt }: AlertsListProps) {
  return (
    <div className="bg-[#2a1f3d]/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Active Alerts</h2>
        <div className="flex items-center gap-3 text-xs text-purple-300">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${
            isLive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400' : 'bg-red-400'}`}></span>
            {isLive ? 'LIVE' : 'OFFLINE'}
          </span>
          {lastEventAt && (
            <span>Updated {lastEventAt.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-[#1a0f2e]/40 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-600/20 rounded-lg">
                  <AlertCircle className="text-red-400" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded font-semibold">
                      {alert.alertType}
                    </span>
                    <span className="text-purple-400 text-xs">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-white">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
          <p className="text-purple-300">No active alerts. Everything looks good!</p>
        </div>
      )}
    </div>
  );
}