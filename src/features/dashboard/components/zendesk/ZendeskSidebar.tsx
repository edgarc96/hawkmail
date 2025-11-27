import { useState } from "react";
import clsx from "clsx";
import {
  BarChart3,
  Users,
  Mail,
  Settings,
  FileText,
  Clock,
  Bell,
  Sliders,
} from "lucide-react";
import type { DashboardView } from "./types";

interface SidebarProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  userName?: string | null;
  userEmail?: string | null;
  showAlerts?: boolean;
}

export function ZendeskSidebar({
  activeView,
  onViewChange,
  userName,
  userEmail,
  showAlerts = true,
}: SidebarProps) {
  const [isReportsOpen, setIsReportsOpen] = useState(true);

  const baseItems: Array<{
    id: DashboardView;
    label: string;
    icon: typeof BarChart3;
    isReport?: boolean;
  }> = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "tickets", label: "Tickets", icon: Mail },
    { id: "agents", label: "Agents", icon: Users },
    { id: "configuration", label: "Automation", icon: Sliders },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const reportItems: Array<{
    id: DashboardView;
    label: string;
    icon: typeof Clock;
  }> = [
    { id: "sla", label: "SLA Reports", icon: Clock },
    { id: "performance", label: "Performance", icon: FileText },
  ];

  const alertsItem = showAlerts
    ? [{ id: "alerts" as DashboardView, label: "Alerts", icon: Bell }]
    : [];

  return (
    <div className="w-64 bg-[#0a0a0f] border-r border-white/10 flex flex-col h-full">
      <nav className="flex-1 p-4 space-y-1">
        {baseItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
              activeView === id
                ? "bg-violet-600 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}

        <div className="pt-2">
          <button
            onClick={() => setIsReportsOpen((prev) => !prev)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors text-sm"
            aria-expanded={isReportsOpen}
          >
            <FileText className="w-5 h-5" />
            <span className="flex-1 text-left">Reports</span>
            <svg
              className={clsx(
                "w-4 h-4 transition-transform",
                isReportsOpen ? "rotate-180" : ""
              )}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 8L10 13L15 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {isReportsOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {reportItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onViewChange(id)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                    activeView === id
                      ? "bg-violet-600 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {alertsItem.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
              activeView === id
                ? "bg-violet-600 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm uppercase">
            {userName
              ? userName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((name) => name[0])
                  .join("")
              : "EC"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">
              {userName ?? "Edgar Cabrera"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userEmail ?? "edgar@company.com"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
