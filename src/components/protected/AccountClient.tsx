"use client";

import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import SignOutButton from "@/components/auth/SignOutButton";

export const AccountClient = () => {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session?.user) return null;

  const { user } = session;

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-2">
        <h2 className="text-2xl font-semibold">Mi perfil</h2>
        <div className="text-sm text-muted-foreground">ID: {user.id}</div>
        <div className="text-base">Nombre: {user.name || "—"}</div>
        <div className="text-base">Email: {user.email}</div>
      </Card>

      <SignOutButton />
    </div>
  );
};

export default AccountClient;