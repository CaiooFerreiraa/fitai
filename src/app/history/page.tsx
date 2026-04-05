"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { getHistoryStats, HistoryStats } from "@/actions/history-actions"
import { getMyWorkoutPlans } from "@/actions/config-actions"
import { getUserProfile } from "@/actions/profile-actions"
import { WorkoutPlan } from "@/domain/entities/workout"
import { MobileNav } from "@/components/mobile-nav"
import {
  Calendar, ArrowLeft, TrendingUp, TrendingDown,
  Minus, Flame, Zap, BarChart3, Clock, Target, ListFilter,
  Dumbbell
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Period = "7d" | "30d" | "90d" | "all"

const PERIOD_LABELS: Record<Period, string> = {
  "7d":  "7 DIAS",
  "30d": "30 DIAS",
  "90d": "90 DIAS",
  "all": "SEMPRE",
}

function MiniBarChart({ history }: { history: { weight: number }[] }) {
  if (history.length < 2) return null
  const vals = history.map((h) => h.weight)
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  const range = max - min || 1

  return (
    <div className="flex items-end gap-[2px] h-8 w-full" aria-hidden>
      {vals.map((v, i) => {
        const pct = ((v - min) / range) * 100
        const isLast = i === vals.length - 1
        return (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-sm min-h-[2px] transition-all",
              isLast ? "bg-[#ff0033]" : "bg-white/10"
            )}
            style={{ height: `${Math.max(4, pct)}%` }}
          />
        )
      })}
    </div>
  )
}

function StatCard({
  label, value, sub, icon, accent = false
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  accent?: boolean
}) {
  return (
    <div className={cn(
      "bg-[#121214] border-4 border-black rounded-2xl p-5 shadow-[6px_6px_0_0_#000] relative overflow-hidden group hover:border-[#ff0033]/20 transition-all",
      accent && "border-[#ff0033]/30"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "p-2 rounded-xl border-2 border-black",
          accent ? "bg-[#ff0033]" : "bg-black"
        )}>
          {icon}
        </div>
        <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest italic">{label}</span>
      </div>
      <div className="text-3xl font-black italic tracking-tighter leading-none text-white">{value}</div>
      {sub && <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest italic mt-1">{sub}</p>}
    </div>
  )
}

export default function HistoryPage() {
  const [period, setPeriod] = useState<Period>("30d")
  const [stats, setStats] = useState<HistoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>("all")

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const [data, profile] = await Promise.all([
        getHistoryStats(period),
        getUserProfile()
      ])
      const userPlans = await getMyWorkoutPlans(profile?.activeProgramId || undefined)
      setStats(data)
      setPlans(userPlans)
    } catch (err) {
      console.error("Erro ao carregar histórico:", err)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const filteredExerciseStats = useMemo(() => {
    if (!stats) return []
    if (selectedPlanId === "all") return stats.exerciseStats
    const plan = plans.find(p => p.id === selectedPlanId)
    if (!plan) return stats.exerciseStats
    const exerciseIds = new Set(plan.exercises.map(e => e.id))
    return stats.exerciseStats.filter(s => exerciseIds.has(s.exerciseId))
  }, [stats, selectedPlanId, plans])

  const fmt = (d: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    }).format(new Date(d)).toUpperCase()

  const fmtDate = (d: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit", month: "long"
    }).format(new Date(d)).toUpperCase()

  const fmtWeekday = (d: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      weekday: "long"
    }).format(new Date(d)).toUpperCase()

  return (
    <div className="min-h-dvh bg-[#0a0a0b] text-white font-sans noise-overlay pb-28 md:pb-6">

      {/* ── Red Aura ── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute top-1/4 -right-1/4 w-[80vw] h-[80vw] bg-[#ff0033] opacity-[0.025] blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-[#ff0033] opacity-[0.01] blur-[120px] rounded-full" />
      </div>

      {/* ── Watermark ── */}
      <div className="bg-watermark opacity-[0.012]" aria-hidden>HISTORY</div>

      {/* ── Header ── */}
      <header className="relative z-30 sticky top-0 bg-[#0a0a0b]/80 backdrop-blur-2xl border-b-2 border-black/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 lg:px-10 h-12 sm:h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-neutral-600 group-hover:text-[#ff0033] group-hover:-translate-x-1 transition-all" strokeWidth={4} />
            <span className="text-xs font-black uppercase tracking-[0.3em] italic text-neutral-500 group-hover:text-white transition-colors hidden sm:inline">BASE</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ff0033] animate-ping" />
              <span className="text-[10px] font-black text-[#ff0033] uppercase tracking-[0.4em] italic">REGISTROS TÁTICOS</span>
            </div>
            <MobileNav />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-8 lg:px-10 pt-4 sm:pt-6 pb-20 lg:pb-6 space-y-6 sm:space-y-8">

        {/* ── Title ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none text-white">
              ARQUIVO DE<br />
              <span className="text-[#ff0033]">BATALHA.</span>
            </h1>
            <p className="text-[10px] sm:text-xs font-black text-neutral-600 uppercase tracking-[0.4em] italic mt-2">
              EVOLUÇÃO TÁTICA — REGISTRO COMPLETO DE PROTOCOLOS.
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar sm:bg-[#121214] sm:border-4 sm:border-black sm:rounded-2xl sm:p-1.5 sm:shadow-[4px_4px_0_0_#000] shrink-0">
            {(["7d", "30d", "90d", "all"] as Period[]).map((p) => (
              <button
                key={p}
                id={`period-${p}`}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase italic tracking-widest transition-all cursor-pointer whitespace-nowrap border-2 sm:border-0",
                  period === p
                    ? "bg-[#ff0033] text-white border-black shadow-[2px_2px_0_0_#000] sm:border-2 sm:shadow-[2px_2px_0_0_#000]"
                    : "text-neutral-600 hover:text-white border-transparent"
                )}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-[#121214] border-4 border-dashed border-[#1c1c1f] rounded-3xl">
            <div className="w-12 h-12 border-4 border-[#ff0033]/30 border-t-[#ff0033] rounded-full animate-spin mb-4" />
            <p className="font-black text-xs uppercase tracking-[0.4em] text-neutral-700 italic">ACESSANDO ARQUIVOS...</p>
          </div>
        ) : !stats ? null : (
          <>
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              <StatCard
                label="MISSÕES"
                value={stats.totalSessions}
                sub={`No período`}
                icon={<Target className="w-4 h-4 text-white" strokeWidth={4} />}
                accent={stats.totalSessions > 0}
              />
              <StatCard
                label="EXERCÍCIOS"
                value={stats.totalExercises}
                sub="Séries únicas"
                icon={<BarChart3 className="w-4 h-4 text-[#ff0033]" strokeWidth={4} />}
              />
              <StatCard
                label="VOLUME"
                value={`${(stats.totalVolume / 1000).toFixed(1)}T`}
                sub="Toneladas levantadas"
                icon={<Zap className="w-4 h-4 text-[#ff0033]" strokeWidth={4} />}
              />
              <StatCard
                label="SEQUÊNCIA"
                value={`${stats.streak}D`}
                sub="Dias consecutivos"
                icon={<Flame className="w-4 h-4 text-white" strokeWidth={4} />}
                accent={stats.streak >= 3}
              />
              <StatCard
                label="CONSISTÊNCIA"
                value={`${stats.consistency}%`}
                sub="Dias treinados"
                icon={<TrendingUp className="w-4 h-4 text-[#ff0033]" strokeWidth={4} />}
              />
            </div>

            {/* ── Last Session ── */}
            {stats.lastSession && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1 h-6 bg-[#ff0033]" />
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] italic">ÚLTIMA MISSÃO</span>
                </div>
                <div id="last-session-card" className="bg-gradient-to-br from-[#ff0033]/10 via-[#121214] to-[#0a0a0b] border-4 border-[#ff0033]/30 rounded-2xl p-5 sm:p-7 shadow-[8px_8px_0_0_#000] relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#ff0033] via-[#ff0033]/30 to-transparent" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#ff0033] p-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000]">
                        <Calendar size={16} strokeWidth={4} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter leading-none">
                          {fmtDate(stats.lastSession.date)}
                        </h3>
                        <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest italic mt-0.5">
                          {fmtWeekday(stats.lastSession.date)} · {fmt(stats.lastSession.date).split(",")[1]?.trim()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-black/50 border-2 border-black px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <Clock size={12} className="text-[#ff0033]" strokeWidth={4} />
                        <span className="text-[10px] font-black italic uppercase tracking-wider">{stats.lastSession.exerciseCount} EX.</span>
                      </div>
                      <div className="bg-black/50 border-2 border-black px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <Zap size={12} className="text-[#ff0033]" strokeWidth={4} />
                        <span className="text-[10px] font-black italic uppercase tracking-wider">
                          {(stats.lastSession.totalVolume / 1000).toFixed(1)}T
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {stats.lastSession.exerciseLogs.map((el, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-black/40 border-2 border-white/5 rounded-xl hover:border-[#ff0033]/15 transition-all">
                        <div className="flex items-center gap-2.5">
                          <div className="text-[8px] font-black text-neutral-700 italic bg-black w-5 h-5 flex items-center justify-center rounded-md border border-[#1c1c1f]">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="block font-black text-[10px] uppercase tracking-tight italic text-white">{el.exercise.name}</span>
                            <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest italic">
                              {el.setsReached ?? el.exercise.sets}S × {el.repsReached ?? el.exercise.reps}R
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-base font-black italic leading-none text-white">{el.weight}KG</span>
                          <span className="text-[7px] font-black text-[#ff0033] uppercase italic">CARGA</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Exercise Evolution ── */}
            {stats.exerciseStats.length > 0 && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-[#ff0033]" />
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] italic">EVOLUÇÃO POR PROTOCOLO</span>
                  </div>

                  {/* Protocol Filter */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar sm:bg-[#121214] sm:border-2 sm:border-black sm:rounded-xl sm:p-1 shrink-0">
                    <button
                      onClick={() => setSelectedPlanId("all")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase italic tracking-widest transition-all cursor-pointer whitespace-nowrap border-2 sm:border-0",
                        selectedPlanId === "all"
                          ? "bg-[#ff0033] text-white border-black shadow-[2px_2px_0_0_#000] sm:border-0 sm:shadow-none"
                          : "text-neutral-600 hover:text-white border-transparent"
                      )}
                    >
                      TODOS
                    </button>
                    {plans.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPlanId(p.id!)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase italic tracking-widest transition-all cursor-pointer whitespace-nowrap border-2 sm:border-0",
                          selectedPlanId === p.id
                            ? "bg-[#ff0033] text-white border-black shadow-[2px_2px_0_0_#000] sm:border-0 sm:shadow-none"
                            : "text-neutral-600 hover:text-white border-transparent"
                        )}
                      >
                        {p.name ?? p.dayOfWeek}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredExerciseStats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-[#121214] border-4 border-dashed border-[#1c1c1f] rounded-2xl">
                    <Dumbbell className="w-8 h-8 text-neutral-800 mb-2" />
                    <p className="font-black text-[10px] uppercase tracking-[0.3em] text-neutral-700 italic">SEM DADOS PARA ESTE PROTOCOLO</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredExerciseStats.map((ex) => {
                    const isUp = ex.progression > 0
                    const isDown = ex.progression < 0
                    return (
                      <div
                        key={ex.exerciseId}
                        className="bg-[#121214] border-4 border-black rounded-2xl p-5 shadow-[6px_6px_0_0_#000] hover:border-[#ff0033]/20 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-black italic uppercase text-xs tracking-tight text-white leading-tight flex-1">{ex.exerciseName}</h4>
                          <div className={cn(
                            "flex items-center gap-1 text-[10px] font-black italic shrink-0 ml-2",
                            isUp ? "text-emerald-400" : isDown ? "text-[#ff0033]" : "text-neutral-600"
                          )}>
                            {isUp ? <TrendingUp size={12} strokeWidth={4} /> : isDown ? <TrendingDown size={12} strokeWidth={4} /> : <Minus size={12} strokeWidth={4} />}
                            {Math.abs(ex.progression)}%
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-[8px] font-black text-neutral-600 uppercase italic tracking-widest">INÍCIO</span>
                            <p className="text-base font-black italic tracking-tighter text-neutral-400">{ex.firstWeight}KG</p>
                          </div>
                          <div className="text-neutral-700 text-xs font-black">→</div>
                          <div className="text-right">
                            <span className="text-[8px] font-black text-[#ff0033] uppercase italic tracking-widest">ATUAL</span>
                            <p className="text-base font-black italic tracking-tighter text-white">{ex.lastWeight}KG</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] font-black text-neutral-600 uppercase italic tracking-widest">MÁXIMO</span>
                            <p className="text-base font-black italic tracking-tighter text-white">{ex.maxWeight}KG</p>
                          </div>
                        </div>

                        <MiniBarChart history={ex.history} />

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[8px] font-black text-neutral-700 uppercase italic tracking-widest">{ex.totalSessions} SESSÕES</span>
                          <span className="text-[8px] font-black text-neutral-700 uppercase italic tracking-widest">
                            {ex.history.length > 0 && new Intl.DateTimeFormat("pt-BR", { day:"2-digit", month:"short" }).format(new Date(ex.history[ex.history.length - 1].date)).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                )}
              </div>
            )}

            {/* ── Full Log ── */}
            {stats.logs.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1 h-6 bg-[#ff0033]" />
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] italic">DIÁRIO DE MISSÕES</span>
                </div>
                <div className="space-y-4">
                  {stats.logs.map((log) => (
                    <div key={log.id} className="bg-[#121214] border-4 border-black rounded-2xl p-5 sm:p-6 shadow-[6px_6px_0_0_#000] hover:border-[#ff0033]/20 transition-all group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#ff0033]/10 border-2 border-[#ff0033]/20 p-2 rounded-xl group-hover:-translate-y-0.5 transition-transform">
                            <Calendar size={16} className="text-[#ff0033]" strokeWidth={4} />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-black uppercase italic tracking-tighter leading-none">
                              {fmtDate(log.date)}
                            </h3>
                            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] italic mt-0.5">
                              {fmtWeekday(log.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-black/50 border-2 border-black px-3 py-1.5 rounded-xl flex items-center gap-2">
                            <Clock size={11} className="text-[#ff0033]" strokeWidth={4} />
                            <span className="text-[9px] font-black italic uppercase tracking-wider">{log.exerciseCount} EX.</span>
                          </div>
                          <div className="bg-black/50 border-2 border-black px-3 py-1.5 rounded-xl">
                            <span className="text-[9px] font-black italic uppercase tracking-wider">{(log.totalVolume / 1000).toFixed(1)}T VOL.</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {log.exerciseLogs.map((exLog, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-black/40 border border-[#1c1c1f] rounded-xl hover:border-[#ff0033]/15 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="text-[9px] font-black text-neutral-700 italic bg-black w-5 h-5 flex items-center justify-center rounded-lg border border-[#1c1c1f]">
                                {idx + 1}
                              </div>
                              <div>
                                <span className="block font-black text-[10px] uppercase tracking-tight italic">{exLog.exercise.name}</span>
                                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest italic">
                                  {exLog.setsReached ?? exLog.exercise.sets}S · {exLog.repsReached ?? exLog.exercise.reps}R
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block text-base font-black italic leading-none">{exLog.weight}KG</span>
                              <span className="text-[7px] font-black text-[#ff0033] uppercase italic">CARGA</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.logs.length === 0 && (
              <div className="flex flex-col items-center justify-center p-16 sm:p-24 bg-[#121214] border-4 border-dashed border-[#1c1c1f] rounded-3xl text-center">
                <div className="bg-black/60 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 border-4 border-black shadow-[8px_8px_0_0_#000]">
                  <BarChart3 size={40} className="text-neutral-800" strokeWidth={3} />
                </div>
                <h3 className="text-3xl sm:text-4xl font-black uppercase italic mb-3 tracking-tighter">SEM DADOS.</h3>
                <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] max-w-xs mx-auto italic">
                  NENHUM PROTOCOLO EXECUTADO NESTE PERÍODO.
                </p>
                <Link href="/" className="mt-6">
                  <button className="px-6 py-2.5 bg-[#ff0033] border-2 border-black text-white font-black text-xs uppercase italic tracking-widest rounded-xl shadow-[4px_4px_0_0_#000] hover:bg-[#ff1100] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer">
                    IR À BASE
                  </button>
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
