"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getMyWorkoutPlans } from "@/actions/config-actions"
import { WorkoutPlan, DayOfWeek, Exercise } from "@/domain/entities/workout"
import { logExerciseAction, getLatestLogAction } from "@/actions/workout-actions"
import { Button } from "@/components/ui/button"
import { NumberInput } from "@/components/ui/number-input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Loader2, Settings,
  User, Zap, Trophy, Check, X, BookOpen, Clock, Play
} from "lucide-react"
import { SiteIcon } from "@/components/ui/site-icon"
import Link from "next/link"
import { getAiSlogansAction } from "@/actions/workout-actions"
import { MobileNav } from "@/components/mobile-nav"
import { LogoutButton } from "@/components/logout-button"
import { cn } from "@/lib/utils"

interface ActiveSessionInfo {
  planId: string
  planName: string
  currentIdx: number
  totalExercises: number
}

function getActiveSession(plans: WorkoutPlan[]): ActiveSessionInfo | null {
  try {
    for (const plan of plans) {
      if (!plan.id) continue
      const key = `fitai_session_${plan.id}`
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      if (Date.now() - parsed.startedAt > 6 * 60 * 60 * 1000) {
        localStorage.removeItem(key)
        continue
      }
      if (parsed.currentIdx < plan.exercises.length) {
        if (!plan.id) continue
        return {
          planId: plan.id,
          planName: plan.name ?? plan.dayOfWeek ?? "PROTOCOLO",
          currentIdx: parsed.currentIdx,
          totalExercises: plan.exercises.length
        }
      }
    }
  } catch {
    // ignore
  }
  return null
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY:    "SEG",
  TUESDAY:   "TER",
  WEDNESDAY: "QUA",
  THURSDAY:  "QUI",
  FRIDAY:    "SEX",
  SATURDAY:  "SAB",
  SUNDAY:    "DOM",
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null)
  const [activeSession, setActiveSession] = useState<ActiveSessionInfo | null>(null)
  
  const [loggingExercise, setLoggingExercise] = useState<Exercise | null>(null)
  const [quickWeight, setQuickWeight] = useState(0)
  const [quickReps, setQuickReps] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slogans, setSlogans] = useState<Record<string, string>>({
    home_subtitle: "ODIE A MEDIOCRIDADE. O PROTOCOLO FOI CARREGADO.",
    home_workout_day: "PROTOCOLO ATIVO"
  })

  // Hydration-safe date handling
  const [activeDay, setActiveDay] = useState<DayOfWeek | null>(null)
  const [todayStr, setTodayStr] = useState<DayOfWeek | null>(null)

  useEffect(() => {
    const today = new Date()
    const currentDayStr = Object.keys(DAY_LABELS)[(today.getDay() + 6) % 7] as DayOfWeek
    setTodayStr(currentDayStr)
    setActiveDay(selectedDay || currentDayStr)
  }, [selectedDay])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (session) {
      getMyWorkoutPlans().then((res: WorkoutPlan[]) => {
        setPlans(res)
        setLoading(false)
        // Detect active sessions after plans are loaded
        const session_info = getActiveSession(res)
        setActiveSession(session_info)
      })
      getAiSlogansAction(["home_subtitle", "home_workout_day"]).then(setSlogans)
    }
  }, [session, status, router])

  if (status === "loading" || (session && loading)) {
    return (
      <div className="min-h-dvh bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-black/30 rounded-full" />
            <Loader2 className="animate-spin text-[#ff0033] w-16 h-16 absolute inset-0 drop-shadow-[0_0_15px_rgba(255,0,51,0.5)]" strokeWidth={4} />
          </div>
          <span className="text-sm font-black italic tracking-[0.4em] text-neutral-800 uppercase animate-pulse">CARREGANDO BASE...</span>
        </div>
      </div>
    )
  }

  if (!session) return null


  const currentDisplayDay = activeDay || "MONDAY" // Fallback for SSR
  const currentTodayStr = todayStr || "MONDAY"
  const activePlan = plans.find(p => p.dayOfWeek === activeDay)
  const firstName = session.user?.name?.split(" ")[0] || "RECRUTA"

  const handleQuickLog = async () => {
    if (!loggingExercise || isSubmitting) return
    setIsSubmitting(true)
    try {
      await logExerciseAction({
        exerciseId: loggingExercise.id!,
        weight: quickWeight,
        reps: quickReps,
        sets: 1,
      })
      toast.success("REGISTRO TÁTICO CONCLUÍDO", {
        description: `${loggingExercise.name} · ${quickWeight}KG × ${quickReps} REPS.`,
      })
      setLoggingExercise(null)
    } catch {
      toast.error("FALHA NO REGISTRO", {
        description: "ERRO CRÍTICO NO LOG. TENTE NOVAMENTE.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0b] text-white font-sans selection:bg-[#ff0033] noise-overlay pb-20 lg:pb-6 lg:overflow-hidden">
      
      <header className="relative z-30 sticky top-0 bg-[#0a0a0b]/80 backdrop-blur-2xl border-b-2 border-black/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 lg:px-10 h-12 sm:h-14 lg:h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
            <SiteIcon className="w-7 h-7 sm:w-8 sm:h-8" showBackground={true} />
            <span className="text-base sm:text-lg md:text-xl font-black tracking-tighter uppercase italic">
              FIT<span className="text-[#ff0033]">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden md:flex items-center gap-2.5 bg-[#121214] border-2 border-black rounded-lg px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff0033] animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-500 italic">
                {firstName}
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <HeaderNavBtn href="/config"><Settings className="w-3.5 h-3.5" strokeWidth={3} /></HeaderNavBtn>
              <HeaderNavBtn href="/profile"><User className="w-3.5 h-3.5" strokeWidth={3} /></HeaderNavBtn>
            </div>
            <MobileNav />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 lg:px-10 pt-3 sm:pt-4 lg:pt-6 space-y-3 sm:space-y-4 lg:space-y-5">

        {/* ── Active Session Banner ── */}
        {activeSession && (
          <Link href={`/workout/${activeSession.planId}`} id="resume-session-banner" className="block">
            <div className="bg-[#ff0033]/10 border-2 border-[#ff0033]/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-[4px_4px_0_0_#000] hover:border-[#ff0033]/70 transition-all group animate-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-3">
                <div className="bg-[#ff0033] p-2 rounded-lg border-2 border-black shadow-[2px_2px_0_0_#000] shrink-0">
                  <Play size={14} className="text-white" strokeWidth={4} />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-[#ff0033] uppercase tracking-widest italic">SESSÃO EM ANDAMENTO</p>
                  <p className="text-xs sm:text-sm font-black italic uppercase tracking-tight text-white leading-none">
                    {activeSession.planName} · EX. {activeSession.currentIdx + 1}/{activeSession.totalExercises}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff0033] animate-ping" />
                <span className="text-[9px] font-black italic uppercase tracking-widest text-white hidden sm:inline">CONTINUAR</span>
              </div>
            </div>
          </Link>
        )}

        <section className="bg-[#121214] border-2 lg:border-2 border-black rounded-xl sm:rounded-2xl lg:rounded-2xl p-4 sm:p-5 lg:p-5 relative overflow-hidden group shadow-[6px_6px_0_0_#000]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,0,51,0.03),transparent_60%)] pointer-events-none" />

          <div className="relative z-10 space-y-1 sm:space-y-1.5">
            <div className="bg-[#ff0033]/10 border border-[#ff0033]/30 px-1.5 sm:px-2 py-0.5 rounded-full w-fit flex items-center gap-1 sm:gap-1.5">
              <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-[#ff0033] animate-ping" />
              <span className="text-[7px] sm:text-[8px] font-black text-[#ff0033] uppercase tracking-[0.3em] italic">CENTRAL DE COMANDO</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase italic tracking-tighter leading-none text-white">
              BEM-VINDO,<br />
              <span className="text-[#ff0033] uppercase">{firstName}.</span>
            </h2>
            <p className="text-neutral-700 font-black italic uppercase tracking-[0.1em] text-[9px] sm:text-[10px] leading-none mt-0.5 sm:mt-1">
              {slogans.home_subtitle}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-5">
          
          <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-4">
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
              {[...Object.keys(DAY_LABELS)].map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day as DayOfWeek)}
                  className={cn(
                    "relative flex-shrink-0 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer font-black uppercase italic text-[9px] sm:text-[10px] tracking-widest shadow-[3px_3px_0_0_#000]",
                    activeDay === day 
                      ? "bg-[#ff0033] border-black text-white" 
                      : "bg-[#121214] border-black text-neutral-600 hover:border-[#ff0033]/40"
                  )}
                >
                  {DAY_LABELS[day as DayOfWeek]}
                  {plans.some(p => p.dayOfWeek === day) && (
                    <div className={cn("inline-block w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full ml-0.5 sm:ml-1", activeDay === day ? "bg-white" : "bg-[#ff0033]")} />
                  )}
                </button>
              ))}
            </div>

            <div className="relative group">
              <Link href={activePlan ? `/workout/${activePlan.id}` : "/config"}>
                <div className="bg-gradient-to-br from-[#ff0033] to-[#9a0022] rounded-xl sm:rounded-2xl lg:rounded-2xl p-5 sm:p-6 lg:p-6 border-2 lg:border-2 border-black shadow-[6px_6px_0_0_#000] cursor-pointer transition-all active:translate-x-1 active:translate-y-1 active:shadow-none relative overflow-hidden group/btn">
                  <div className="absolute top-0 right-0 p-3 sm:p-4 lg:p-4 opacity-[0.1] group-hover/btn:scale-110 transition-transform">
                    <Zap className="w-16 h-16 sm:w-20 sm:h-20 lg:w-20 lg:h-20 text-white" strokeWidth={4} />
                  </div>
                  <div className="relative z-10 space-y-3 sm:space-y-4 lg:space-y-3">
                    <div>
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-white/40 italic">
                        {slogans.home_workout_day} {currentDisplayDay === currentTodayStr && "· HOJE"}
                      </span>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black italic uppercase tracking-tighter leading-none text-white mt-0.5 sm:mt-1">
                        {activePlan ? (
                          <>
                            {DAY_LABELS[currentDisplayDay]}<span className="text-white/30">.</span><br />
                            <span className="text-[9px] sm:text-[10px] lg:text-xs text-white/70 block mt-0.5 sm:mt-1 tracking-[0.2em]">{activePlan.name}</span>
                          </>
                        ) : (
                          <>SEM<br /><span className="text-white/60 text-sm sm:text-base">TREINO DEFINIDO.</span></>
                        )}
                      </h3>
                    </div>
                    <div className="inline-flex items-center justify-center w-full sm:w-auto h-9 sm:h-11 px-6 sm:px-10 border-2 border-black bg-white hover:bg-neutral-100 text-black font-black text-xs sm:text-sm tracking-widest shadow-[4px_4px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
                      {activePlan ? "INICIAR SESSÃO" : "MONTAR AGORA"}
                      <div className="ml-2 w-3 h-3 border-[3px] border-black border-t-transparent animate-spin opacity-0" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {activePlan && activePlan.exercises.length > 0 && (
              <div className="bg-[#121214] border-2 lg:border-2 border-black rounded-xl sm:rounded-2xl lg:rounded-2xl p-4 sm:p-5 lg:p-4 shadow-[6px_6px_0_0_#000] lg:hidden">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#ff0033] animate-pulse" />
                  <span className="text-[8px] sm:text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] italic">LOG DE CAMPO</span>
                </div>

                {loggingExercise ? (
                   <div className="bg-black/40 border-2 border-[#ff0033]/20 rounded-lg sm:rounded-xl p-3 sm:p-4 animate-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="font-black italic uppercase text-[#ff0033] text-[10px] sm:text-xs tracking-tighter">REGISTRO: {loggingExercise.name}</span>
                        <button onClick={() => setLoggingExercise(null)} className="text-neutral-700 hover:text-white transition-colors"><X size={16} className="sm:w-[18px] sm:h-[18px]"/></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="space-y-1">
                          <Label className="text-[7px] sm:text-[8px] font-black text-neutral-600 uppercase tracking-widest italic">CARGA (KG)</Label>
                          <NumberInput value={quickWeight} onChange={setQuickWeight} step={0.5} className="h-10 sm:h-11 text-base sm:text-lg italic bg-[#1c1c1f] border border-black rounded-lg text-center" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[7px] sm:text-[8px] font-black text-neutral-600 uppercase tracking-widest italic">REPS</Label>
                          <NumberInput value={quickReps} onChange={setQuickReps} min={1} className="h-10 sm:h-11 text-base sm:text-lg italic bg-[#1c1c1f] border border-black rounded-lg text-center" />
                        </div>
                      </div>
                      <Button 
                        onClick={handleQuickLog}
                        disabled={isSubmitting}
                        className="w-full h-10 sm:h-11 bg-[#ff0033] hover:bg-[#ff1100] text-white font-black italic uppercase tracking-wider text-[10px] sm:text-xs rounded-lg border border-black shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4" /> : "CONFIRMAR LOG"}
                      </Button>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activePlan.exercises.map((ex, i) => (
                      <button 
                        key={i} 
                        onClick={async () => {
                          setLoggingExercise(ex);
                          const lastLog = await getLatestLogAction(ex.id!);
                          if (lastLog) {
                            setQuickReps(lastLog.repsReached ?? ex.reps);
                            setQuickWeight(lastLog.weight ?? 0);
                          } else {
                            setQuickReps(ex.reps);
                            setQuickWeight(0);
                          }
                        }}
                        className="bg-black/60 border border-white/5 hover:border-[#ff0033]/40 p-2.5 sm:p-3 rounded-lg sm:rounded-xl flex items-center justify-between group transition-all text-left"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[6px] sm:text-[7px] font-black text-[#ff0033] uppercase tracking-[0.2em] opacity-40 italic">EQ{i+1}</span>
                          <h4 className="text-xs sm:text-sm font-black italic uppercase tracking-tight text-neutral-500 group-hover:text-white transition-colors">{ex.name}</h4>
                        </div>
                        <div className="bg-[#1c1c1f] p-1 sm:p-1.5 rounded-lg border border-black opacity-20 group-hover:opacity-100 transition-opacity">
                          <Check size={10} className="sm:w-3 sm:h-3 text-[#ff0033]" strokeWidth={4}/>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4 lg:space-y-4">
            <Link href="/profile" className="block group">
              <div className="bg-[#121214] border-2 border-black rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-4 shadow-[6px_6px_0_0_#000] hover:border-[#ff0033]/30 transition-all relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-2">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-[#ff0033] animate-ping" />
                    <span className="text-[7px] sm:text-[8px] font-black text-neutral-700 uppercase tracking-[0.4em] italic">STATUS UNIT</span>
                  </div>
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-700 group-hover:text-[#ff0033] transition-colors" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-lg font-black italic uppercase tracking-tighter text-white group-hover:text-[#ff0033] transition-colors leading-none">
                  ALPHA ELITE.
                </h4>
              </div>
            </Link>

            <Link href="/ai-coach" className="block group">
              <div className="bg-gradient-to-br from-[#1c1c1f] to-[#0a0a0b] border-2 border-black rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-4 shadow-[6px_6px_0_0_#000] hover:border-[#ff0033]/40 transition-all relative overflow-hidden h-full">
                 <div className="absolute -bottom-3 -right-3 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Zap className="w-16 h-16 sm:w-20 sm:h-20 lg:w-16 lg:h-16 text-[#ff0033]" strokeWidth={4} />
                 </div>
                 <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3 lg:mb-2">
                    <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-[#ff0033]" />
                    <span className="text-[7px] sm:text-[8px] font-black text-neutral-700 uppercase tracking-[0.4em] italic">IA COACH</span>
                 </div>
                 <h4 className="text-base sm:text-lg lg:text-base font-black italic uppercase tracking-tighter text-white leading-none">CONSULTAR<br/>COACH.</h4>
              </div>
            </Link>

            <Link href="/programs" className="block group">
              <div className="bg-[#121214] border-2 border-black rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-4 shadow-[6px_6px_0_0_#000] hover:border-[#ff0033]/30 transition-all relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-2">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-[#ff0033]" />
                    <span className="text-[7px] sm:text-[8px] font-black text-neutral-700 uppercase tracking-[0.4em] italic">CARTILHAS</span>
                  </div>
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-700 group-hover:text-[#ff0033] transition-colors" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-lg font-black italic uppercase tracking-tighter text-white group-hover:text-[#ff0033] transition-colors leading-none">
                  PROGRAMAS<br/>DE TREINO.
                </h4>
              </div>
            </Link>

            <Link href="/history" className="block group">
              <div className="bg-[#121214] border-2 border-black rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-4 shadow-[6px_6px_0_0_#000] hover:border-[#ff0033]/30 transition-all relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-2">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-[#ff0033]" />
                    <span className="text-[7px] sm:text-[8px] font-black text-neutral-700 uppercase tracking-[0.4em] italic">REGISTROS</span>
                  </div>
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-700 group-hover:text-[#ff0033] transition-colors" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-lg font-black italic uppercase tracking-tighter text-white group-hover:text-[#ff0033] transition-colors leading-none">
                  HISTÓRICO DE<br/>BATALHA.
                </h4>
              </div>
            </Link>

            <div className="hidden lg:grid grid-cols-2 gap-2 mt-auto">
               <QuickLink href="/config" icon={<Settings size={14}/>} label="TREINOS"/>
               <QuickLink href="/history" icon={<Clock size={14}/>} label="HISTÓRICO"/>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function HeaderNavBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <div className="w-8 h-8 rounded-lg bg-[#121214] border-2 border-black hover:border-[#ff0033]/60 flex items-center justify-center text-neutral-500 hover:text-white cursor-pointer transition-all group shadow-[3px_3px_0_0_#000]">
        {children}
      </div>
    </Link>
  )
}


function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="group">
      <div className="bg-[#121214] border-2 border-black rounded-lg p-2.5 flex flex-col items-center gap-1 shadow-[3px_3px_0_0_#000] hover:border-[#ff0033]/40 active:translate-y-0.5 transition-all cursor-pointer text-neutral-600 hover:text-white">
        {icon}
        <span className="text-[7px] font-black uppercase tracking-widest italic">{label}</span>
      </div>
    </Link>
  )
}
