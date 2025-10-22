"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "oklch(0.21 0.018 40)",
          "--normal-text": "oklch(0.97 0.008 55)",
          "--normal-border": "oklch(0.30 0.025 40 / 40%)",
          "--success-bg": "oklch(0.21 0.048 142)",
          "--success-text": "oklch(0.97 0.008 55)",
          "--success-border": "oklch(0.30 0.055 142 / 40%)",
          "--error-bg": "oklch(0.21 0.064 12)",
          "--error-text": "oklch(0.97 0.008 55)",
          "--error-border": "oklch(0.30 0.075 12 / 40%)",
          "--warning-bg": "oklch(0.21 0.064 48)",
          "--warning-text": "oklch(0.97 0.008 55)",
          "--warning-border": "oklch(0.30 0.075 48 / 40%)",
          "--info-bg": "oklch(0.21 0.048 220)",
          "--info-text": "oklch(0.97 0.008 55)",
          "--info-border": "oklch(0.30 0.055 220 / 40%)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
