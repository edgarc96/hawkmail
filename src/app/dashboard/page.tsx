import type { Metadata } from "next";
import Navigation from "@/components/sections/navigation";
import { DashboardClient } from "@/components/protected/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-16">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Dashboard</h1>
        <DashboardClient />
      </main>
    </div>
  );
}