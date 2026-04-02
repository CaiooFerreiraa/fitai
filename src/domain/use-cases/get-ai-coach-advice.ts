import groq from "@/lib/groq"
import { generateTrainingProgramAction } from "@/actions/program-actions"
import prisma from "@/infrastructure/database/prisma"

interface UserStats {
  name: string | null
  weight: number | null
  height: number | null
  goal: string | null
}

interface ExerciseHistory {
  exercise: {
    name: string
  }
  weight: number
  repsReached: number | null
}

interface ToolCallResult {
  success: boolean
  message: string
}

const tools = [
  {
    type: "function" as const,
    function: {
      name: "update_profile",
      description: "Atualiza os dados biométricos do usuário (peso, altura, objetivo)",
      parameters: {
        type: "object",
        properties: {
          weight: { type: "number", description: "Peso em kg" },
          height: { type: "number", description: "Altura em metros" },
          goal: { type: "string", description: "Objetivo do treino (ex: hipertrofia, emagrecimento, força)" }
        },
        required: []
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "collect_training_data",
      description: "Salva informações sobre experiência, local de treino e frequência ANTES de gerar cartilha. Use isso quando o usuário responder às perguntas sobre nível, local e dias disponíveis.",
      parameters: {
        type: "object",
        properties: {
          experience_level: { 
            type: "string", 
            description: "Nível de experiência: iniciante, intermediário ou avançado",
            enum: ["iniciante", "intermediário", "avançado"]
          },
          training_location: { 
            type: "string", 
            description: "Local de treino: academia, casa_equipamentos, casa_sem_equipamentos",
            enum: ["academia", "casa_equipamentos", "casa_sem_equipamentos"]
          },
          days_per_week: { 
            type: "number", 
            description: "Dias disponíveis por semana (3-6)",
            minimum: 3,
            maximum: 6
          }
        },
        required: ["experience_level", "training_location", "days_per_week"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "generate_training_program",
      description: "Gera cartilha de treino APENAS após coletar: objetivo, nível, local e frequência. NÃO use antes de ter todas as informações.",
      parameters: {
        type: "object",
        properties: {
          experience_level: { type: "string" },
          training_location: { type: "string" },
          days_per_week: { type: "number" }
        },
        required: ["experience_level", "training_location", "days_per_week"]
      }
    }
  }
]

export class GetAiCoachAdviceUseCase {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  private async handleToolCall(toolName: string, args: Record<string, unknown>): Promise<ToolCallResult> {
    console.log("AI_TOOL_CALL:", toolName, args)

    if (toolName === "update_profile") {
      try {
        await prisma.$executeRaw`
          UPDATE "User"
          SET weight = ${args.weight as number | null}, 
              height = ${args.height as number | null}, 
              goal = ${args.goal as string | null}
          WHERE id = ${this.userId}
        `
        return { success: true, message: "Perfil atualizado com sucesso! Agora tenho seus dados." }
      } catch (error) {
        console.error("UPDATE_PROFILE_ERROR:", error)
        return { success: false, message: "Erro ao atualizar perfil." }
      }
    }

    if (toolName === "collect_training_data") {
      try {
        // Salva dados de treino temporariamente no perfil do usuário
        const experienceMap: Record<string, string> = {
          "iniciante": "Iniciante (menos de 1 ano)",
          "intermediário": "Intermediário (1-3 anos)",
          "avançado": "Avançado (3+ anos)"
        }
        
        const locationMap: Record<string, string> = {
          "academia": "Academia completa",
          "casa_equipamentos": "Casa com equipamentos",
          "casa_sem_equipamentos": "Casa sem equipamentos"
        }

        const experience: string = experienceMap[args.experience_level as string] || args.experience_level as string
        const location: string = locationMap[args.training_location as string] || args.training_location as string
        const days: number = args.days_per_week as number

        // Atualiza o goal com informações completas
        await prisma.$executeRaw`
          UPDATE "User"
          SET goal = CONCAT(
            COALESCE(goal, 'evolução geral'),
            ' | Nível: ', ${experience},
            ' | Local: ', ${location},
            ' | Frequência: ', ${days}::text, ' dias/semana'
          )
          WHERE id = ${this.userId}
        `
        
        return { success: true, message: `Dados coletados! Nível ${experience}, treino em ${location}, ${days}x/semana. Preparando sua cartilha...` }
      } catch (error) {
        console.error("COLLECT_TRAINING_DATA_ERROR:", error)
        return { success: false, message: "Erro ao salvar dados de treino." }
      }
    }

    if (toolName === "generate_training_program") {
      try {
        // Passa os parâmetros para a action
        await generateTrainingProgramAction(
          true, // skipRevalidation
          args.experience_level as string,
          args.training_location as string,
          args.days_per_week as number
        )
        return { success: true, message: "Cartilha criada com sucesso! Vai em CARTILHAS pra ver os treinos." }
      } catch (error) {
        console.error("GENERATE_PROGRAM_ERROR:", error)
        return { success: false, message: "Erro ao gerar cartilha." }
      }
    }

    return { success: false, message: "Função não reconhecida." }
  }

  async execute(userStats: UserStats, history: ExerciseHistory[], userQuestion?: string): Promise<string> {
    const userName: string = userStats.name || "recruta"
    const statsContext: string = userStats.weight && userStats.height 
      ? `${userName} pesa ${userStats.weight}kg, tem ${userStats.height}m de altura. Objetivo: ${userStats.goal || "evolução geral"}.` 
      : `Dados biométricos de ${userName} não disponíveis.`
    
    const historyContext: string = history.length > 0 
      ? `Últimos exercícios: ${history.slice(0, 5).map((h: ExerciseHistory) => `${h.exercise.name} (${h.weight}kg x ${h.repsReached} reps)`).join(", ")}.`
      : "Nenhum histórico ainda."

    const systemPrompt: string = `Você é o CHIEF COACH da FitAi, um treinador de elite brutalista e direto.

PROTOCOLO DE CARTILHA (SIGA RIGOROSAMENTE):
Quando o usuário pedir para criar cartilha/plano de treino, você DEVE fazer 3 perguntas ANTES de gerar:

1. "Qual seu nível, maromba? (iniciante/intermediário/avançado)"
2. "Onde vai treinar? (academia/casa com equipamentos/casa sem equipamentos)"
3. "Quantos dias por semana você aguenta? (3-6 dias)"

Após receber as 3 respostas, use collect_training_data com os dados e DEPOIS generate_training_program.
NÃO gere cartilha SEM coletar essas informações primeiro!

FERRAMENTAS DISPONÍVEIS:
- update_profile: atualiza peso, altura, objetivo
- collect_training_data: salva nível, local e frequência (USE ANTES de gerar cartilha)
- generate_training_program: gera cartilha (USE APENAS APÓS collect_training_data)

REGRAS DE COMUNICAÇÃO:
1. NUNCA escreva tags XML ou sintaxe de função no texto
2. Use tool calling oficial (invisível pro usuário)
3. SEMPRE chame o usuário pelo nome: ${userName}
4. Use gírias de academia brasileira (maromba, frango, fibra)
5. Máximo 35 palavras por resposta (exceto ao fazer perguntas)
6. Tom agressivo e motivacional

CONTEXTO ATUAL:
${statsContext}
${historyContext}`

    const userPrompt: string = userQuestion 
      ? `${userName.toUpperCase()} PERGUNTA: "${userQuestion}"`
      : `Dê um relatório tático geral para ${userName}.`

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: tools,
        tool_choice: "auto",
        model: "llama-3.3-70b-versatile",
      })

      const assistantMessage = completion.choices[0]?.message

      if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
        const toolCall = assistantMessage.tool_calls[0]
        const toolName = toolCall.function.name
        const args = JSON.parse(toolCall.function.arguments || "{}")

        const result = await this.handleToolCall(toolName, args)

        if (result.success) {
          return `${result.message} Agora vamos continuar com seu treino!`
        }
        return `${result.message} Tente novamente.`
      }

      // Filtro de segurança: remove tags XML/função que podem vazar na resposta
      let responseText: string = assistantMessage?.content || `Treine, ${userName}! Sem desculpas.`
      responseText = responseText.replace(/<function[^>]*>[\s\S]*?<\/function>/g, '').trim()
      responseText = responseText.replace(/<[^>]+>/g, '').trim() // Remove qualquer tag XML residual
      
      return responseText || `Treine, ${userName}! Sem desculpas.`
    } catch (error: unknown) {
      console.error("AI_COACH_ERROR:", error)
      return `ERRO NA COMUNICAÇÃO, ${userName.toUpperCase()}. O FERRO NÃO MENTE.`
    }
  }
}
