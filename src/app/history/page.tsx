"use client"

import { useState, useEffect } from "react"
import { getWorkoutHistory } from "@/actions/history-actions"
import { MobileNav } from "@/components/mobile-nav"
import { 
  Calendar, Clock, History as HistoryIcon, 
  ArrowLeft, Activity, Target, TrendingUp
} from "lucide-react"
import Link from "next/link"

interface WorkoutHistoryLog {
  id: string
  date: Date | string
  exerciseLogs: {
    id: string
    weight: number
    setsReached: number | null
    repsReached: number | null
    exercise: {
      name: string
      sets: number
      reps: number
    }
  }[]
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<WorkoutHistoryLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getWorkoutHistory()
        setLogs(data)
      } catch (error) {
        console.error("Erro ao carregar histórico:", error)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [])

  return (
    <div className="min-h-dvh bg-[#0a0a0b] text-white font-sans noise-overlay pb-28 md:pb-6">
      
      {/* ── Red Aura ── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute top-1/4 -right-1/4 w-[80vw] h-[80vw] bg-[#ff0033] opacity-[0.02] blur-[150px] rounded-full" />
      </div>

      {/* ── Watermark ── */}
      <div className="bg-watermark opacity-[0.01]" aria-hidden>HISTORY</div>

      {/* ── Header ── */}
      <header className="relative z-30 sticky top-0 bg-[#0a0a0b]/80 backdrop-blur-2xl border-b-2 border-black/50 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 lg:px-10 h-12 sm:h-14 lg:h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-neutral-600 group-hover:text-[#ff0033] group-hover:-translate-x-1 transition-all" strokeWidth={4}/>
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

      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-8 lg:px-10 pt-3 sm:pt-4 lg:pt-6 pb-20 lg:pb-6 space-y-6 sm:space-y-8">
        
        {/* ── Title ── */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none text-white">
            ARQUIVO DE<br />
            <span className="text-[#ff0033]">BATALHA.</span>
          </h1>
          <p className="text-[10px] sm:text-xs font-black text-neutral-600 uppercase tracking-[0.4em] italic mt-2">
            REGISTRO DE TODOS OS PROTOCOLOS EXECUTADOS.
          </p>
        </div>

        {/* ── Stats Summary ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {[
            { label: "MISSÕES", value: logs.length, icon: <Target className="text-[#ff0033]" /> },
            { label: "PROTOCOLOS", value: logs.reduce((acc, log) => acc + log.exerciseLogs.length, 0), icon: <Activity className="text-[#ff0033]" /> },
            { label: "CONSISTÊNCIA", value: "85%", icon: <TrendingUp className="text-[#ff0033]" /> },
          ].map((stat, i) => (
            <div key={i} className="bg-[#121214] border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0_0_#000] relative overflow-hidden group hover:border-[#ff0033]/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-black border-2 border-black rounded-lg group-hover:border-[#ff0033]/30 transition-all">
                  {stat.icon}
                </div>
                <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest italic">{stat.label}</span>
              </div>
              <div className="text-4xl font-black italic uppercase tracking-tighter">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* ── Log List ── */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 bg-[#121214] border-4 border-dashed border-[#1c1c1f] rounded-3xl">
              <div className="w-12 h-12 border-4 border-[#ff0033]/30 border-t-[#ff0033] rounded-full animate-spin mb-4" />
              <p className="font-black text-xs uppercase tracking-[0.4em] text-neutral-700 italic">ACESSANDO ARQUIVOS...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 sm:p-24 bg-[#121214] border-4 border-dashed border-[#1c1c1f] rounded-3xl text-center group hover:border-[#ff0033]/20 transition-all">
              <div className="bg-black/60 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 border-4 border-black shadow-[8px_8px_0_0_#000] group-hover:scale-110 transition-transform">
                <HistoryIcon size={40} className="text-neutral-800" strokeWidth={3} />
              </div>
              <h3 className="text-3xl sm:text-4xl font-black uppercase italic mb-3 tracking-tighter">SEM REGISTROS.</h3>
              <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] max-w-xs mx-auto italic">
                NENHUMA MISSÃO EXECUTADA NESTE QUADRANTE.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {logs.map((log) => (
                <div key={log.id} className="bg-[#121214] border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0_0_#000] hover:border-[#ff0033]/30 transition-all group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                          <div className="bg-[#ff0033] text-white p-3 rounded-xl border-2 border-black shadow-[4px_4px_0_0_#000] group-hover:-translate-y-1 transition-transform">
                            <Calendar size={20} strokeWidth={4} />
                          </div>
                          <div>
                            <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter leading-none">
                              {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(new Date(log.date)).toUpperCase()}
                            </h3>
                            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] italic mt-1">
                              {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(log.date)).toUpperCase()}
                            </p>
                          </div>
                        </div>
                    <div className="bg-black/50 border-2 border-black px-4 py-2 rounded-xl flex items-center gap-3">
                      <Clock size={14} className="text-[#ff0033]" strokeWidth={4} />
                      <span className="text-xs font-black italic uppercase tracking-wider">{log.exerciseLogs.length} EXERCÍCIOS</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {log.exerciseLogs.map((exLog, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-black/40 border-2 border-[#1c1c1f] rounded-2xl hover:border-[#ff0033]/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="text-[10px] font-black text-neutral-700 italic bg-black w-6 h-6 flex items-center justify-center rounded-lg border border-[#1c1c1f]">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="block font-black text-xs uppercase tracking-tight italic">{exLog.exercise.name}</span>
                            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest italic">{exLog.setsReached || exLog.exercise.sets} SÉRIES • {exLog.repsReached || exLog.exercise.reps} REPS</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-lg font-black italic leading-none">{exLog.weight}KG</span>
                          <span className="text-[8px] font-black text-[#ff0033] uppercase italic">CARGA</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
