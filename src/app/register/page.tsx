import type { Metadata } from "next";
import Navigation from "@/components/sections/navigation";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-foreground">Crear cuenta</h1>
          <Card className="p-6 shadow">
            <RegisterForm />
          </Card>
        </div>
      </main>
    </div>
  );
}