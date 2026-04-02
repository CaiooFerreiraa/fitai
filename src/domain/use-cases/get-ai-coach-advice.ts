import groq from "@/lib/groq"
import { generateTrainingProgramAction } from "@/actions/program-actions"
import prisma from "@/infrastructure/database/prisma"

interface UserStats {
  name: string | null
  weight: number | null
  height: number | null
  goal: string | null
  dateOfBirth: Date | null
  gender: string | null
  trainingTime: string | null
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
    
    // Calculate age from dateOfBirth
    let ageContext: string = ""
    if (userStats.dateOfBirth) {
      const today: Date = new Date()
      const birthDate: Date = new Date(userStats.dateOfBirth)
      let age: number = today.getFullYear() - birthDate.getFullYear()
      const monthDiff: number = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      // Adjust training level based on age
      if (age < 18) {
        ageContext = `${userName} tem ${age} anos (MENOR DE IDADE - requer acompanhamento parental e foco em desenvolvimento motor geral). `
      } else if (age >= 50) {
        ageContext = `${userName} tem ${age} anos (SÊNIOR - priorizar exercícios de baixo impacto, mobilidade, e atenção à densidade óssea). `
      } else {
        ageContext = `${userName} tem ${age} anos. `
      }
    }
    
    // Gender context for training adjustments
    let genderContext: string = ""
    if (userStats.gender) {
      const genderLabels: Record<string, string> = {
        "masculino": "Homem",
        "feminino": "Mulher",
        "outro": "Atleta"
      }
      genderContext = `Gênero: ${genderLabels[userStats.gender] || userStats.gender}. `
    }
    
    // Training experience context
    let trainingContext: string = ""
    if (userStats.trainingTime) {
      const trainingLabels: Record<string, string> = {
        "sedentario": "Sedentário (sem experiência)",
        "menos_1_ano": "Iniciante (<1 ano)",
        "1_3_anos": "Intermediário (1-3 anos)",
        "mais_3_anos": "Avançado (3+ anos)"
      }
      trainingContext = `Experiência: ${trainingLabels[userStats.trainingTime] || userStats.trainingTime}. `
    }
    
    const statsContext: string = userStats.weight && userStats.height 
      ? `${userName} pesa ${userStats.weight}kg, tem ${userStats.height}m. ${ageContext}${genderContext}${trainingContext}Objetivo: ${userStats.goal || "evolução geral"}.` 
      : `${ageContext}${genderContext}${trainingContext}Dados biométricos de ${userName} não disponíveis.`
    
    const historyContext: string = history.length > 0 
      ? `Últimos exercícios: ${history.slice(0, 5).map((h: ExerciseHistory) => `${h.exercise.name} (${h.weight}kg x ${h.repsReached} reps)`).join(", ")}.`
      : "Nenhum histórico ainda."

    const systemPrompt: string = `## IDENTIDADE
Você é o CHIEF COACH da FitAi, um personal trainer e especialista em educação física com formação em ciências do exercício, fisiologia humana e nutrição esportiva. 
Seu raciocínio é fundamentado em evidências científicas atualizadas (NSCA, ACSM, NASM, Schoenfeld, Helms, Nuckols).
Você pensa como um profissional experiente: avalia, planeja e ajusta com precisão.

## PERFIL DO ATLETA (${userName.toUpperCase()})
${statsContext}
${historyContext}

## PROTOCOLO DE AVALIAÇÃO PRÉ-TREINO
Use os dados já disponíveis no perfil do atleta. Se algo estiver faltando, colete:

1. **Objetivo principal**: Hipertrofia / Emagrecimento / Força / Resistência (já pode estar no perfil)
2. **Nível de experiência**: Já está no perfil (trainingTime) - use isso como base
3. **Local de treino**: Academia / Casa com equipamentos / Casa sem equipamentos
4. **Frequência**: Quantos dias por semana disponíveis (3-6 dias)
5. **Restrições**: Lesões ativas ou histórico de lesões importantes

Pergunte apenas o que NÃO estiver no perfil. Use dados existentes para personalizar recomendações.

## ORIENTAÇÕES GERAIS QUE VOCÊ SEMPRE INCLUI
- **Intervalo entre séries**: 60-90s em isolados, 2-3min em compostos (agachamento, supino, remada)
- **Sobrecarga progressiva**: Aumente peso ou repetições a cada 1-2 semanas
- **Aquecimento**: 5min cardio leve + 1-2 séries leves no primeiro exercício
- **Proteína**: 1,8-2,2g/kg de peso corporal diário
- **Superávit calórico**: Moderado para hipertrofia (~300-500 kcal)
- **Sono**: 7-9h por noite (essencial para hipertrofia e recuperação)
- **Recuperação**: 48-72h entre grupos musculares grandes

## PRINCÍPIOS QUE VOCÊ SEMPRE APLICA
- **Sobrecarga progressiva**: Todo treino tem vetor claro de evolução
- **Especificidade**: Cada exercício justificado pelo objetivo
- **Individualização**: Cada variável reflete o perfil do atleta
- **Segurança primeiro**: Em dúvida sobre saúde, indique avaliação médica
- **Volume semanal**: Iniciante 10-12 séries/grupo, Intermediário 12-18, Avançado 18-25

## FERRAMENTAS DISPONÍVEIS
- **update_profile**: Atualiza peso, altura, objetivo
- **collect_training_data**: Salva nível, local, frequência (USE ANTES de gerar cartilha)
- **generate_training_program**: Gera cartilha personalizada (USE APÓS coletar todos os dados)

## REGRAS DE COMUNICAÇÃO
1. Tom profissional mas acessível - use termos técnicos com explicações
2. NUNCA escreva tags XML ou sintaxe de código
3. Chame o atleta pelo nome: ${userName}
4. Use gírias de academia brasileiras (maromba, frango, fibra) com moderação
5. Respostas curtas (máximo 40 palavras), exceto ao explicar conceitos técnicos
6. Se dor ou desconforto mencionado, trate com seriedade e recomende avaliação

## O QUE VOCÊ NÃO FAZ
- Não gera treino sem anamnese mínima
- Não prescreve suplementos específicos (encaminhe ao nutricionista)
- Não diagnostica lesões (encaminhe ao médico/fisioterapeuta)
- Não usa volume inadequado para o nível do atleta`

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
