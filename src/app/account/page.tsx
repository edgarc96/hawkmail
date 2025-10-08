import type { Metadata } from "next";
import Navigation from "@/components/sections/navigation";
import { AccountClient } from "@/components/protected/AccountClient";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-16">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Cuenta</h1>
        <AccountClient />
      </main>
    </div>
  );
}