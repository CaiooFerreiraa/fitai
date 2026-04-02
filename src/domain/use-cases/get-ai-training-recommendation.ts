import groq from "@/lib/groq"
import prisma from "@/infrastructure/database/prisma"

export class GetAiTrainingRecommendationUseCase {
  async execute(userId: string): Promise<string> {
    // Fetch user profile for personalization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        weight: true,
        height: true,
        goal: true,
      }
    })

    const userName: string = user?.name || "recruta"
    const userGoal: string = user?.goal || "hipertrofia máxima"
    const userWeight: number | null = user?.weight || null
    const userHeight: number | null = user?.height || null

    const biometryContext: string = userWeight && userHeight 
      ? `${userName} pesa ${userWeight}kg e tem ${userHeight}m de altura.` 
      : `Dados biométricos de ${userName} não disponíveis.`

    const systemPrompt: string = `Você é um doutor em fisiologia do exercício e treinador elite.
Sua missão é recomendar um ajuste ou cartilha de treino baseada em artigos científicos renomados e recentes (ex: Schoenfeld, Brad).
Seja técnico mas direto. Explique o porquê da recomendação (ex: volume de treino, frequência, hipertrofia sarcoplasmática vs miofibrilar).
SEMPRE chame o atleta pelo nome: ${userName}.
Mesmo sendo técnico, mantenha a personalidade do app: seja agressivo no final e diga para ${userName} parar de inventar desculpas.
Objetivo do atleta: ${userGoal}.
${biometryContext}`

    const userMessage: string = `Recomende uma estratégia de treino focada em ${userGoal} para ${userName}, um praticante natural.`

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        model: "llama-3.3-70b-versatile",
      })

      return completion.choices[0]?.message?.content || `Estude mais e treine mais, ${userName}.`
    } catch (error: unknown) {
      console.error("AI_RECOMMENDATION_ERROR:", error)
      return `Erro na recomendação, ${userName}. Mas você continua precisando treinar mais.`
    }
  }
}
