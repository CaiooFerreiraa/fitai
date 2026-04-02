"use client"

import { useState, useEffect } from "react"
import { listTrainingProgramsAction, setActiveProgramAction, deleteProgramAction, generateTrainingProgramAction } from "@/actions/program-actions"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Loader2, Target, CheckCircle2, Trash2, Sparkles, Calendar, Dumbbell } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  timer: number
  order: number
}

interface WorkoutPlan {
  id: string
  dayOfWeek: string
  name: string | null
  exercises: Exercise[]
}

interface TrainingProgram {
  id: string
  name: string
  description: string | null
  goal: string | null
  duration: string | null
  workoutPlans: WorkoutPlan[]
  createdAt: Date
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  async function loadPrograms() {
    setLoading(true)
    try {
      const data = await listTrainingProgramsAction()
      setPrograms(data)
    } catch (error) {
      toast.error("ERRO AO CARREGAR CARTILHAS")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrograms()
  }, [])

  async function handleGenerateProgram() {
    setGenerating(true)
    try {
      await generateTrainingProgramAction()
      toast.success("CARTILHA GERADA PELA IA", {
        description: "Nova cartilha criada com sucesso."
      })
      await loadPrograms()
    } catch (error) {
      toast.error("ERRO AO GERAR CARTILHA", {
        description: error instanceof Error ? error.message : "Tente novamente."
      })
    } finally {
      setGenerating(false)
    }
  }

  async function handleSetActive(programId: string) {
    try {
      await setActiveProgramAction(programId)
      setActiveId(programId)
      toast.success("CARTILHA ATIVADA")
    } catch (error) {
      toast.error("ERRO AO ATIVAR CARTILHA")
    }
  }

  async function handleDelete(programId: string) {
    if (!confirm("Deletar esta cartilha permanentemente?")) return
    
    try {
      await deleteProgramAction(programId)
      toast.success("CARTILHA DELETADA")
      await loadPrograms()
    } catch (error) {
      toast.error("ERRO AO DELETAR CARTILHA")
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff0033] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0b] text-white font-sans selection:bg-[#ff0033] noise-overlay pb-24">
      
      <header className="sticky top-0 z-30 bg-[#0a0a0b]/80 backdrop-blur-2xl border-b-2 border-black/50">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-neutral-600 group-hover:text-[#ff0033] transition-all" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-neutral-500 group-hover:text-white transition-colors">VOLTAR</span>
          </Link>
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-[#ff0033]" />
            <span className="text-[9px] font-black text-[#ff0033] uppercase tracking-[0.3em] italic">CARTILHAS</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        
        <div className="bg-[#121214] border-2 border-black rounded-2xl p-4 md:p-6 relative overflow-hidden shadow-[6px_6px_0_0_#000]">
          <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
            <Sparkles className="w-16 h-16 text-[#ff0033]" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-white">
              CARTILHAS DE <br/><span className="text-[#ff0033]">TREINO.</span>
            </h1>
            <p className="text-neutral-700 font-black italic tracking-[0.1em] text-[10px] leading-none mt-2">
              GERADAS POR IA BRUTALISTA
            </p>
          </div>
        </div>

        <Button
          onClick={handleGenerateProgram}
          disabled={generating}
          className="w-full h-14 bg-[#ff0033] hover:bg-[#ff1100] text-white rounded-xl font-black text-lg cursor-pointer uppercase italic transition-all shadow-[6px_6px_0_0_#000000] border-2 border-black flex items-center justify-center gap-3"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              GERANDO CARTILHA...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              GERAR NOVA CARTILHA
            </>
          )}
        </Button>

        <div className="space-y-4">
          {programs.length === 0 ? (
            <div className="bg-[#121214] border-2 border-black rounded-2xl p-8 text-center">
              <p className="text-neutral-600 font-black italic uppercase tracking-widest text-sm">
                NENHUMA CARTILHA CRIADA
              </p>
            </div>
          ) : (
            programs.map((program) => (
              <div
                key={program.id}
                className="bg-[#121214] border-2 border-black rounded-2xl p-4 md:p-6 relative overflow-hidden shadow-[6px_6px_0_0_#000] hover:border-[#ff0033]/20 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white">
                        {program.name}
                      </h2>
                      {program.description && (
                        <p className="text-neutral-500 font-bold italic text-sm mt-1">
                          {program.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(program.id)}
                      className="text-neutral-600 hover:text-[#ff0033] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" strokeWidth={3} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {program.goal && (
                      <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
                        <Target className="w-3 h-3 text-[#ff0033]" />
                        <span className="text-[9px] font-black uppercase tracking-wide text-neutral-400 italic">
                          {program.goal}
                        </span>
                      </div>
                    )}
                    {program.duration && (
                      <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-[#ff0033]" />
                        <span className="text-[9px] font-black uppercase tracking-wide text-neutral-400 italic">
                          {program.duration}
                        </span>
                      </div>
                    )}
                    <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
                      <Dumbbell className="w-3 h-3 text-[#ff0033]" />
                      <span className="text-[9px] font-black uppercase tracking-wide text-neutral-400 italic">
                        {program.workoutPlans.length} TREINOS
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSetActive(program.id)}
                    disabled={activeId === program.id}
                    className={`w-full h-12 rounded-xl font-black text-base cursor-pointer uppercase italic transition-all border-2 border-black shadow-[4px_4px_0_0_#000] ${
                      activeId === program.id
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-white hover:bg-neutral-100 text-black"
                    }`}
                  >
                    {activeId === program.id ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        CARTILHA ATIVA
                      </>
                    ) : (
                      "ATIVAR CARTILHA"
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
