"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerAction } from "@/actions/auth-actions"
import { Lock, User, Dumbbell, Sparkles, ArrowRight, Loader2, AlertCircle, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full h-16 sm:h-18 bg-white hover:bg-neutral-100 text-black rounded-2xl font-black text-lg sm:text-xl uppercase italic tracking-tighter cursor-pointer transition-all active:scale-[0.98] shadow-[6px_6px_0_0_#000000] border-2 border-black disabled:opacity-40 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-[#ff0033]/5 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      {pending ? (
        <span className="flex items-center gap-3 justify-center relative z-10">
          <Loader2 className="w-5 h-5 animate-spin" strokeWidth={4} /> PROCESSANDO...
        </span>
      ) : (
        <span className="flex items-center justify-between w-full px-6 relative z-10">
          <span>ALISTAR AGORA</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={4} />
        </span>
      )}
    </Button>
  )
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, undefined)

  return (
    <main className="min-h-dvh bg-[#0a0a0b] text-white font-sans relative overflow-hidden noise-overlay">

      {/* ── Watermark Background ── */}
      <div className="bg-watermark" aria-hidden>RECRUIT</div>

      {/* ── Red Aura Glow ── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute top-1/4 right-1/4 w-[60vw] h-[60vw] bg-[#ff0033] opacity-[0.04] blur-[180px] rounded-full" />
      </div>

      {/* ── Split Layout ── */}
      <div className="relative z-10 min-h-dvh grid grid-cols-1 lg:grid-cols-2">

        {/* ── LEFT: Manifesto ── */}
        <div className="hidden lg:flex flex-col justify-between p-12 xl:p-20">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="bg-[#ff0033] p-3 rounded-2xl border-4 border-black shadow-[6px_6px_0_0_#000]">
              <Dumbbell className="w-7 h-7 text-white" strokeWidth={3} />
            </div>
            <span className="text-2xl font-black italic tracking-tighter uppercase">
              FIT<span className="text-[#ff0033]">AI</span>
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div
                className="w-1.5 bg-[#ff0033] rounded-full mt-3 animate-pulse shadow-[0_0_20px_#ff0033]"
                style={{ height: "7rem" }}
              />
              <h1 className="text-6xl xl:text-8xl 2xl:text-[7rem] font-black uppercase italic leading-[0.82] tracking-tighter text-white drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
                RECLUTA<br />
                <span className="text-[#ff0033]">V.01.</span>
              </h1>
            </div>
            <p className="text-neutral-500 font-black uppercase text-sm xl:text-base tracking-[0.1em] leading-relaxed max-w-sm border-l-4 border-black pl-5 italic">
              INICIE SEU PROCESSO DE METAMORFOSE AGORA. AO SE REGISTRAR, VOCÊ ACEITA QUE NÃO HÁ VOLTA.
            </p>
          </div>

          {/* Status Bar Left */}
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 italic">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff0033] shadow-[0_0_8px_#ff0033] animate-ping" />
              [ RECRUTAMENTO: ABERTO ]
            </span>
            <span>[ SLOTS: LIMITADOS ]</span>
          </div>
        </div>

        {/* ── RIGHT: Form Panel ── */}
        <div className="flex flex-col items-center justify-center p-5 sm:p-8 lg:p-12 xl:p-16 bg-[#0a0a0b] lg:bg-[#0d0d0f] lg:border-l-4 lg:border-black">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-5xl sm:text-6xl font-black italic tracking-tighter uppercase">
              FIT<span className="text-[#ff0033]">AI</span>
            </h1>
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] italic mt-2">SOLICITAÇÃO DE ALISTAMENTO.</p>
          </div>

          <div className="w-full max-w-sm sm:max-w-md space-y-8">

            {/* Heading */}
            <div className="space-y-1">
              <h2 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none">
                REGISTRO<span className="text-[#ff0033]">.</span>
              </h2>
              <p className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em] italic">
                SOLICITAR ALISTAMENTO.
              </p>
            </div>

            {/* Error */}
            {state?.error && (
              <div className="bg-[#ff0033]/10 border-2 border-[#ff0033] rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-[#ff0033] shrink-0 mt-0.5" strokeWidth={3} />
                <p className="text-sm font-black uppercase italic tracking-tight text-white leading-tight">{state.error}</p>
              </div>
            )}

            {/* Form */}
            <form action={formAction} className="space-y-5">

              {/* Nome */}
              <div className="space-y-2 group">
                <Label htmlFor="name" className="flex items-center gap-2 text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] italic group-focus-within:text-[#ff0033] transition-colors">
                  <Sparkles className="w-3 h-3" strokeWidth={4} />
                  [ 01 ] NOME DE GUERRA
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="RECRUTA SEM NOME"
                  className="h-14 sm:h-16 bg-[#0a0a0b] lg:bg-[#09090b] border-2 border-[#1c1c1f] focus:border-[#ff0033] text-sm sm:text-base font-bold uppercase rounded-2xl px-5 cursor-text transition-all placeholder:text-neutral-800 text-white focus:ring-0 focus-visible:ring-0 italic"
                />
              </div>

              {/* Email */}
              <div className="space-y-2 group">
                <Label htmlFor="email" className="flex items-center gap-2 text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] italic group-focus-within:text-[#ff0033] transition-colors">
                  <User className="w-3 h-3" strokeWidth={4} />
                  [ 02 ] EMAIL
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
                <Label htmlFor="pass" className="flex items-center gap-2 text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] italic group-focus-within:text-[#ff0033] transition-colors">
                  <Lock className="w-3 h-3" strokeWidth={4} />
                  [ 03 ] SENHA
                </Label>
                <Input
                  id="pass"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••••"
                  className="h-14 sm:h-16 bg-[#0a0a0b] lg:bg-[#09090b] border-2 border-[#1c1c1f] focus:border-[#ff0033] text-2xl font-bold tracking-[0.3em] rounded-2xl px-5 cursor-text transition-all placeholder:text-neutral-800 text-white focus:ring-0 focus-visible:ring-0"
                />
              </div>

              {/* Data de Nascimento */}
              <div className="space-y-2 group">
                <Label htmlFor="dateOfBirth" className="flex items-center gap-2 text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] italic group-focus-within:text-[#ff0033] transition-colors">
                  <Calendar className="w-3 h-3" strokeWidth={4} />
                  [ 04 ] DATA DE NASCIMENTO
                </Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="h-14 sm:h-16 bg-[#0a0a0b] lg:bg-[#09090b] border-2 border-[#1c1c1f] focus:border-[#ff0033] text-sm sm:text-base font-bold uppercase rounded-2xl px-5 cursor-text transition-all text-white focus:ring-0 focus-visible:ring-0"
                />
              </div>

              {/* Sexo */}
              <div className="space-y-2 group">
                <Label htmlFor="gender" className="flex items-center gap-2 text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] italic group-focus-within:text-[#ff0033] transition-colors">
                  <Users className="w-3 h-3" strokeWidth={4} />
                  [ 05 ] SEXO
                </Label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="h-14 sm:h-16 w-full bg-[#0a0a0b] lg:bg-[#09090b] border-2 border-[#1c1c1f] focus:border-[#ff0033] text-sm sm:text-base font-bold uppercase rounded-2xl px-5 cursor-pointer transition-all text-white focus:ring-0 focus-visible:ring-0 italic"
                >
                  <option value="">SELECIONE</option>
                  <option value="masculino">MASCULINO</option>
                  <option value="feminino">FEMININO</option>
                  <option value="outro">OUTRO</option>
                </select>
              </div>

              {/* Tempo de Treino */}
              <div className="space-y-2 group">
                <Label htmlFor="trainingTime" className="flex items-center gap-2 text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] italic group-focus-within:text-[#ff0033] transition-colors">
                  <Dumbbell className="w-3 h-3" strokeWidth={4} />
                  [ 06 ] TEMPO DE TREINO
                </Label>
                <select
                  id="trainingTime"
                  name="trainingTime"
                  required
                  className="h-14 sm:h-16 w-full bg-[#0a0a0b] lg:bg-[#09090b] border-2 border-[#1c1c1f] focus:border-[#ff0033] text-sm sm:text-base font-bold uppercase rounded-2xl px-5 cursor-pointer transition-all text-white focus:ring-0 focus-visible:ring-0 italic"
                >
                  <option value="">SELECIONE</option>
                  <option value="sedentario">SEDENTÁRIO</option>
                  <option value="menos_1_ano">MENOS DE 1 ANO</option>
                  <option value="1_3_anos">1-3 ANOS</option>
                  <option value="mais_3_anos">MAIS DE 3 ANOS</option>
                </select>
              </div>

              <div className="pt-2">
                <SubmitButton />
              </div>
            </form>

            {/* Login link */}
            <div className="text-center space-y-2 pt-2">
              <p className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.3em] italic">
                [ JÁ TEM ACESSO? ]
              </p>
              <Link
                href="/login"
                className="block text-sm font-black uppercase italic tracking-widest text-white hover:text-[#ff0033] transition-colors underline underline-offset-4 decoration-neutral-800 hover:decoration-[#ff0033]"
              >
                ENTRAR NA BASE
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ── Status Bottom Bar ── */}
      <div className="status-bar">
        <div className="dot" />
        <span>[ RECRUTAMENTO: ATIVO ]</span>
        <span>[ SISTEMA: ONLINE ]</span>
      </div>
    </main>
  )
}
