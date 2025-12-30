"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Loader2,
  Menu,
  X,
  Mail
} from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Mail, label: "Tickets", href: "/tickets" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: Users, label: "Team", href: "/team" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  // Mostrar loading mientras verifica la sesión
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Si no hay sesión, no mostrar nada (el useEffect redirigirá)
  if (!session) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-[#0a0a0f] text-[#e4e4e7] flex">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar border border-sidebar-border rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:sticky
          top-0
          left-0
          z-40
          w-20 
          bg-sidebar 
          border-r 
          border-sidebar-border 
          flex 
          flex-col 
          items-center 
          gap-4 
          py-8 
          h-screen 
          backdrop-blur-sm
          transition-transform
          duration-300
        `}>
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
          </div>

          {/* Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      p-3 
                      rounded-xl 
                      transition-all 
                      duration-200 
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    <Icon size={24} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Logout Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <LogOut size={24} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
