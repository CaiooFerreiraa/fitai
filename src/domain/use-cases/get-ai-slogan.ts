import groq from "@/lib/groq"

export type SloganContext = 
  | "home_subtitle" 
  | "home_workout_day" 
  | "profile_quote"
  | "session_finish"

export class GetAiSloganUseCase {
  async execute(context: SloganContext): Promise<string> {
    const contextPrompts: Record<SloganContext, string> = {
      home_subtitle: "Uma frase de impacto motivacional agressiva e curta para a home. Ex: QUEBRE SEUS LIMITES OU VOLTE PARA CASA.",
      home_workout_day: "Uma frase para indicar o treino do dia. Ex: TREINO DE HOJE: DESTRUIÇÃO DE FIBRAS.",
      profile_quote: "Uma citação motivacional de academia extremamente agressiva e curta para o perfil. Chame o usuário de frango se necessário.",
      session_finish: "Uma frase para quando o treino é finalizado. Ex: MISSÃO CUMPRIDA COM HONRA."
    }

    const systemPrompt = `Você é um redator de uma marca de suplementos hardcore e academia brutalista. 
Sua linguagem é agressiva, militar, direta e focada em resultados extremos. 
Use gírias de academia brasileira (maromba, frango, fibra, etc). 
Gere apenas a frase, sem aspas, sem explicações. No máximo 4 palavras.`

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: contextPrompts[context] }
        ],
        model: "llama-3.3-70b-versatile",
      })

      return completion.choices[0]?.message?.content?.toUpperCase() || "PROTOCOLO PADRÃO"
    } catch (error) {
       console.error("AI_SLOGAN_ERROR:", error)
       // Fallbacks based on context
       const fallbacks: Record<SloganContext, string> = {
         home_subtitle: "QUEBRE SEUS LIMITES OU SAIA",
         home_workout_day: "TREINO DO DIA",
         profile_quote: "PARE DE INVENTAR DESCULPAS E TREINE.",
         session_finish: "MISSÃO CUMPRIDA"
       }
       return fallbacks[context]
    }
  }
}
