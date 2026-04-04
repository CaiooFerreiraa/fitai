"use client"

import { useState } from "react"
import { Exercise } from "@/domain/entities/workout"
import { Button } from "@/components/ui/button"
import { NumberInput } from "@/components/ui/number-input"
import { Label } from "@/components/ui/label"
import { Timer } from "@/components/timer"
import { logExerciseAction } from "@/actions/workout-actions"
import { toast } from "sonner"
import { Loader2, Dumbbell, Sparkles, Target, ChevronRight, CheckCircle2, ArrowLeft, Scale } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { getAiSlogansAction } from "@/actions/workout-actions"

interface SetLog {
  set: number
  weight: number
  reps: number
}

export function WorkoutSession({ exercises }: { exercises: Exercise[] }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [weight, setWeight] = useState<number>(0)
  const [setLogs, setSetLogs] = useState<SetLog[]>([])
  const [loading, setLoading] = useState(false)
  const [incentive, setIncentive] = useState<string | null>(null)
  const [showTimer, setShowTimer] = useState(false)
  const [finishSlogan, setFinishSlogan] = useState("OPERAÇÃO FINALIZADA.")

  const currentExercise = exercises[currentIdx]

  if (!currentExercise) {
    return (
      <div className="flex flex-col items-center justify-center p-6 md:p-12 bg-gradient-to-br from-[#1c1c1f] via-[#121214] to-[#0a0a0b] border-4 border-black rounded-[2rem] animate-in zoom-in duration-700 shadow-[20px_20px_60px_-10px_rgba(0,0,0,0.8)] relative overflow-hidden noise-overlay">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,51,0.06),transparent_70%)] pointer-events-none" />
        <div className="bg-[#ff0033] p-6 md:p-10 rounded-[2rem] mb-8 shadow-[0_20px_50px_-10px_#ff0033aa] border-2 border-black active:scale-95 transition-all cursor-pointer relative z-10 overflow-hidden group">
          <CheckCircle2 className="w-12 h-12 md:w-20 md:h-20 text-white relative z-10" strokeWidth={5} />
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </div>

        <div className="text-center space-y-3 relative z-10 px-4">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none text-white">
            {finishSlogan.split(" ").slice(0, -1).join(" ")} <br /><span className="text-[#ff0033]">{finishSlogan.split(" ").slice(-1)}</span>
          </h2>
          <p className="text-neutral-500 font-black italic uppercase tracking-[0.3em] text-[10px] md:text-xs">
            MISSÃO CUMPRIDA COM HONRA
          </p>
        </div>

        <Link href="/" className="mt-8 w-full max-w-sm px-6 relative z-10">
          <Button className="w-full h-14 md:h-16 bg-[#ff0033] hover:bg-[#ff1100] text-white text-base md:text-xl font-black uppercase italic rounded-xl md:rounded-2xl cursor-pointer transition-all active:scale-[0.98] shadow-[6px_6px_0_0_#000000] border-2 md:border-4 border-black flex items-center justify-between px-8 group">
            <span>VOLTAR À BASE</span>
            <ArrowLeft className="w-5 h-5 md:w-7 md:h-7 group-hover:-translate-x-2 transition-transform" strokeWidth={5} />
          </Button>
        </Link>
      </div>
    )
  }

  const handleFinishSet = async () => {
    const log: SetLog = { set: currentSet, weight, reps: currentExercise.reps }

    if (currentSet < currentExercise.sets) {
      setSetLogs(prev => [...prev, log])
      setCurrentSet(s => s + 1)
      setShowTimer(true)
      toast.success(`SÉRIE ${currentSet} REGISTRADA`, {
        description: `${weight}KG × ${currentExercise.reps} REPS.`,
        duration: 3000,
      })
    } else {
      const allLogs = [...setLogs, log]
      const avgWeight = allLogs.reduce((a, b) => a + b.weight, 0) / allLogs.length

      setLoading(true)
      try {
        const res = await logExerciseAction({
          exerciseId: currentExercise.id!,
          weight: avgWeight,
          reps: currentExercise.reps,
          sets: currentExercise.sets,
        })
        setSetLogs([])
        setIncentive(res.incentive)
        
        // Fetch finish slogan if it's the last exercise
        if (currentIdx + 1 === exercises.length) {
          getAiSlogansAction(["session_finish"]).then(s => setFinishSlogan(s.session_finish))
        }

        toast.success("PROTOCOLO ENCERRADO", {
          description: `${currentExercise.sets} SÉRIES COMPLETAS.`,
          duration: 4000,
        })
      } catch {
        toast.error("FALHA AO SALVAR", {
          description: "O SISTEMA NÃO ACEITA FRAQUEZA. TENTE NOVAMENTE.",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const nextExercise = () => {
    setCurrentIdx(i => i + 1)
    setCurrentSet(1)
    setWeight(0)
    setSetLogs([])
    setIncentive(null)
    setShowTimer(false)
  }

  return (
    <div className="flex flex-col gap-5 md:gap-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-700 relative">

      <div className="relative overflow-hidden bg-[#121214] border-2 md:border-4 border-black rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 lg:p-10 group hover:border-[#ff0033]/20 transition-all shadow-[8px_8px_0_0_#000] md:shadow-[12px_12px_0_0_#000]">
        <div className="absolute -top-6 -right-6 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 pointer-events-none">
          <Dumbbell className="w-32 h-32 md:w-48 md:h-48 text-white" strokeWidth={4} />
        </div>

        <div className="relative z-10 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="bg-[#ff0033] px-3 py-1.5 md:px-5 md:py-2 rounded-xl md:rounded-2xl flex items-center gap-2.5 shadow-[4px_4px_0_0_#000] border border-black">
              <Target className="w-3.5 h-3.5 text-white" strokeWidth={4} />
              <span className="text-[9px] md:text-xs font-black uppercase tracking-tight text-white italic">
                ALVO {currentIdx + 1} / {exercises.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#ff0033] rounded-full animate-pulse shadow-[0_0_8px_#ff0033]" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600 italic">ATROCIDADE EM CURSO</span>
            </div>
          </div>

          <h2 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none text-white group-hover:text-[#ff0033] transition-colors duration-500">
            {currentExercise.name}
          </h2>

          <div className="flex flex-wrap gap-3">
            <div className="bg-black/60 px-4 py-2.5 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-white/5 flex flex-col gap-0.5">
              <span className="text-[7px] md:text-[8px] font-black text-[#ff0033] uppercase tracking-[0.4em] italic leading-none">VOLUME</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl md:text-3xl font-black tracking-tighter text-white italic leading-none">
                  {currentExercise.sets}<span className="text-neutral-600 text-xs md:text-sm">S</span>
                </span>
                <span className="text-neutral-600 font-black text-xs">×</span>
                <span className="text-xl md:text-3xl font-black tracking-tighter text-white italic leading-none">
                  {currentExercise.reps}<span className="text-neutral-600 text-xs md:text-sm">R</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className={cn(
          "space-y-4 md:space-y-6 transition-all duration-700",
          showTimer && !incentive ? "opacity-[0.05] blur-xl scale-[0.98] pointer-events-none" : "opacity-100 scale-100"
        )}>

          <div className="bg-[#121214] border-2 md:border-4 border-black rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-[8px_8px_0_0_#000] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,0,51,0.03),transparent_60%)] pointer-events-none" />

            <div className="text-center mb-5 md:mb-8 relative z-10">
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-neutral-700 italic">SÉRIE EM EXECUÇÃO</span>
              <div className="text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter text-white leading-none mt-1 select-none">
                SET <span className="text-[#ff0033]">{currentSet}</span>
                <span className="text-neutral-800 text-xl lg:text-2xl">/{currentExercise.sets}</span>
              </div>

              <div className="flex items-center justify-center gap-2 mt-3">
                {Array.from({ length: currentExercise.sets }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-full transition-all duration-500",
                      i < currentSet - 1
                        ? "w-2.5 h-2.5 bg-[#ff0033] shadow-[0_0_8px_#ff0033]"
                        : i === currentSet - 1
                        ? "w-4 h-4 bg-[#ff0033] shadow-[0_0_12px_#ff0033] ring-4 ring-[#ff0033]/15"
                        : "w-2.5 h-2.5 bg-[#1c1c1f] border border-black"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="relative z-10 space-y-3 mb-5 md:mb-8">
              <Label className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-neutral-600 italic">
                <Scale className="w-3.5 h-3.5 text-[#ff0033]" strokeWidth={4} />
                CARGA (KG)
              </Label>
              <NumberInput
                value={weight}
                onChange={setWeight}
                step={0.5}
                min={0}
                className="h-16 md:h-20 lg:h-24 w-full text-4xl md:text-5xl lg:text-6xl italic bg-black/60 border-2 border-black rounded-xl md:rounded-2xl focus:border-[#ff0033] shadow-[4px_4px_0_0_#000] transition-all"
              />
            </div>
          </div>

          {!incentive ? (
            <Button
              onClick={handleFinishSet}
              disabled={loading}
              className="w-full h-16 md:h-20 bg-[#ff0033] hover:bg-[#ff1100] text-white rounded-xl md:rounded-2xl font-black text-lg md:text-xl lg:text-2xl cursor-pointer uppercase italic transition-all shadow-[6px_6px_0_0_#000000] flex justify-between items-center px-6 md:px-10 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-30 border-2 md:border-4 border-black group/btn relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              {loading ? (
                <div className="flex items-center gap-3 justify-center w-full">
                  <Loader2 className="w-6 h-6 animate-spin" strokeWidth={5} />
                  <span className="text-sm">PROCESSANDO...</span>
                </div>
              ) : (
                <>
                  <span className="leading-none tracking-tighter relative z-10">
                    {currentSet < currentExercise.sets ? `REGISTRAR SÉRIE ${currentSet}` : "FECHAR PROTOCOLO"}
                  </span>
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 group-hover/btn:scale-110 transition-transform shrink-0 relative z-10" strokeWidth={5} />
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4 md:space-y-6 animate-in zoom-in duration-700">
              <div className="bg-gradient-to-br from-[#ff0033] via-[#ff1100] to-[#9a0022] text-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] relative overflow-hidden shadow-[15px_15px_40px_-5px_rgba(255,0,51,0.3)] border-2 md:border-4 border-black group/ai">
                <div className="absolute top-0 right-0 p-6 opacity-[0.08] scale-150 rotate-12 group-hover/ai:scale-[1.7] transition-all duration-700">
                  <Sparkles className="w-24 h-24 md:w-32 md:h-32" />
                </div>
                <div className="relative z-10 space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 italic">IA COACH INSIGHT</span>
                  <p className="text-lg md:text-2xl lg:text-3xl font-black uppercase italic tracking-tight leading-[0.95]">
                    &ldquo;{incentive}&rdquo;
                  </p>
                </div>
              </div>

              <Button
                onClick={nextExercise}
                className="w-full h-16 md:h-20 bg-white hover:bg-neutral-100 text-black rounded-xl md:rounded-2xl font-black text-base md:text-xl lg:text-2xl cursor-pointer uppercase italic transition-all flex items-center justify-between px-6 md:px-10 border-2 md:border-4 border-black shadow-[6px_6px_0_0_#000] md:shadow-[10px_10px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none group"
              >
                <span className="leading-none tracking-tighter">
                  {currentIdx + 1 < exercises.length ? "PRÓXIMO PROTOCOLO" : "ENCERRAR MISSÃO"}
                </span>
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform duration-500" strokeWidth={5} />
              </Button>
            </div>
          )}
        </div>

        {showTimer && !incentive && (
          <div className="absolute inset-x-0 -inset-y-5 z-30 flex items-center justify-center animate-in fade-in zoom-in duration-500 px-2 lg:px-6">
            <div className="flex flex-col items-center w-full bg-[#0a0a0b]/98 backdrop-blur-3xl p-8 md:p-12 lg:p-16 rounded-[2rem] md:rounded-[3rem] border-2 md:border-4 border-black shadow-[20px_20px_100px_-5px_rgba(0,0,0,1)] relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,51,0.05),transparent_70%)] pointer-events-none" />
               <div className="relative z-10 w-full mb-6 italic">
                  <Timer initialTime={currentExercise.timer} onComplete={() => setShowTimer(false)} />
               </div>
               <button
                 onClick={() => setShowTimer(false)}
                 className="relative z-10 text-neutral-700 hover:text-[#ff0033] uppercase font-black tracking-[0.4em] text-[9px] md:text-[10px] cursor-pointer transition-all pt-4 border-t border-white/5 w-full text-center italic"
               >
                 CANCELAR REPOUSO TÁTICO
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
