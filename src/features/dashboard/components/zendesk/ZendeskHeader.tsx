import { useState, ReactNode } from "react";
import Image from "next/image";
import { Moon, ChevronDown, Info, LogOutIcon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  userName?: string | null;
  userEmail?: string | null;
  onAddMailbox?: () => void;
  onSignOut?: () => void;
  onOpenBilling?: () => void;
  trialEndsAtLabel?: string | null;
  logoSrc?: string;
  themeToggleSlot?: ReactNode;
  extraActions?: ReactNode;
  onOpenMenu?: () => void;
}

export function ZendeskHeader({
  userName,
  userEmail,
  onAddMailbox,
  onSignOut,
  onOpenBilling,
  trialEndsAtLabel = "2 semanas restantes",
  logoSrc = "/hawkmail-logo.svg",
  themeToggleSlot,
  extraActions,
  onOpenMenu,
}: HeaderProps) {
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const initials =
    userName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0])
      .join("")
      .toUpperCase() || "EC";

  return (
    <header className="w-full h-16 bg-[#141414] px-6 md:px-8 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-3">
        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            className="lg:hidden p-2 rounded-md bg-white/5 text-white hover:bg-white/10 transition-colors"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Image
          src={logoSrc}
          alt="HawkMail logo"
          width={132}
          height={28}
          priority
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center text-sm text-[#E4E4E7]">
          <span>
            Trial termina: {trialEndsAtLabel ?? "por definir"} –
          </span>
          <button
            type="button"
            onClick={onOpenBilling}
            className="ml-1 text-[#7B5CFF] hover:underline transition-all duration-200"
          >
            Actualizar plan
          </button>
        </div>

        <button
          type="button"
          className="md:hidden p-2 hover:bg-white/5 rounded-md transition-colors duration-200"
        >
          <Info className="w-5 h-5 text-[#7B5CFF]" />
        </button>

        {extraActions && (
          <div className="flex items-center gap-2">{extraActions}</div>
        )}

        {themeToggleSlot ?? (
          <button
            type="button"
            className="p-2 hover:bg-white/5 rounded-md transition-colors duration-200"
            aria-label="Change theme"
          >
            <Moon className="w-5 h-5 text-[#E4E4E7]" />
          </button>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsToolsOpen((value) => !value)}
            className="flex items-center gap-1 px-3 py-2 hover:bg-white/5 rounded-md transition-colors duration-200 text-sm text-[#E4E4E7]"
          >
            Herramientas
            <ChevronDown className="w-4 h-4" />
          </button>
          {isToolsOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#1A1A1A] border border-white/10 rounded-md shadow-lg py-2 z-50">
              <button className="w-full px-4 py-2 text-left text-sm text-[#E4E4E7] hover:bg-white/5 transition-colors duration-200">
                Exportar datos
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-[#E4E4E7] hover:bg-white/5 transition-colors duration-200">
                Ajustes
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-[#E4E4E7] hover:bg-white/5 transition-colors duration-200">
                Documentación
              </button>
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-[#E4E4E7] gap-2"
            onClick={onSignOut}
          >
            <LogOutIcon className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-[#7B5CFF] flex items-center justify-center text-white text-sm">
            {initials}
          </div>
          <span className="hidden lg:block text-sm text-[#E4E4E7]">
            {userName ?? "edgar cabrera"}
          </span>
        </button>

        <Button
          onClick={onAddMailbox}
          className="px-4 py-2 bg-[#7B5CFF] hover:bg-[#6B4AFB] text-white rounded-md transition-colors duration-200"
        >
          Añadir casillas
        </Button>
      </div>
    </header>
  );
}
