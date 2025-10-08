import type { Metadata } from "next";
import Navigation from "@/components/sections/navigation";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-foreground">Iniciar sesión</h1>
          <Card className="p-6 shadow">
            <LoginForm />
          </Card>
        </div>
      </main>
    </div>
  );
}