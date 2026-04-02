"use client"

import { useState } from "react"
import { Exercise, DayOfWeek, DAYS_OF_WEEK } from "@/domain/entities/workout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NumberInput } from "@/components/ui/number-input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveWorkoutPlanAction } from "@/actions/config-actions"
import { toast } from "sonner"
import {
  Plus, Trash2, Save, Loader2, Dumbbell, Activity,
  Clock, Sparkles, ListChecks, Target, Zap, Home, Settings, User, ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function ConfigPage() {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("MONDAY")
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: 10, timer: 60, order: exercises.length }])
  }

  const updateExercise = (idx: number, data: Partial<Exercise>) => {
    const updated = [...exercises]
    updated[idx] = { ...updated[idx], ...data }
    setExercises(updated)
  }

  const removeExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    if (exercises.length === 0) {
      return toast.error("ARSENAL VAZIO", {
        description: "ADICIONE PELO MENOS UM PROTOCOLO, RECRUTA!"
      })
    }
    setLoading(true)
    try {
      await saveWorkoutPlanAction({ dayOfWeek, exercises })
      toast.success("PLANO DE COMBATE SALVO", {
        description: "MODIFICAÇÕES ESTRATÉGICAS COMPUTADAS COM SUCESSO."
      })
    } catch {
      toast.error("FALHA CRÍTICA", {
        description: "O SISTEMA REJEITOU AS ALTERAÇÕES. TENTE NOVAMENTE."
      })
    } finally {
      setLoading(false)
    }
  }

  const coachMsg =
    exercises.length === 0
      ? "ARSENAL COMPLETAMENTE VAZIO. SEUS MÚSCULOS NÃO CRESCEM COM PENSAMENTO POSITIVO."
      : exercises.length < 3
      ? "ISSO É UM TREINO OU UM AQUECIMENTO DE RECREIO? MAIS CARGA!"
      : exercises.length < 6
      ? "ESTAMOS CHEGANDO LÁ. ESSA LISTA JÁ ASSUSTA ALGUNS FRANGOS."
      : "AGORA SIM! UM TREINO DIGNO DE UMA MÁQUINA DE GUERRA."

  return (
    <div className="min-h-dvh bg-[#0a0a0b] text-white font-sans noise-overlay pb-28 md:pb-6">

      {/* ── Red Aura ── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute top-1/4 -left-1/4 w-[80vw] h-[80vw] bg-[#ff0033] opacity-[0.02] blur-[150px] rounded-full" />
      </div>

      {/* ── Watermark ── */}
      <div className="bg-watermark opacity-[0.01]" aria-hidden>CONFIG</div>

      {/* ── Header ── */}
      <header className="relative z-30 sticky top-0 bg-[#0a0a0b]/90 backdrop-blur-2xl border-b-4 border-black shadow-[0_10px_40px_rgba(0,0,0,1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-neutral-600 group-hover:text-[#ff0033] group-hover:-translate-x-1 transition-all" strokeWidth={4}/>
            <span className="text-xs font-black uppercase tracking-[0.3em] italic text-neutral-500 group-hover:text-white transition-colors">VOLTAR À BASE</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff0033] animate-ping shadow-[0_0_8px_#ff0033]" />
            <span className="text-[10px] font-black text-[#ff0033] uppercase tracking-[0.4em] italic">PLANEJAMENTO ESTRATÉGICO</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-6 sm:pt-10 md:pt-12 space-y-6 md:space-y-10">

        {/* ── Title + Day Selector ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8">
          <div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter italic leading-none text-white">
              MISSÃO<br />
              <span className="text-[#ff0033]">SEMANAL.</span>
            </h1>
          </div>

          {/* Day Selector */}
          <div className="w-full lg:max-w-sm bg-[#121214] border-4 border-black p-5 rounded-2xl shadow-[6px_6px_0_0_#000] relative overflow-hidden">
            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 block mb-3 italic">JANELA DE EXECUÇÃO TÁTICA</Label>
            <Select value={dayOfWeek} onValueChange={(val: DayOfWeek) => setDayOfWeek(val)}>
              <SelectTrigger className="h-14 bg-black/60 border-2 border-[#1c1c1f] focus:border-[#ff0033] focus:ring-0 text-base font-black uppercase tracking-tight rounded-xl cursor-pointer px-5 italic transition-all">
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1c1f] border-4 border-black text-white rounded-xl overflow-hidden">
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem
                    key={day}
                    value={day}
                    className="focus:bg-[#ff0033] focus:text-white uppercase tracking-tighter font-black cursor-pointer py-2.5 text-sm italic"
                  >
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 md:gap-10 items-start">

          {/* ── Exercise List ── */}
          <div className="xl:col-span-3 space-y-4 md:space-y-6">

            {/* Section Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#ff0033] rounded-full animate-pulse shadow-[0_0_10px_#ff0033]" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] italic text-neutral-500">SEQUÊNCIA DE COMBATE</h2>
              </div>
              <div className="bg-[#121214] px-4 py-1.5 rounded-full border-2 border-black flex items-center gap-2 shadow-[4px_4px_0_0_#000]">
                <ListChecks className="w-3.5 h-3.5 text-[#ff0033]" strokeWidth={4} />
                <span className="text-[9px] font-black italic tracking-[0.3em] uppercase">{exercises.length} PROTOCOLOS</span>
              </div>
            </div>

            {/* List */}
            {exercises.length === 0 ? (
              <div className="bg-[#121214] border-4 border-dashed border-[#1c1c1f] rounded-3xl p-10 md:p-14 text-center group hover:border-[#ff0033]/20 transition-all relative overflow-hidden">
                <div className="bg-black/60 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform border-4 border-black shadow-[6px_6px_0_0_#000]">
                  <Dumbbell className="w-8 h-8 text-neutral-800" strokeWidth={4} />
                </div>
                <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter text-white">ARSENAL ZERADO.</h3>
                <p className="text-neutral-700 font-black text-[9px] uppercase tracking-[0.4em] max-w-xs mx-auto italic">
                  NENHUM PROTOCOLO DETECTADO.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="bg-[#121214] border-4 border-black rounded-3xl p-5 sm:p-7 hover:border-[#ff0033]/20 transition-all shadow-[6px_6px_0_0_#000] group/card animate-in fade-in slide-in-from-top-4 duration-500"
                  >
                    <div className="flex items-start gap-3 md:gap-4 mb-5">
                      <div className="bg-[#ff0033] text-white w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black italic shrink-0 shadow-[4px_4px_0_0_#000] border-4 border-black">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-600 italic">IDENTIFICAÇÃO TÁTICA</Label>
                        <Input
                          placeholder="EX: SUPINO RETO"
                          value={ex.name}
                          onChange={(e) => updateExercise(idx, { name: e.target.value })}
                          className="h-12 bg-black/50 border-4 border-black focus:border-[#ff0033] focus-visible:ring-0 text-base font-black uppercase tracking-tight rounded-xl px-4 italic transition-all"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExercise(idx)}
                        className="w-10 h-10 mt-6 shrink-0 bg-[#0a0a0b] text-neutral-800 hover:text-[#ff0033] border-4 border-black rounded-xl transition-all shadow-[4px_4px_0_0_#000]"
                      >
                        <Trash2 size={16} strokeWidth={4} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 md:gap-5 pt-4 border-t-2 border-black/50">
                      {[
                        { label: "SÉRIES", icon: <Target size={12}/>, value: ex.sets, onChange: (val: number) => updateExercise(idx, { sets: val }), min: 1 },
                        { label: "REPS", icon: <Activity size={12}/>, value: ex.reps, onChange: (val: number) => updateExercise(idx, { reps: val }), min: 1 },
                        { label: "DESC. (S)", icon: <Clock size={12}/>, value: ex.timer, onChange: (val: number) => updateExercise(idx, { timer: val }), step: 5, min: 0 },
                      ].map((param) => (
                        <div key={param.label} className="space-y-1.5">
                          <Label className="text-[8px] font-black uppercase tracking-widest text-[#ff0033] flex items-center gap-1 italic">
                            {param.icon} {param.label}
                          </Label>
                          <NumberInput
                            value={param.value}
                            onChange={param.onChange}
                            min={param.min}
                            step={param.step}
                            className="h-10 text-xl italic rounded-xl border-2 border-black bg-black/40 focus:border-[#ff0033] transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={addExercise}
              className="w-full h-16 border-4 border-dashed border-[#1c1c1f] hover:border-[#ff0033]/40 text-neutral-700 hover:text-white hover:bg-[#ff0033]/5 bg-transparent rounded-2xl group flex items-center justify-center gap-4 transition-all"
            >
              <Plus size={20} strokeWidth={5} className="group-hover:bg-[#ff0033] group-hover:text-white rounded-lg p-0.5 transition-all"/>
              <span className="font-black uppercase tracking-[0.4em] text-[10px] italic">RECRUTAR NOVO PROTOCOLO</span>
            </Button>
          </div>

          {/* ── Sidebar ── */}
          <div className="xl:col-span-2 space-y-6">
            {/* Coach Card */}
            <div className="bg-[#121214] border-4 border-black p-6 md:p-8 rounded-3xl shadow-[8px_8px_0_0_#000] relative overflow-hidden group hover:border-[#ff0033]/20 transition-all">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-[#ff0033] p-3 rounded-xl border-2 border-black">
                    <Sparkles size={20} className="text-white" strokeWidth={4} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] italic">MOD. LOGÍSTICO IA</p>
                    <span className="font-black italic text-lg uppercase text-white">CHIEF COACH</span>
                  </div>
                </div>
                <p className="font-black text-xl md:text-2xl leading-none uppercase italic text-neutral-400 group-hover:text-white transition-colors">
                  &ldquo;{coachMsg}&rdquo;
                </p>
                <div className="pt-4 border-t-2 border-black/50 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ff0033] animate-pulse" />
                  <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest italic">NOMINAL READY</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={loading || exercises.length === 0}
              className="w-full h-20 bg-[#ff0033] hover:bg-[#ff1100] text-white rounded-3xl font-black text-3xl cursor-pointer uppercase italic shadow-[10px_10px_0_0_#000] border-4 border-black group px-8 relative overflow-hidden"
            >
              {loading ? (
                <Loader2 className="animate-spin h-10 w-10 mx-auto" strokeWidth={5}/>
              ) : (
                <>
                  <span className="grow text-left tracking-tighter">EXECUTAR PLANO</span>
                  <Save size={28} className="group-hover:rotate-12 transition-transform" strokeWidth={4} />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* ── Bottom Nav — MOBILE ONLY ── */}
      <nav className="bottom-nav lg:hidden" aria-label="Navegação">
        <BottomNavLink href="/" icon={<Home size={18}/>} label="Home" />
        <div className="w-px h-6 bg-[#1c1c1f]" />
        <BottomNavLink href="/config" icon={<Settings size={18}/>} label="Config" active />
        <div className="w-px h-6 bg-[#1c1c1f]" />
        <BottomNavLink href="/profile" icon={<User size={18}/>} label="Perfil" />
      </nav>
    </div>
  )
}

function BottomNavLink({
  href, icon, label, active
}: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} className="flex-1 flex flex-col items-center gap-1 group">
      <div className={`p-2.5 rounded-xl transition-all ${active ? "bg-[#ff0033] border-4 border-black shadow-[4px_4px_0_0_#000] text-white" : "text-neutral-600 hover:text-[#ff0033]"}`}>
        {icon}
      </div>
      <span className={`text-[8px] font-black uppercase tracking-widest italic transition-colors ${active ? "text-[#ff0033]" : "text-neutral-700 group-hover:text-[#ff0033]"}`}>{label}</span>
    </Link>
  )
}
