"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { getAiCoachAdviceAction, getAiCoachWelcomeAction } from "@/actions/workout-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Zap, Send, Loader2, Target, ShieldAlert, Activity, Lock, Crown } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Message {
  role: "coach" | "user"
  text: string
}

export default function AiCoachPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get welcome message - premium users get full AI, non-premium get motivational message
    getAiCoachAdviceAction().then(res => {
      setMessages([{ role: "coach", text: res }])
      setIsInitialLoading(false)
      setIsPremium(true)
    }).catch((error: Error) => {
      if (error.message === "PREMIUM_REQUIRED") {
        setIsPremium(false)
        // Get motivational welcome for non-premium
        getAiCoachWelcomeAction().then(msg => {
          setMessages([{ role: "coach", text: msg }])
        })
      } else {
        setIsInitialLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSendMessage() {
    if (!inputValue.trim() || isLoading || !isPremium) return

    const userText = inputValue.trim()
    setInputValue("")
    setMessages(prev => [...prev, { role: "user", text: userText }])
    setIsLoading(true)

    try {
      const response = await getAiCoachAdviceAction(userText)
      setMessages(prev => [...prev, { role: "coach", text: response }])
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "PREMIUM_REQUIRED") {
        toast.error("ACESSO NEGADO", {
          description: "APENAS USUÁRIOS PREMIUM TÊM ACESSO À IA."
        })
      } else {
        toast.error("ERRO DE COMUNICAÇÃO", {
          description: "O COMANDO CENTRAL ESTÁ INSTÁVEL. TENTE NOVAMENTE."
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0b] text-white font-sans selection:bg-[#ff0033] noise-overlay flex flex-col">
      
      <header className="relative z-30 sticky top-0 bg-[#0a0a0b]/80 backdrop-blur-2xl border-b-2 border-black/50">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-neutral-600 group-hover:text-[#ff0033] transition-all" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-neutral-500 group-hover:text-white transition-colors">ABORTAR MISSÃO</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff0033] animate-ping" />
            <span className="text-[9px] font-black text-[#ff0033] uppercase tracking-[0.3em] italic">CANAL DO CHIEF COACH</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col gap-4 overflow-hidden">
        
        <div className="shrink-0 bg-[#121214] border-2 border-black rounded-2xl p-4 md:p-6 relative overflow-hidden shadow-[6px_6px_0_0_#000]">
           <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
             <ShieldAlert className="w-16 h-16 text-[#ff0033]" />
           </div>
           <div className="relative z-10">
             <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-white">
               CONSULTA DE <br/><span className="text-[#ff0033]">ESTRATÉGIA.</span>
             </h1>
             <p className="text-neutral-700 font-black italic uppercase tracking-[0.1em] text-[10px] leading-none mt-2">
               ESTADO ATUAL: <span className="text-green-500">CONECTADO AO COMANDO CENTRAL</span>
             </p>
           </div>
        </div>

        <div className="flex-1 bg-black/40 border-2 border-black rounded-2xl p-4 md:p-6 flex flex-col gap-4 overflow-y-auto relative" ref={scrollRef} style={{ maxHeight: "calc(100vh - 280px)" }}>
          {!isPremium && !isInitialLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-gradient-to-b from-black/95 via-black/90 to-black/95">
              <div className="text-center space-y-6 p-8 relative z-10">
                <div className="flex justify-center">
                  <div className="bg-[#ff0033] p-6 rounded-2xl shadow-[0_0_40px_rgba(255,0,51,0.4)]">
                    <Lock className="w-12 h-12 text-white" strokeWidth={4} />
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">
                    ACESSO <span className="text-[#ff0033]">BLOQUEADO</span>
                  </h2>
                  <p className="text-neutral-400 font-bold italic text-sm max-w-xs mx-auto">
                    A IA Coach é exclusiva para membros Premium.
                  </p>
                </div>
                <Link href="/premium" className="block">
                  <Button className="bg-[#ff0033] hover:bg-[#ff1100] text-white font-black uppercase italic text-base px-8 h-12 rounded-xl border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer">
                    <Crown className="w-5 h-5 mr-2" />
                    VER PLANO PREMIUM
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          {isInitialLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-[#ff0033] animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-800 italic">ACESSANDO DADOS DO RECRUTA...</span>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div 
                key={i}
                className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div className={`flex items-center gap-2 mb-1`}>
                   <div className={`w-1 h-1 rounded-full ${msg.role === "user" ? "bg-white" : "bg-[#ff0033]"}`} />
                   <span className="text-[8px] font-black uppercase italic tracking-widest text-neutral-600">
                     {msg.role === "user" ? "RECRUTA" : "CHIEF COACH"}
                   </span>
                </div>
                <div className={cn(
                  "p-4 md:p-5 rounded-xl border-2 font-black italic tracking-tight leading-relaxed",
                  msg.role === "user" 
                    ? "bg-[#1c1c1f] border-neutral-800 text-white shadow-[4px_4px_0_0_#000] text-base md:text-lg" 
                    : "bg-[#121214] border-[#ff0033]/20 text-[#ff0033] shadow-[4px_4px_0_0_#000000] text-lg md:text-xl"
                )}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {isLoading && (
             <div className="mr-auto items-start flex flex-col gap-1">
                <div className="flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-[#ff0033] animate-ping" />
                   <span className="text-[8px] font-black uppercase italic tracking-widest text-neutral-600">PENSANDO EM COMO TE HUMILHAR...</span>
                </div>
                <div className="bg-[#121214] border-2 border-[#ff0033]/20 p-3 rounded-xl animate-pulse">
                   <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-[#ff0033] rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-[#ff0033] rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-[#ff0033] rounded-full animate-bounce" />
                   </div>
                </div>
             </div>
          )}
        </div>

        <div className="shrink-0 flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="E AI, MAROMBA! VAMO TREINAR? 💪"
            disabled={isLoading || isInitialLoading || !isPremium}
            className="h-12 md:h-14 bg-black border-2 border-black focus-visible:border-[#ff0033] focus-visible:ring-0 rounded-xl md:rounded-2xl font-black italic uppercase italic tracking-tighter transition-all px-4 md:px-6 shadow-[4px_4px_0_0_#000]"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || isInitialLoading || !inputValue.trim() || !isPremium}
            className="w-12 h-12 md:w-14 md:h-14 bg-[#ff0033] hover:bg-[#ff1100] border-2 border-black rounded-xl md:rounded-2xl shadow-[4px_4px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center p-0 disabled:opacity-40"
          >
            <Send className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={4} />
          </Button>
        </div>
      </main>

      <footer className="shrink-0 p-4 pb-8 md:pb-6 opacity-30 pointer-events-none">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
           <div className="h-[1px] flex-1 bg-gradient-to-l from-neutral-800 to-transparent" />
           <span className="text-[7px] font-black uppercase tracking-[0.6em] italic text-neutral-700">PROTOCOLO DE COMUNICAÇÃO ALPHA-1</span>
           <div className="h-[1px] flex-1 bg-gradient-to-r from-neutral-800 to-transparent" />
        </div>
      </footer>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
