"use client";

import React from "react";
import { TooltipProvider as BaseTooltipProvider } from "./tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  delayDuration?: number;
}

export function TooltipWrapper({ children, delayDuration = 300 }: TooltipWrapperProps) {
  return (
    <BaseTooltipProvider delayDuration={delayDuration}>
      {children}
    </BaseTooltipProvider>
  );
}