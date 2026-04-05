import prisma from "@/infrastructure/database/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { WorkoutSession } from "@/components/workout-session"
import { ArrowLeft, Target, ShieldCheck, Activity, Zap, Sparkles } from "lucide-react"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect("/login")

  const plan = await prisma.workoutPlan.findUnique({
    where: { id },
    include: { exercises: { orderBy: { order: "asc" } } }
  })

  if (!plan) redirect("/")

  return (
    <div className="min-h-dvh bg-[#0a0a0b] text-white font-sans noise-overlay">

      {/* ── Red Aura ── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute top-1/4 -left-1/4 w-[80vw] h-[80vw] bg-[#ff0033] opacity-[0.04] blur-[200px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-[#ff0033] opacity-[0.02] blur-[150px] rounded-full translate-x-1/4 translate-y-1/4" />
      </div>

      {/* ── Watermark ── */}
      <div className="bg-watermark" aria-hidden>TRAIN</div>

      {/* ── Progress Line Left ── */}
      <div className="fixed top-0 left-0 w-1 h-full bg-[#ff0033]/10 z-50 hidden lg:block">
        <div className="w-full h-[30%] bg-gradient-to-b from-[#ff0033] to-transparent shadow-[0_0_15px_#ff0033]" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-20 sticky top-0 bg-[#0a0a0b]/80 backdrop-blur-2xl border-b-2 border-black/50 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 lg:px-10 h-12 sm:h-14 lg:h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-neutral-600 group-hover:text-[#ff0033] group-hover:-translate-x-1 transition-all" strokeWidth={3} />
            <span className="text-sm font-black uppercase tracking-[0.3em] italic text-neutral-500 group-hover:text-white transition-colors">VOLTAR À BASE</span>
          </Link>

          {/* Live indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-2 h-2 rounded-full bg-[#ff0033] animate-ping shadow-[0_0_8px_#ff0033]" />
            <span className="text-[10px] font-black text-[#ff0033] uppercase tracking-[0.4em] italic hidden sm:inline">
              LIVE TRAINING // ACTIVE
            </span>
            {/* Plan badge */}
            <div className="bg-[#1c1c1f] border-4 border-black rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 flex items-center gap-2 shadow-[4px_4px_0_0_#000]">
              <ShieldCheck className="w-4 h-4 text-[#ff0033]" strokeWidth={3} />
              <span className="text-[10px] font-black uppercase italic text-neutral-400 tracking-[0.2em]">{plan.dayOfWeek}</span>
            </div>
            <MobileNav />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-8 lg:px-10 pt-3 sm:pt-4 lg:pt-6 pb-20 lg:pb-6 space-y-4 sm:space-y-6 lg:space-y-8">

        {/* ── Title ── */}
        <div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter italic leading-none text-white">
            SESSÃO<br />
            <span className="text-[#ff0033]">BRUTAL.</span>
          </h1>
          <p className="text-[9px] sm:text-[10px] font-black text-neutral-700 uppercase tracking-[0.4em] italic mt-2">
            {plan.exercises.length} PROTOCOLOS CARREGADOS // {plan.dayOfWeek} CORPS
          </p>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10 items-start">

          {/* ── Session Component ── */}
          <div className="lg:col-span-3 order-1">
            <WorkoutSession exercises={plan.exercises} planId={plan.id} />
          </div>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-2 flex flex-col gap-6 lg:sticky lg:top-28 order-2">

            {/* Mindset AI Card */}
            <div className="bg-[#121214] border-4 border-black p-8 md:p-10 rounded-[2rem] shadow-[10px_10px_0_0_#000] relative overflow-hidden group hover:border-[#ff0033]/30 transition-all">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,0,51,0.04),transparent_60%)] pointer-events-none" />
              <div className="absolute -top-12 -right-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:rotate-12 pointer-events-none">
                <Target className="w-64 h-64 text-[#ff0033]" strokeWidth={2} />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#ff0033] flex items-center justify-center rounded-2xl border-4 border-black shadow-[0_10px_20px_-5px_rgba(255,0,51,0.5)] group-hover:scale-110 transition-transform">
                    <Zap className="w-7 h-7 text-white" strokeWidth={4} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] italic">COMANDANTE IA</p>
                    <span className="font-black italic text-2xl uppercase tracking-tighter text-[#ff0033]">CHIEF COMMAND</span>
                  </div>
                </div>

                <h4 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-[0.95] text-neutral-400 group-hover:text-white transition-colors">
                  &ldquo;O FERRO É O ÚNICO TRIBUNAL QUE NÃO ACEITA SUBORNO. PAGUE COM SUOR.&rdquo;
                </h4>

                <p className="text-xs font-black text-neutral-600 uppercase tracking-[0.3em] italic leading-relaxed">
                  CADA REPETIÇÃO É UM VOTO CONTRA A MEDIOCRIDADE.
                </p>

                <div className="pt-5 border-t-4 border-black flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#ff0033] animate-pulse shadow-[0_0_10px_#ff0033]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-700 italic">MINDSET DE ELITE ATIVO</span>
                </div>
              </div>
            </div>

            {/* Metrics Card */}
            <div className="bg-[#121214] border-4 border-black p-8 md:p-10 rounded-[2rem] shadow-[10px_10px_0_0_#000] relative overflow-hidden group hover:border-[#ff0033]/20 transition-all">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#ff0033] to-transparent opacity-20" />

              <div className="flex items-center gap-4 mb-10">
                <div className="bg-black/60 p-3 rounded-2xl border-2 border-[#1c1c1f]">
                  <Activity className="w-6 h-6 text-[#ff0033]" strokeWidth={4} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 italic">MÉTRICAS DE MISSÃO</span>
              </div>

              <div className="space-y-8 relative z-10">
                <div className="flex flex-col border-l-4 border-[#ff0033] pl-6 group-hover:translate-x-2 transition-transform duration-500">
                  <span className="text-neutral-700 text-[10px] font-black uppercase italic tracking-[0.4em] mb-2">JANELA DE EXECUÇÃO</span>
                  <span className="text-5xl md:text-6xl font-black italic tracking-tighter text-white">
                    45:00 <span className="text-sm text-neutral-800 uppercase">MIN</span>
                  </span>
                </div>
                <div className="flex flex-col border-l-4 border-[#1c1c1f] group-hover:border-[#ff0033] pl-6 group-hover:translate-x-2 transition-all duration-700">
                  <span className="text-neutral-700 text-[10px] font-black uppercase italic tracking-[0.4em] mb-2">FOCO OPERACIONAL</span>
                  <span className="text-4xl md:text-5xl font-black italic tracking-tighter text-white leading-none">
                    FORÇA<br /><span className="text-sm md:text-base text-[#ff0033] uppercase tracking-[0.4em]">ELITE TÁTICA</span>
                  </span>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <div className="px-5 py-2.5 bg-black/50 rounded-2xl border-2 border-[#1c1c1f] flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-[#ff0033] animate-pulse" strokeWidth={4} />
                  <span className="text-[10px] font-black italic tracking-[0.3em] text-neutral-600 uppercase">CALCULADO POR IA V2.1</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
