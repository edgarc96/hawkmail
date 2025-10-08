"use client";

import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const SignOutButton = () => {
  const { refetch } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    });
    if (error?.code) {
      toast.error(error.code);
      return;
    }
    localStorage.removeItem("bearer_token");
    toast.success("Sesión cerrada");
    refetch();
    router.push("/");
  };

  return (
    <Button variant="outline" onClick={handleSignOut} className="h-auto py-2">
      Cerrar sesión
    </Button>
  );
};

export default SignOutButton;