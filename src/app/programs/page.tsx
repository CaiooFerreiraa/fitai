"use client"

import { useState, useEffect } from "react"
import { listTrainingProgramsAction, setActiveProgramAction, deleteProgramAction, generateTrainingProgramAction } from "@/actions/program-actions"
import { DAY_LABELS_PT } from "@/domain/entities/workout"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Loader2, Target, CheckCircle2, Trash2, Sparkles, Calendar, Dumbbell, ChevronDown, ChevronUp, Clock, Hash, AlertTriangle, X } from "lucide-react"
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
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<string | null>(null)

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
      toast.success("CARTILHA ATIVADA", {
        description: "Treinos aplicados nos dias da semana."
      })
    } catch (error) {
      toast.error("ERRO AO ATIVAR CARTILHA")
    }
  }

  async function handleDelete(programId: string) {
    setProgramToDelete(programId)
    setDeleteDialogOpen(true)
  }

  async function confirmDelete() {
    if (!programToDelete) return
    
    try {
      await deleteProgramAction(programToDelete)
      toast.success("CARTILHA DELETADA", {
        description: "Programa de treino removido com sucesso."
      })
      await loadPrograms()
    } catch (error) {
      toast.error("ERRO AO DELETAR CARTILHA")
    } finally {
      setDeleteDialogOpen(false)
      setProgramToDelete(null)
    }
  }

  function toggleExpand(programId: string) {
    setExpandedPrograms(prev => {
      const newSet = new Set(prev)
      if (newSet.has(programId)) {
        newSet.delete(programId)
      } else {
        newSet.add(programId)
      }
      return newSet
    })
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

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        
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
          className="w-full h-12 sm:h-14 bg-[#ff0033] hover:bg-[#ff1100] text-white rounded-xl font-black text-base sm:text-lg cursor-pointer uppercase italic transition-all shadow-[6px_6px_0_0_#000000] border-2 border-black flex items-center justify-center gap-3"
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

        <div className="space-y-3 sm:space-y-4">{programs.length === 0 ? (
            <div className="bg-[#121214] border-2 border-black rounded-2xl p-6 sm:p-8 text-center">
              <p className="text-neutral-600 font-black italic uppercase tracking-widest text-xs sm:text-sm">
                NENHUMA CARTILHA CRIADA
              </p>
            </div>
          ) : (
            programs.map((program) => (
              <div
                key={program.id}
                className="bg-[#121214] border-2 border-black rounded-2xl p-4 md:p-6 relative overflow-hidden shadow-[6px_6px_0_0_#000] hover:border-[#ff0033]/20 transition-all"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white">
                        {program.name}
                      </h2>
                      {program.description && (
                        <p className="text-neutral-500 font-bold italic text-xs sm:text-sm mt-1">
                          {program.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(program.id)}
                      className="text-neutral-600 hover:text-[#ff0033] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
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

                  {expandedPrograms.has(program.id) && (
                    <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                      {program.workoutPlans.map((workout) => (
                        <div
                          key={workout.id}
                          className="bg-black/40 border border-white/5 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xs sm:text-sm font-black uppercase italic text-white tracking-tight">
                                {DAY_LABELS_PT[workout.dayOfWeek as keyof typeof DAY_LABELS_PT] || workout.dayOfWeek}
                              </h3>
                              {workout.name && (
                                <p className="text-[10px] sm:text-xs font-bold text-neutral-500 mt-0.5">
                                  {workout.name}
                                </p>
                              )}
                            </div>
                            <span className="text-[8px] sm:text-[9px] font-black uppercase text-neutral-600 italic">
                              {workout.exercises.length} exercícios
                            </span>
                          </div>

                          <div className="space-y-1.5 sm:space-y-2">
                            {workout.exercises.sort((a, b) => a.order - b.order).map((exercise) => (
                              <div
                                key={exercise.id}
                                className="bg-black/40 border border-white/10 rounded-lg p-2.5 sm:p-3 space-y-1.5 sm:space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-xs sm:text-sm font-black text-white uppercase italic">
                                    {exercise.name}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                  <div className="flex items-center gap-1 sm:gap-1.5 bg-black/60 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-white/5">
                                    <Hash className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#ff0033]" />
                                    <span className="text-[9px] sm:text-[10px] font-black text-neutral-400 uppercase">
                                      {exercise.sets}x{exercise.reps}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 sm:gap-1.5 bg-black/60 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-white/5">
                                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#ff0033]" />
                                    <span className="text-[9px] sm:text-[10px] font-black text-neutral-400 uppercase">
                                      {exercise.timer}s
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => toggleExpand(program.id)}
                    className="w-full h-9 sm:h-10 bg-black/40 hover:bg-black/60 text-white border border-white/10 rounded-xl font-black text-[10px] sm:text-xs uppercase italic transition-all"
                  >
                    {expandedPrograms.has(program.id) ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        OCULTAR EXERCÍCIOS
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        VER EXERCÍCIOS
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleSetActive(program.id)}
                    disabled={activeId === program.id}
                    className={`w-full h-11 sm:h-12 rounded-xl font-black text-sm sm:text-base cursor-pointer uppercase italic transition-all border-2 border-black shadow-[4px_4px_0_0_#000] ${
                      activeId === program.id
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-white hover:bg-neutral-100 text-black"
                    }`}
                  >
                    {activeId === program.id ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
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

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121214] border-4 border-black rounded-2xl p-6 max-w-md w-full shadow-[12px_12px_0_0_#000] animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[#ff0033]/10 p-3 rounded-xl border-2 border-[#ff0033]/20">
                <AlertTriangle className="w-6 h-6 text-[#ff0033]" strokeWidth={3} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-2">
                  OPERAÇÃO IRREVERSÍVEL
                </h3>
                <p className="text-sm font-bold text-neutral-400 leading-relaxed">
                  Deletar esta cartilha permanentemente? Todos os treinos associados serão perdidos.
                </p>
              </div>
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="text-neutral-600 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1 h-12 bg-[#1c1c1f] hover:bg-[#2c2c2f] border-2 border-black text-white rounded-xl font-black uppercase italic text-sm transition-all shadow-[4px_4px_0_0_#000]"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="flex-1 h-12 bg-[#ff0033] hover:bg-[#ff1100] border-2 border-black text-white rounded-xl font-black uppercase italic text-sm transition-all shadow-[4px_4px_0_0_#000] active:translate-y-0.5"
              >
                Deletar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
