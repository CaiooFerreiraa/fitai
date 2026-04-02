"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, Crown, Check, Sparkles, Zap, Target, Lock } from "lucide-react"
import Link from "next/link"

export default function PremiumPage() {
  return (
    <div className="min-h-dvh bg-[#0a0a0b] text-white font-sans selection:bg-[#ff0033] noise-overlay">
      
      <header className="sticky top-0 z-30 bg-[#0a0a0b]/80 backdrop-blur-2xl border-b-2 border-black/50">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-neutral-600 group-hover:text-[#ff0033] transition-all" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-neutral-500 group-hover:text-white transition-colors">VOLTAR</span>
          </Link>
          <div className="flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-[#ff0033]" />
            <span className="text-[9px] font-black text-[#ff0033] uppercase tracking-[0.3em] italic">PREMIUM</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-8 py-12">
        
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-[#ff0033] to-[#9a0022] p-8 rounded-3xl shadow-[0_0_60px_rgba(255,0,51,0.3)]">
              <Crown className="w-16 h-16 text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none text-white">
            FITAI <span className="text-[#ff0033]">PREMIUM</span>
          </h1>
          <p className="text-neutral-500 font-bold italic text-base md:text-lg max-w-md mx-auto">
            Desbloqueie o poder completo da inteligência artificial brutalista.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#1c1c1f] to-[#0a0a0b] border-4 border-black rounded-3xl p-8 md:p-12 shadow-[12px_12px_0_0_#000] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
            <Sparkles className="w-32 h-32 text-[#ff0033]" />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="text-center space-y-2">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl md:text-7xl font-black italic tracking-tighter text-white">R$ 15</span>
                <span className="text-2xl font-black uppercase italic text-neutral-600">/mês</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-700 italic">FATURAMENTO MENSAL</p>
            </div>

            <div className="space-y-4">
              <Feature icon={<Sparkles className="w-5 h-5" />} text="IA Coach Ilimitada" />
              <Feature icon={<Target className="w-5 h-5" />} text="Cartilhas Personalizadas" />
              <Feature icon={<Zap className="w-5 h-5" />} text="Feedback Agressivo em Tempo Real" />
              <Feature icon={<Check className="w-5 h-5" />} text="Análise de Performance Completa" />
            </div>

            <div className="pt-6">
              <Button 
                disabled
                className="w-full h-16 bg-neutral-800 text-neutral-600 font-black uppercase italic text-xl rounded-2xl border-4 border-black shadow-[8px_8px_0_0_#000] cursor-not-allowed opacity-60"
              >
                <Crown className="w-6 h-6 mr-3" strokeWidth={4} />
                EM BREVE · PAGAMENTO VIA PIX
              </Button>
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-neutral-700 italic mt-4">
                INTEGRAÇÃO COM ABACATEPAY · ATIVAÇÃO AUTOMÁTICA
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#121214] border-2 border-black rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="bg-[#ff0033]/10 p-3 rounded-xl border border-[#ff0033]/20">
              <Lock className="w-6 h-6 text-[#ff0033]" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-black uppercase italic tracking-tight text-white">
                POR QUE PREMIUM?
              </h3>
              <p className="text-sm text-neutral-500 font-bold italic leading-relaxed">
                A IA Coach utiliza modelos de linguagem avançados (Groq) com custo por requisição. 
                O plano Premium garante acesso ilimitado sem compromissos longos.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
      <div className="bg-[#ff0033] p-2 rounded-lg">
        {icon}
      </div>
      <span className="text-base font-black uppercase italic tracking-tight text-white">
        {text}
      </span>
    </div>
  )
}
