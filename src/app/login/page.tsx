"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, User, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { SiteIcon } from "@/components/ui/site-icon"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("CREDENCIAIS REJEITADAS. ACESSO NEGADO À BASE.")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch {
      setError("FALHA CRÍTICA NA AUTENTICAÇÃO.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="min-h-dvh bg-[#0a0a0b] text-white font-sans relative overflow-hidden noise-overlay">

      {/* ── Watermark Background ── */}
      <div className="bg-watermark" aria-hidden>LEVANTES</div>

      {/* ── Red Aura Glow ── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute top-1/3 left-1/4 w-[60vw] h-[60vw] bg-[#ff0033] opacity-[0.04] blur-[180px] rounded-full" />
      </div>

      {/* ── Split Layout ── */}
      <div className="relative z-10 min-h-dvh grid grid-cols-1 lg:grid-cols-2">

        {/* ── LEFT: Manifesto ── */}
        <div className="hidden lg:flex flex-col justify-between p-12 xl:p-20">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <SiteIcon className="w-10 h-10 sm:w-12 sm:h-12" />
            <span className="text-2xl font-black italic tracking-tighter uppercase">
              FIT<span className="text-[#ff0033]">AI</span>
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-1.5 bg-[#ff0033] rounded-full mt-3 shadow-[0_0_20px_#ff0033]" style={{ height: "7rem" }} />
              <h1 className="text-6xl xl:text-8xl 2xl:text-[7rem] font-black uppercase italic leading-[0.82] tracking-tighter text-white drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
                A DOR PASSA.<br />
                O SHAPE<br />
                <span className="text-[#ff0033]">FICA.</span>
              </h1>
            </div>
            <p className="text-neutral-500 font-black uppercase text-sm xl:text-base tracking-[0.1em] leading-relaxed max-w-sm border-l-4 border-black pl-5 italic">
              ENTRE NO QUARTEL GENERAL DO SEU RESULTADO. AQUI IA NÃO ALISA, ELA COBRA.
            </p>
          </div>

          {/* Status Bar Left */}
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 italic">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff0033] shadow-[0_0_8px_#ff0033] animate-pulse" />
              [ SYSTEM: ACTIVE ]
            </span>
            <span>[ AI COACH: RUTHLESS ]</span>
          </div>
        </div>

        {/* ── RIGHT: Form Panel ── */}
        <div className="flex flex-col items-center justify-center p-5 sm:p-8 lg:p-12 xl:p-16 bg-[#0a0a0b] lg:bg-[#0d0d0f] lg:border-l-4 lg:border-black pb-28 sm:pb-10">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-5xl sm:text-6xl font-black italic tracking-tighter uppercase">
              FIT<span className="text-[#ff0033]">AI</span>
            </h1>
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] italic mt-2">BATA O PONTO, ATLETA.</p>
          </div>

          <div className="w-full max-w-sm sm:max-w-md space-y-8">

            {/* Heading */}
            <div className="space-y-1">
              <h2 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none">
                LOGIN<span className="text-[#ff0033]">.</span>
              </h2>
              <p className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em] italic">
                BATA O PONTO, ATLETA.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-[#ff0033]/10 border-2 border-[#ff0033] rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-[#ff0033] shrink-0 mt-0.5" strokeWidth={3} />
                <p className="text-sm font-black uppercase italic tracking-tight text-white leading-tight">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div className="space-y-2 group">
                <Label htmlFor="email" className="flex items-center gap-2 text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] italic group-focus-within:text-[#ff0033] transition-colors">
                  <User className="w-3 h-3" strokeWidth={4} />
                  [ 01 ] EMAIL
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="voce@base.tactical"
                  className="h-14 sm:h-16 bg-[#0a0a0b] lg:bg-[#09090b] border-2 border-[#1c1c1f] focus:border-[#ff0033] text-sm sm:text-base font-bold rounded-2xl px-5 cursor-text transition-all placeholder:text-neutral-800 text-white focus:ring-0 focus-visible:ring-0"
                />
              </div>

              {/* Password */}
              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pass" className="flex items-center gap-2 text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] italic group-focus-within:text-[#ff0033] transition-colors">
                    <Lock className="w-3 h-3" strokeWidth={4} />
                    [ 02 ] SENHA
                  </Label>
                  <span className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.3em] italic cursor-pointer hover:text-[#ff0033] transition-colors">ESQUECI</span>
                </div>
                <Input
                  id="pass"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••••"
                  className="h-14 sm:h-16 bg-[#0a0a0b] lg:bg-[#09090b] border-2 border-[#1c1c1f] focus:border-[#ff0033] text-2xl font-bold tracking-[0.3em] rounded-2xl px-5 cursor-text transition-all placeholder:text-neutral-800 text-white focus:ring-0 focus-visible:ring-0"
                />
              </div>

              {/* CTA — WHITE/BLACK (fiel ao design de referência) */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full h-16 sm:h-18 bg-white hover:bg-neutral-100 text-black rounded-2xl font-black text-lg sm:text-xl uppercase italic tracking-tighter cursor-pointer transition-all active:scale-[0.98] shadow-[6px_6px_0_0_#000000] border-2 border-black disabled:opacity-40 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-[#ff0033]/5 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  {pending ? (
                    <span className="flex items-center gap-3 justify-center relative z-10">
                      <Loader2 className="w-5 h-5 animate-spin" strokeWidth={4} /> ACESSANDO...
                    </span>
                  ) : (
                    <span className="flex items-center justify-between w-full px-6 relative z-10">
                      <span>DESTRUIR O TREINO</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={4} />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            {/* Register link */}
            <div className="text-center space-y-2 pt-2 sm:relative sm:block fixed bottom-12 sm:bottom-0 left-0 right-0 bg-[#0a0a0b]/95 backdrop-blur-xl border-t-2 border-black p-4 sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:border-t-0 z-50">
              <p className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.3em] italic">
                [ AINDA FRANGO? ]
              </p>
              <Link
                href="/register"
                className="block text-sm font-black uppercase italic tracking-widest text-white hover:text-[#ff0033] transition-colors underline underline-offset-4 decoration-neutral-800 hover:decoration-[#ff0033]"
              >
                REGISTRAR-SE E CRESCER
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ── Status Bottom Bar ── */}
      <div className="status-bar">
        <div className="dot" />
        <span>[ SYSTEM: ACTIVE ]</span>
        <span>[ AI COACH: RUTHLESS ]</span>
      </div>
    </main>
  )
}
