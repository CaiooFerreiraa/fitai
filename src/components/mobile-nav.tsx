"use client"

import { Menu, X, Home, Settings, User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { SiteIcon } from "@/components/ui/site-icon"
import { History as HistoryIcon } from "lucide-react"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/config", label: "Treinos", icon: Settings },
    { href: "/profile", label: "Perfil", icon: User },
    { href: "/history", label: "Histórico", icon: HistoryIcon },
  ]

  if (!mounted) return (
    <button className="lg:hidden bg-[#ff0033] text-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0_#000] opacity-50 cursor-not-allowed">
      <Menu size={18} strokeWidth={4} />
    </button>
  )

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden bg-[#ff0033] text-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0_#000] cursor-pointer"
        aria-label="Menu"
      >
        <Menu size={18} strokeWidth={4} />
      </button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop Animado */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[9998] bg-black/90 backdrop-blur-md"
              />

              {/* Menu Lateral Animado */}
              <motion.nav
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 z-[9999] w-[80%] max-w-[300px] h-screen bg-[#0a0a0b] border-l-4 border-black p-6 flex flex-col gap-4 shadow-[-20px_0_50px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <SiteIcon className="w-10 h-10" />
                    <span className="text-[10px] font-black italic tracking-[0.4em] text-white/90 uppercase border-l-2 border-black pl-3 ml-1">MENU<br/>TÁTICO</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bg-[#ff0033] text-white p-2 border-2 border-black rounded-lg shadow-[3px_3px_0_0_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <X size={18} strokeWidth={4} />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center gap-4 p-4 rounded-xl border-2 border-black font-black uppercase italic text-[11px] tracking-widest transition-all
                          ${isActive
                            ? "bg-[#ff0033] text-white"
                            : "bg-[#121214] text-neutral-500 hover:text-white"}
                          shadow-[4px_4px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                        `}
                      >
                        <Icon size={18} strokeWidth={3} className={isActive ? "text-white" : "text-[#ff0033]"} />
                        {link.label}
                      </Link>
                    )
                  })}
                </div>

                <div className="mt-auto">
                  <div className="bg-[#121214] border-2 border-black rounded-xl p-4 shadow-[4px_4px_0_0_#000]">
                    <div className="w-10 h-1.5 bg-[#ff0033] mb-3" />
                    <span className="block text-[8px] font-black text-neutral-700 uppercase tracking-[0.4em] italic mb-1">CENTRAL DE COMANDO</span>
                    <span className="block text-[10px] font-black text-white italic tracking-tighter">FITAI V.01 GLOBAL</span>
                  </div>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
