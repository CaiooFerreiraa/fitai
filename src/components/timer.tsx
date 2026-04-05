"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, Activity, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export function Timer({ initialTime, onComplete }: { initialTime: number; onComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isFinished, setIsFinished] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsFinished(true)
      // Auto-dismiss after 1.2s so the user sees the "esgotou" state briefly
      const dismiss = setTimeout(() => {
        onCompleteRef.current()
      }, 1200)
      return () => clearTimeout(dismiss)
    }

    const id = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(id)
  }, [timeLeft])

  const progress = (timeLeft / initialTime) * 100
  const mins = Math.floor(timeLeft / 60)
  const secs = (timeLeft % 60).toString().padStart(2, "0")
  const isUrgent = timeLeft <= 10 && !isFinished

  return (
    <div className="relative w-full mx-auto">

      {/* Aura glow */}
      <div className={cn(
        "absolute inset-0 blur-[60px] transition-all duration-1000 pointer-events-none rounded-full -z-10",
        isFinished ? "bg-[#ff0033]/20 animate-pulse" : isUrgent ? "bg-[#ff0033]/10" : "bg-[#ff0033]/04"
      )} />

      <div className={cn(
        "bg-[#121214] border-2 border-black rounded-2xl p-5 sm:p-8 text-center shadow-[8px_8px_0_0_#000] relative overflow-hidden transition-all duration-500",
        isFinished && "border-[#ff0033]/40",
        isUrgent && "border-[#ff0033]/20"
      )}>

        {/* Progress bar — top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-black/40">
          <div
            className={cn(
              "h-full transition-all duration-1000 ease-linear shadow-[0_0_8px_#ff0033]",
              isFinished ? "bg-[#ff0033] opacity-30" : "bg-[#ff0033]"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Decorative icons */}
        <div className="absolute top-3 left-4 opacity-[0.07] pointer-events-none">
          <Activity className="w-6 h-6 text-[#ff0033]" />
        </div>
        <div className="absolute bottom-3 right-4 opacity-[0.07] pointer-events-none">
          <Zap className="w-6 h-6 text-[#ff0033]" />
        </div>

        {/* Label */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={cn(
            "p-1.5 rounded-lg border-2 border-black/40 transition-colors",
            isFinished ? "bg-[#ff0033]/20" : "bg-[#ff0033]/10"
          )}>
            <Clock className={cn(
              "w-3.5 h-3.5",
              isFinished ? "text-[#ff0033] animate-pulse" : "text-[#ff0033]",
              isUrgent && "animate-pulse"
            )} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-600 italic">
            {isFinished ? "REPOUSO CONCLUÍDO" : "REPOUSO TÁTICO"}
          </span>
        </div>

        {/* Time display */}
        <div className={cn(
          "text-5xl sm:text-7xl font-black tracking-tighter tabular-nums leading-none transition-all duration-300 italic",
          isFinished ? "text-[#ff0033] scale-110 animate-pulse" : isUrgent ? "text-[#ff0033]" : "text-white"
        )}>
          {mins}:{secs}
        </div>

        {/* Status message */}
        <p className={cn(
          "mt-3 font-black italic uppercase tracking-widest text-[9px] sm:text-[10px] max-w-[220px] mx-auto leading-tight transition-colors",
          isFinished ? "text-[#ff0033]" : "text-neutral-600"
        )}>
          {isFinished ? "VOLTANDO AO ASSALTO..." : isUrgent ? "PREPARE-SE!" : "RECUPERANDO FIBRAS..."}
        </p>
      </div>
    </div>
  )
}
