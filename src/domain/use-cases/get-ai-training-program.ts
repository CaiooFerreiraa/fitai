import groq from "@/lib/groq"
import prisma from "@/infrastructure/database/prisma"

interface UserProfile {
  name: string | null
  weight: number | null
  height: number | null
  goal: string | null
}

interface WorkoutDay {
  dayOfWeek: string
  name: string
  exercises: Array<{
    name: string
    sets: number
    reps: number
    timer: number
    order: number
  }>
}

interface TrainingProgramStructure {
  name: string
  description: string
  goal: string
  duration: string
  workouts: WorkoutDay[]
}

export class GetAiTrainingProgramUseCase {
  async execute(userId: string): Promise<TrainingProgramStructure> {
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
    const userGoal: string = user?.goal || "hipertrofia geral"
    const userWeight: number | null = user?.weight || null
    const userHeight: number | null = user?.height || null

    const biometryContext: string = userWeight && userHeight 
      ? `${userName} pesa ${userWeight}kg e tem ${userHeight}m de altura.` 
      : `Dados biométricos de ${userName} não disponíveis.`

    const systemPrompt: string = `Você é um especialista em periodização de treino e treinador de elite.
Sua missão é criar uma cartilha de treino completa e estruturada para ${userName}.
Objetivo: ${userGoal}.
${biometryContext}

RESPONDA APENAS COM UM JSON VÁLIDO (sem markdown, sem explicações extras) no seguinte formato:
{
  "name": "Nome da Cartilha",
  "description": "Descrição curta e técnica (máximo 30 palavras)",
  "goal": "${userGoal}",
  "duration": "Duração sugerida (ex: 4 semanas, 8 semanas)",
  "workouts": [
    {
      "dayOfWeek": "Segunda",
      "name": "Nome do Treino (ex: Peito e Tríceps)",
      "exercises": [
        {
          "name": "Nome do exercício",
          "sets": 4,
          "reps": 12,
          "timer": 90,
          "order": 0
        }
      ]
    }
  ]
}

Regras:
- Crie 4-6 treinos por semana (Segunda a Sábado)
- Cada treino deve ter 4-7 exercícios
- Timer: 60-120 segundos entre séries
- Baseie-se em evidências científicas (Schoenfeld, Helms, etc)
- Use nomenclatura brasileira para exercícios`

    const userMessage: string = `Crie uma cartilha de treino completa para ${userName} focada em ${userGoal}. Retorne APENAS o JSON, sem formatação markdown.`

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
      })

      const rawResponse: string = completion.choices[0]?.message?.content || ""
      
      // Remove markdown code blocks if present
      const jsonString: string = rawResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()

      const program: TrainingProgramStructure = JSON.parse(jsonString)
      
      return program
    } catch (error: unknown) {
      console.error("AI_TRAINING_PROGRAM_ERROR:", error)
      throw new Error(`Erro ao gerar cartilha: ${error instanceof Error ? error.message : "desconhecido"}`)
    }
  }
}
