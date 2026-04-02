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

interface TrainingOptions {
  experienceLevel?: string
  trainingLocation?: string
  daysPerWeek?: number
}

export class GetAiTrainingProgramUseCase {
  async execute(userId: string, options?: TrainingOptions): Promise<TrainingProgramStructure> {
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

    // Extract training parameters
    const experienceLevel: string = options?.experienceLevel || "intermediário"
    const trainingLocation: string = options?.trainingLocation || "academia"
    const daysPerWeek: number = options?.daysPerWeek || 5

    const biometryContext: string = userWeight && userHeight 
      ? `${userName} pesa ${userWeight}kg e tem ${userHeight}m de altura.` 
      : `Dados biométricos de ${userName} não disponíveis.`

    const trainingContext: string = `Nível: ${experienceLevel}. Local: ${trainingLocation}. Frequência: ${daysPerWeek} dias/semana.`

    const systemPrompt: string = `Você é um especialista em periodização de treino e treinador de elite.
Sua missão é criar uma cartilha de treino completa e estruturada para ${userName}.
Objetivo: ${userGoal}.
${biometryContext}
${trainingContext}

ADAPTAÇÕES IMPORTANTES:
${experienceLevel === "iniciante" ? "- Iniciante: foco em aprendizado técnico, exercícios básicos e compostos, volume moderado" : ""}
${experienceLevel === "intermediário" ? "- Intermediário: periodização linear, variação de estímulos, volume moderado-alto" : ""}
${experienceLevel === "avançado" ? "- Avançado: periodização avançada (ondulatória/blocos), técnicas avançadas, volume alto" : ""}
${trainingLocation === "casa_sem_equipamentos" ? "- Sem equipamentos: exercícios com peso corporal, progressões calistênicas" : ""}
${trainingLocation === "casa_equipamentos" ? "- Casa com equipamentos: adaptar para equipamentos básicos (halteres, barra)" : ""}
${trainingLocation === "academia" ? "- Academia: acesso completo a máquinas, cabos, barras e halteres" : ""}

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
- Crie EXATAMENTE ${daysPerWeek} treinos (distribuídos de Segunda a Domingo conforme a frequência)
- Cada treino deve ter 4-8 exercícios (menos para iniciantes, mais para avançados)
- Timer: ${experienceLevel === "iniciante" ? "90-120" : experienceLevel === "intermediário" ? "60-90" : "45-90"} segundos entre séries
- Baseie-se em evidências científicas (Schoenfeld, Helms, Nuckols)
- Use nomenclatura brasileira para exercícios
- ${experienceLevel === "iniciante" ? "Séries: 2-3, Reps: 10-15" : experienceLevel === "intermediário" ? "Séries: 3-4, Reps: 8-12" : "Séries: 3-5, Reps: 6-15 (periodização)"}`

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
