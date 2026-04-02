"use client"

import { useEffect, useState } from "react"
import { getUserProfile, updateProfileAction } from "@/actions/profile-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NumberInput } from "@/components/ui/number-input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Save, Activity, Target, Sparkles, Scale, Ruler, Settings, User, Home, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getAiSlogansAction } from "@/actions/workout-actions"

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [randomQuote, setRandomQuote] = useState("")
  const [slogans, setSlogans] = useState<Record<string, string>>({
    profile_quote: "RECUPERANDO FIBRAS... PREPARE-SE."
  })

  const quotes = [
    "VOCÊ É UM FRANGO DISFARÇADO OU UMA MÁQUINA DE COMBATE? RESPONDA COM PESO.",
    "SEU CORPO É O ÚNICO TRIBUNAL QUE NÃO ACEITA SUBORNO. PAGUE COM SUOR.",
    "A GRAVIDADE É UMA LEI. SUPERÁ-LA É SEU DEVER. NÃO SEJA UM FORAGIDO.",
    "BEM-VINDO AO ABATEDOURO DE GORDURA. O FERRO NÃO TEM PIEDADE.",
    "DESCULPAS NÃO QUEIMAM CALORIAS. CALA A BOCA E TREINA."
  ]

  useEffect(() => {
    getUserProfile().then(p => {
      if (!p) router.push("/login")
      setProfile(p)
      setLoading(false)
      setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)])
      getAiSlogansAction(["profile_quote"]).then(setSlogans)
    })
  }, [router])

  if (loading || !profile) {
    return (
      <div className="min-h-dvh bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#ff0033] w-12 h-12" strokeWidth={4} />
      </div>
    )
  }

  const weight = profile.weight || 0
  const height = profile.height || 0
  const bmi = weight > 0 && height > 0 ? (weight / (height * height)).toFixed(1) : "N/A"

  const bmiNum = Number(bmi)
  const bmiStatus = !isNaN(bmiNum) && bmiNum > 0
    ? bmiNum < 18.5 ? "RECRUTA DESNUTRIDO" : bmiNum < 25 ? "UNIDADE DE COMBATE" : "TANKER DE ELITE"
    : "INDEFINIDO"

  async function handleAction(formData: FormData) {
    setIsSaving(true)
    try {
      await updateProfileAction(formData)
      toast.success("BIOMETRIA ATUALIZADA", {
        description: "UPGRADE OPERACIONAL CONCLUÍDO COM SUCESSO."
      })
      const updated = await getUserProfile()
      setProfile(updated)
    } catch {
      toast.error("FALHA NO UPGRADE", {
        description: "ERRO CRÍTICO AO SALVAR DADOS. TENTE NOVAMENTE."
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0b] text-white font-sans noise-overlay">

      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute top-1/4 -left-1/4 w-[80vw] h-[80vw] bg-[#ff0033] opacity-[0.03] blur-[200px] rounded-full" />
      </div>

      <div className="bg-watermark text-[10rem] opacity-[0.02]" aria-hidden>BIO-ID</div>

      <header className="relative z-20 sticky top-0 bg-[#0a0a0b]/90 backdrop-blur-2xl border-b-2 border-black shadow-[0_5px_20px_rgba(0,0,0,0.8)]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-neutral-600 group-hover:text-[#ff0033] group-hover:-translate-x-1 transition-all" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-neutral-500 group-hover:text-white transition-colors">VOLTAR À BASE</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff0033] animate-ping" />
            <span className="text-[9px] font-black text-[#ff0033] uppercase tracking-[0.3em] italic">REGISTRO BIOMÉTRICO</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-32 lg:pb-12">

        <div className="mb-6 md:mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none text-white">
            FICHA<br />
            <span className="text-[#ff0033]">TÁTICA.</span>
          </h1>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] italic mt-1.5">
            STATUS: <span className="text-[#ff0033]">{bmiStatus}</span>
          </p>
        </div>

        <form action={handleAction}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

            <div className="lg:col-span-3 space-y-4 md:space-y-6">
              <div className="bg-[#121214] border-2 md:border-4 border-black rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 lg:p-10 shadow-[8px_8px_0_0_#000] md:shadow-[12px_12px_0_0_#000] relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#ff0033] to-transparent opacity-30" />
                
                <div className="flex items-center gap-3 pb-4 border-b-2 border-black mb-6">
                  <div className="bg-[#ff0033]/10 p-2 rounded-xl border border-[#ff0033]/20">
                    <Target className="w-4 h-4 text-[#ff0033]" strokeWidth={4} />
                  </div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] italic text-neutral-500">IDENTIFICAÇÃO DE COMBATENTE</h2>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2 group">
                    <Label htmlFor="name" className="flex items-center gap-2 text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] group-focus-within:text-[#ff0033] transition-colors italic">
                      <div className="w-1 h-1 rounded-full bg-[#ff0033]" />
                      CODINOME DE ALTA PRIORIDADE
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={profile.name || ""}
                      className="h-12 md:h-14 bg-black/50 border-2 border-black focus:border-[#ff0033] focus-visible:ring-0 text-xl md:text-2xl font-black uppercase tracking-tight rounded-xl md:rounded-2xl px-4 md:px-6 cursor-text italic transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-black/40 rounded-xl md:rounded-2xl border-2 border-black">
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="flex items-center gap-2 text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] italic">
                        <Scale className="w-3.5 h-3.5 text-[#ff0033] shrink-0" strokeWidth={4} />
                        MASSA (KG)
                      </Label>
                      <NumberInput
                        id="weight"
                        name="weight"
                        step={0.1}
                        defaultValue={profile.weight || ""}
                        placeholder="70.5"
                        className="h-11 md:h-12 text-xl italic rounded-lg md:rounded-xl border-2 border-black bg-[#0a0a0b] focus:border-[#ff0033]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height" className="flex items-center gap-2 text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] italic">
                        <Ruler className="w-3.5 h-3.5 text-[#ff0033] shrink-0" strokeWidth={4} />
                        ALTURA (M)
                      </Label>
                      <NumberInput
                        id="height"
                        name="height"
                        step={0.01}
                        defaultValue={profile.height || ""}
                        placeholder="1.75"
                        className="h-11 md:h-12 text-xl italic rounded-lg md:rounded-xl border-2 border-black bg-[#0a0a0b] focus:border-[#ff0033]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="goal" className="flex items-center gap-2 text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] group-focus-within:text-[#ff0033] transition-colors italic">
                      <div className="w-1 h-1 rounded-full bg-[#ff0033]" />
                      OBJETIVO TÁTICO PRIMÁRIO
                    </Label>
                    <Input
                      id="goal"
                      name="goal"
                      defaultValue={profile.goal || ""}
                      placeholder="EX: ERRADICAÇÃO DE TECIDO ADIPOSO"
                      className="h-12 bg-black/50 border-2 border-black focus:border-[#ff0033] focus-visible:ring-0 text-sm md:text-base font-black uppercase rounded-xl md:rounded-2xl px-4 md:px-6 cursor-text italic transition-all"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="w-full h-14 md:h-16 bg-[#ff0033] hover:bg-[#ff1100] text-white rounded-xl md:rounded-2xl font-black text-lg md:text-xl uppercase italic tracking-tighter cursor-pointer transition-all active:translate-x-1 active:translate-y-1 active:shadow-none shadow-[6px_6px_0_0_#000] border-2 md:border-4 border-black flex items-center justify-between px-6 md:px-10 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {isSaving ? (
                    <span className="flex items-center gap-3 relative z-10 text-sm"><Loader2 className="animate-spin w-4 h-4" /> PROCESSANDO...</span>
                ) : (
                    <>
                        <span className="relative z-10">UPGRADE OPERACIONAL</span>
                        <Save className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform shrink-0 relative z-10" strokeWidth={4} />
                    </>
                )}
              </Button>
            </div>

            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="bg-gradient-to-br from-[#ff0033] via-[#d00028] to-[#7a0015] rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 border-2 md:border-4 border-black shadow-[8px_8px_0_0_#000] md:shadow-[12px_12px_0_0_#000] relative overflow-hidden group cursor-default">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />
                <div className="absolute -bottom-6 -right-6 opacity-[0.04] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 pointer-events-none">
                  <Scale className="w-32 h-32 md:w-48 md:h-48" strokeWidth={6} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/50 italic">ANÁLISE DE DENSIDADE</p>
                      </div>
                      <p className="text-base md:text-lg font-black uppercase italic text-white leading-none tracking-tighter">ÍNDICE DE MASSA</p>
                    </div>
                  </div>

                  <div className="text-7xl md:text-8xl font-black text-black leading-none tracking-[-0.05em] italic select-none -ml-1 drop-shadow-[0_8px_15px_rgba(0,0,0,0.3)]">
                    {bmi === "N/A" ? "??" : bmi}
                  </div>

                  <div className="bg-black/30 rounded-xl p-3 md:p-4 mt-3 border border-white/10">
                    <p className="text-[8px] md:text-[9px] font-black text-white/70 uppercase italic leading-tight tracking-tight">
                      SEU VALOR NÃO É DEFINIDO POR UM CÁLCULO ESTÁTICO, MAS PELA AGRESSIVIDADE QUE VOCÊ EMPREGA NO CAMPO.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#121214] border-2 md:border-4 border-black rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-[8px_8px_0_0_#000] relative overflow-hidden group hover:border-[#ff0033]/30 transition-all">
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#ff0033] flex items-center justify-center rounded-xl border-2 md:border-4 border-black shadow-[0_5px_15px_-5px_rgba(255,0,51,0.5)] group-hover:scale-110 transition-transform">
                      <Activity className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={4} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em] italic">LOG DE COMANDO</p>
                      <span className="font-black italic text-base md:text-lg tracking-tighter uppercase text-white">CHIEF COACH</span>
                    </div>
                  </div>

                  <p className="text-sm md:text-lg font-black uppercase italic leading-[0.95] text-neutral-500 tracking-tighter group-hover:text-white transition-colors">
                    &ldquo;{slogans.profile_quote || randomQuote}&rdquo;
                  </p>

                  <div className="pt-3 border-t-2 border-black flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ff0033] animate-pulse shadow-[0_0_8px_#ff0033]" />
                    <p className="text-[8px] font-black text-neutral-700 uppercase tracking-[0.4em] italic">EM OBSERVAÇÃO CRÍTICA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <nav className="bottom-nav lg:hidden" aria-label="Navegação">
        <BottomNavLink href="/" icon={<Home className="w-5 h-5" strokeWidth={3} />} label="Home" />
        <div className="w-px h-8 bg-[#1c1c1f]" />
        <BottomNavLink href="/config" icon={<Settings className="w-5 h-5 group-hover:rotate-90 transition-transform" strokeWidth={3} />} label="Config" />
        <div className="w-px h-8 bg-[#1c1c1f]" />
        <BottomNavLink href="/profile" icon={<User className="w-5 h-5" strokeWidth={3} />} label="Perfil" active />
      </nav>
    </div>
  )
}

function BottomNavLink({
  href, icon, label, active
}: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
      <div className={`p-3 rounded-2xl transition-all ${active ? "bg-[#ff0033] border-4 border-black shadow-[4px_4px_0_0_#000] text-white" : "text-neutral-600 hover:text-[#ff0033]"}`}>
        {icon}
      </div>
      <span className={`text-[8px] font-black uppercase tracking-widest italic transition-colors ${active ? "text-[#ff0033]" : "text-neutral-700 group-hover:text-[#ff0033]"}`}>{label}</span>
    </Link>
  )
}
