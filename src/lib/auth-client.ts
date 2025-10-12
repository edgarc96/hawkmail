"use client"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
   baseURL: typeof window !== 'undefined'
      ? `${window.location.origin}/api/auth`
      : (
        process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth`
          : (process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth` : undefined)
      ),
});

export const useSession = authClient.useSession;
