"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { TicketsSection } from "@/features/tickets/components/TicketsSection";

export default function TicketsPage() {
  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        <TicketsSection />
      </div>
    </DashboardLayout>
  );
}
