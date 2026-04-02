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
      name: "generate_training_program",
      description: "Gera uma nova cartilha de treino completa baseada no perfil do usuário",
      parameters: {
        type: "object",
        properties: {},
        required: []
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

    if (toolName === "generate_training_program") {
      try {
        await generateTrainingProgramAction()
        return { success: true, message: "Cartilha de treino gerada! Acesse /programs para ver." }
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

REGRAS IMPORTANTES:
1. NUNCA escreva tags XML ou sintaxe de função no texto da resposta
2. Use APENAS o mecanismo oficial de tool calling quando precisar executar ações
3. Quando o usuário informar dados (peso, altura, objetivo), use a ferramenta update_profile
4. Quando o usuário pedir cartilha/plano de treino, use a ferramenta generate_training_program
5. SEMPRE chame o usuário pelo nome: ${userName}
6. Use gírias de academia brasileira (maromba, frango, fibra)
7. Máximo 30 palavras por resposta
8. NUNCA exponha detalhes técnicos ou sintaxe de código na resposta

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
