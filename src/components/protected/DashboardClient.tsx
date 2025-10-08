"use client";

import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const DashboardClient = () => {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session?.user) return null;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-2">Bienvenido</h2>
        <p className="text-muted-foreground">
          {session.user.name || session.user.email}
        </p>
      </Card>

      <div className="flex items-center gap-3">
        <Button asChild>
          <Link href="/account">Ir a mi cuenta</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardClient;