import groq from "@/lib/groq"
import { PrismaLogRepository } from "@/infrastructure/repositories/prisma-log-repository"
import prisma from "@/infrastructure/database/prisma"

export class GetAiIncentiveUseCase {
  constructor(private logRepository: PrismaLogRepository = new PrismaLogRepository()) {}

  async execute(userId: string, currentWeight: number, exerciseId: string): Promise<string> {
    const historicalStats = await this.logRepository.getRecentStats(userId, exerciseId)
    
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
    const userGoal: string = user?.goal || "evolução geral"
    const userWeight: number | null = user?.weight || null
    const userHeight: number | null = user?.height || null
    
    // Check for progress
    const previousWeight: number = historicalStats.length > 0 ? historicalStats[0].weight : 0
    const progress: boolean = currentWeight > previousWeight

    const biometryContext: string = userWeight && userHeight 
      ? `O atleta pesa ${userWeight}kg e tem ${userHeight}m de altura.` 
      : ""

    const systemPrompt: string = `Você é um assistente de academia agressivo e engraçado. 
Sua missão é incentivar o atleta chamando-o pelo nome "${userName}" e debochando se ele não estiver progredindo carga ou intensidade. 
Use gírias de academia brasileira. O incentivo deve ser curto e impactante (máximo 20 palavras). 
Nunca seja bonzinho. Se for progresso, pode dar um elogio sarcástico. 
Se não houve evolução, critique a 'fisioterapia' que ele está fazendo.
Objetivo do atleta: ${userGoal}.
${biometryContext}
Exemplo: "Iae ${userName}, vai ficar nessa fisioterapia até quando?"`

    const userMessage: string = progress 
      ? `${userName} aumentou o peso de ${previousWeight}kg para ${currentWeight}kg no exercício.` 
      : `${userName} manteve ou diminuiu o peso (${currentWeight}kg). O recorde anterior era ${previousWeight}kg.`

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        model: "llama-3.3-70b-versatile", // Versatile model on Groq
      })

      return completion.choices[0]?.message?.content || `Sem palavras pra sua vergonha, ${userName}.`
    } catch (error: unknown) {
      console.error("AI_INCENTIVE_ERROR:", error)
      return `Groq tá offline, mas eu continuo te achando fraco, ${userName}.`
    }
  }
}
