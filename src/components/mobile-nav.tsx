"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Home, Settings, User, Menu, X } from "lucide-react"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = typeof window !== "undefined" ? window.location.pathname : ""

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/config", label: "Config", icon: Settings },
    { href: "/profile", label: "Perfil", icon: User },
  ]

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden bg-[#ff0033] text-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0_#000]"
        aria-label="Menu"
      >
        <Menu size={18} strokeWidth={4} />
      </button>

      {isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
          <div onClick={() => setIsOpen(false)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.95)" }} />
          <nav style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "260px", backgroundColor: "#0a0a0b", borderLeft: "4px solid #000", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <button onClick={() => setIsOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", backgroundColor: "#ff0033", border: "2px solid #000", borderRadius: "8px", padding: "6px", color: "white", cursor: "pointer" }}>
              <X size={18} strokeWidth={4} />
            </button>
            <div style={{ height: "40px" }} />
            {links.map(link => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "10px", border: "3px solid #000", backgroundColor: isActive ? "#ff0033" : "#121214", color: isActive ? "white" : "#999", textDecoration: "none", fontWeight: 900, fontSize: "13px", textTransform: "uppercase", fontStyle: "italic" }}>
                  <Icon size={18} strokeWidth={3} />
                  {link.label}
                </Link>
              )
            })}
            <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "2px solid #1c1c1f", fontSize: "8px", color: "#555", textTransform: "uppercase", letterSpacing: "0.2em" }}>
              FITAI v1.0
            </div>
          </nav>
        </div>
      )}
    </>
  )
}