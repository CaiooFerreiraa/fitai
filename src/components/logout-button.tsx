"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#121214] border-2 border-black hover:border-[#ff0033]/60 cursor-pointer transition-all shadow-[3px_3px_0_0_#000]"
    >
      <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400" strokeWidth={3} />
    </Button>
  )
}