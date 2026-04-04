"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: "flex items-start gap-3 bg-[#121214] border-4 border-black text-white font-black uppercase italic tracking-tight shadow-[8px_8px_0_0_#000] rounded-2xl px-5 py-4 text-sm w-full",
            title: "text-white font-black uppercase italic tracking-tight text-sm leading-tight",
            description: "text-neutral-500 font-black uppercase italic text-xs tracking-tight leading-tight mt-1",
            success: "border-l-4 border-l-[#ff0033]",
            error: "border-l-4 border-l-[#ff0033] bg-[#1a0000]",
            warning: "border-l-4 border-l-yellow-500",
            info: "border-l-4 border-l-neutral-500",
            actionButton: "bg-[#ff0033] text-white font-black uppercase italic text-xs px-4 py-2 rounded-xl border-2 border-black cursor-pointer hover:bg-[#ff1100] transition-colors shadow-[4px_4px_0_0_#000] mt-3",
            cancelButton: "bg-[#1c1c1f] text-neutral-400 font-black uppercase italic text-xs px-4 py-2 rounded-xl border-2 border-black cursor-pointer hover:text-white transition-colors mt-3",
          }
        }}
      />
    </NextAuthSessionProvider>
  )
}