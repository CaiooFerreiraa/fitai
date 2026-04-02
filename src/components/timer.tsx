"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Clock, ChevronRight, Activity, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export function Timer({ initialTime, onComplete }: { initialTime: number, onComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsFinished(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const progress = (timeLeft / initialTime) * 100

  return (
    <div className="relative group w-full max-w-[800px] mx-auto scale-90 md:scale-100">
      
      <div className={cn(
        "absolute inset-0 bg-[#ff0033]/5 blur-[80px] transition-all duration-1000 pointer-events-none rounded-full",
        isFinished ? "opacity-30 animate-pulse" : "opacity-5"
      )} />

      <div className="bg-[#121214] border-2 md:border-4 border-black rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-center transition-all shadow-[10px_10px_0_0_#000000] relative z-10 overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-black/30" />
        <div className="absolute top-4 left-6 opacity-10 pointer-events-none">
          <Activity className="w-8 h-8 text-[#ff0033]" />
        </div>
        <div className="absolute bottom-4 right-6 opacity-10 pointer-events-none">
          <Zap className="w-8 h-8 text-[#ff0033]" />
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={cn(
            "p-1.5 rounded-lg transition-colors border-2 border-black/40",
            isFinished ? "bg-red-500/15 text-red-500" : "bg-[#ff0033]/15 text-[#ff0033]"
          )}>
            <Clock className={cn("w-4 h-4", isFinished ? "animate-pulse" : "animate-spin-slow")} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 italic">REPOUSO TÁTICO</span>
        </div>
        
        <div className={cn(
          "text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter tabular-nums leading-none transition-all duration-500 italic",
          isFinished ? "text-red-500 scale-105" : "text-white"
        )}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </div>

        <div className="mt-8 space-y-6 relative z-10">
          <p className="text-neutral-600 font-black italic uppercase tracking-widest text-xs md:text-sm max-w-[240px] mx-auto leading-tight">
            {isFinished ? "O TEMPO ESGOTOU. VOLTE AO ASSALTO." : "RECUPERANDO FIBRAS... PREPARE-SE."}
          </p>
          
          <Button 
            onClick={onComplete} 
            className="w-full h-14 md:h-16 bg-[#ff0033] hover:bg-[#ff1100] text-white text-lg md:text-xl font-black uppercase italic rounded-xl md:rounded-2xl cursor-pointer transition-all active:translate-y-1 active:shadow-none shadow-[6px_6px_0_0_#000] border-2 md:border-4 border-black group flex items-center justify-between px-8"
          >
            <span className="leading-none tracking-tighter relative z-10">VOLTAR À LUTA</span>
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-1.5 transition-transform" strokeWidth={5} />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/60">
           <div 
             className="h-full bg-[#ff0033] transition-all duration-1000 ease-linear shadow-[0_0_10px_#ff0033]" 
             style={{ width: `${progress}%` }}
           />
        </div>
      </div>
    </div>
  )
}
