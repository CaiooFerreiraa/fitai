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
      description: "Salva dados da anamnese completa (restrições de saúde, tempo por sessão, preferência de divisão). Use após coletar as 3 respostas.",
      parameters: {
        type: "object",
        properties: {
          health_restrictions: { 
            type: "string", 
            description: "Restrições de saúde ou lesões (ex: dor na coluna, problema no joelho, Shoulder pain, nenhuma)"
          },
          session_time: { 
            type: "string", 
            description: "Tempo disponível por sessão (use exatamente: 30min, 45min, 60min, mais de 1h)"
          },
          split_preference: { 
            type: "string", 
            description: "Preferência de divisão (use exatamente: Full Body, Upper-Lower, Push-Pull-Legs, ABC, ABCDE, outra)"
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "generate_training_program",
      description: "Gera cartilha de treino APENAS após coletar a anamnese completa (3 perguntas). NÃO use antes!",
      parameters: {
        type: "object",
        properties: {
          health_restrictions: { type: "string" },
          session_time: { type: "string" },
          split_preference: { type: "string" }
        }
      }
    }
  }
]

export class GetAiCoachAdviceUseCase {
  private userId: string
  private userStats: UserStats | null = null

  constructor(userId: string) {
    this.userId = userId
  }

  setUserStats(stats: UserStats) {
    this.userStats = stats
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
        // Normalize health_restrictions
        let healthRestrictions = args.health_restrictions as string
        if (!healthRestrictions || healthRestrictions === "" || healthRestrictions === "null") {
          healthRestrictions = "nenhuma"
        }
        
        // Normalize session_time to valid values
        let sessionTime = args.session_time as string || "60min"
        const validSessionTimes = ["30min", "45min", "60min", "mais de 1h"]
        if (!validSessionTimes.includes(sessionTime)) {
          sessionTime = "60min" // Default
        }
        
        // Normalize split_preference to valid values
        let splitPreference = args.split_preference as string || "Push-Pull-Legs"
        const validSplits = ["Full Body", "Upper-Lower", "Push-Pull-Legs", "ABC", "ABCDE", "outra"]
        if (!validSplits.includes(splitPreference)) {
          splitPreference = "Push-Pull-Legs" // Default
        }

        await prisma.$executeRaw`
          UPDATE "User"
          SET goal = CONCAT(
            COALESCE(goal, 'evolução geral'),
            ' | Saúde: ', ${healthRestrictions},
            ' | Tempo: ', ${sessionTime},
            ' | Divisão: ', ${splitPreference}
          )
          WHERE id = ${this.userId}
        `
        
        return { success: true, message: `Anamnese completa! Saúde: ${healthRestrictions}, Tempo: ${sessionTime}, Divisão: ${splitPreference}.` }
      } catch (error) {
        console.error("COLLECT_TRAINING_DATA_ERROR:", error)
        return { success: false, message: "Erro ao salvar dados de treino." }
      }
    }

    if (toolName === "generate_training_program") {
      try {
        let healthRestrictions = args.health_restrictions as string || "nenhuma"
        
        let sessionTime = args.session_time as string || "60min"
        const validSessionTimes = ["30min", "45min", "60min", "mais de 1h"]
        if (!validSessionTimes.includes(sessionTime)) {
          sessionTime = "60min"
        }
        
        let splitPreference = args.split_preference as string || "Push-Pull-Legs"
        const validSplits = ["Full Body", "Upper-Lower", "Push-Pull-Legs", "ABC", "ABCDE", "outra"]
        if (!validSplits.includes(splitPreference)) {
          splitPreference = "Push-Pull-Legs"
        }
        
        await generateTrainingProgramAction(
          true,
          this.userStats?.trainingTime || "intermediário",
          "academia",
          4
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
    // Store userStats for use in handleToolCall
    this.setUserStats(userStats)
    
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

## DADOS DO PERFIL (INFORMAÇÕES BÁSICAS)
- Peso: ${userStats.weight || "não informado"} kg
- Altura: ${userStats.height || "não informada"} m
- Objetivo: ${userStats.goal || "não informado"}
- Experiência: ${userStats.trainingTime || "não informada"}
- Gênero: ${userStats.gender || "não informado"}
- Idade: ${userStats.dateOfBirth ? "informada" : "não informada"}

## PROTOCOLO DE ANAMNESE (OBRIGATÓRIO PARA GERAR CARTILHA)
Quando o usuário pedir para criar uma cartilha/plano de treino, você DEVE:

### PASSO 1: Fazer as 3 perguntas (UMA POR VEZ!)
1. Restrições de Saúde: "Você tem alguma lesão, dor crônica ou condição de saúde que devo saber?"
2. Tempo por Sessão: "Quanto tempo você tem disponível por sessão?"
3. Preferência de Divisão: "Qual tipo de divisão você prefere?"

### PASSO 2: Coletar as respostas (UMA POR VEZ!)
- Aguarde UMA resposta por vez
- Se o usuário fugir do assunto (ex: pedir dicas de alimentação), responda BREVEMENTE e REDIRECIONE para a pergunta atual
- Exemplo: "Boa! Alimentação é crucial. Já vamos falar disso. Mas primeiro: você tem alguma lesão ou restrição de saúde?"

### PASSO 3: Chamar collect_training_data
Após receber as 3 respostas, chame a ferramenta collect_training_data com os dados coletados.

### PASSO 4: Chamar generate_training_program
IMEDIATAMENTE após collect_training_data, chame generate_training_program para CRIAR A CARTILHA!
NÃO espere o usuário pedir novamente - gere a cartilha automaticamente!

### FLUXO COMPLETO (SIGA ESTA ORDEM):
1. Faça PERGUNTA 1 (saúde)
2. Aguarde resposta 1
3. Faça PERGUNTA 2 (tempo)
4. Aguarde resposta 2
5. Faça PERGUNTA 3 (divisão)
6. Aguarde resposta 3
7. Assim que tiver as 3 respostas → chame collect_training_data
8. IMEDIATAMENTE após → chame generate_training_program (NÃO ESPERE!)
9. A cartilha será criada e salva automaticamente

### LIDANDO COM INTERRUPÇÕES
Se o usuário perguntar algo não relacionado durante a anamnese:
- Responda em 1 frase curta (máximo 15 palavras)
- Redirecione IMEDIATAMENTE para a pergunta pendente
- Exemplo: "Ótima dúvida! Depois explico. Agora: você tem lesões ou restrições?"

## FERRAMENTAS DISPONÍVEIS (USE APENAS VIA TOOL CALLING)
- **update_profile**: Atualiza peso, altura, objetivo (NUNCA escreva no texto!)
- **collect_training_data**: Salva dados de anamnese (NUNCA escreva no texto!)
- **generate_training_program**: Gera cartilha (NUNCA escreva no texto!)

## 🚨 REGRA CRÍTICA: TOOL CALLING
- NUNCA escreva <function=...> no texto da resposta
- NUNCA invente sintaxe de função no texto  
- NUNCA coloque nome de função entre <>
- Use APENAS o mecanismo de tool calling da API (tools array)
- O tool call deve aparecer no campo "tool_calls" do JSON de resposta, NÃO no campo "content"
- O sistema detecta automaticamente quando você quer usar ferramentas - você NÃO precisa escrever syntax de função no texto!

## EXEMPLO DO QUE FAZER:
✅ Você quer chamar collect_training_data: Apenas pense sobre os dados, e o sistema chamará automaticamente.
✅ Você quer chamar generate_training_program: Apenas pense em gerar a cartilha, e o sistema chamará automaticamente.
✅ Response no JSON: O campo "content" deve ter apenas texto normal, "tool_calls" deve ter as chamadas de função

## EXEMPLO DO QUE NÃO FAZER:
❌ NÃO escreva: "<function=collect_training_data(...)>" no texto
❌ NÃO escreva: "Vou chamar collect_training_data..."
❌ NÃO escreva: <collect_training_data>...</collect_training_data>
❌ NÃO escreva: {collect_training_data: ...} no texto
❌ NÃO coloque nada que pareça sintaxe de função no campo content

## REGRAS DE COMUNICAÇÃO
1. Tom profissional mas acessível - use termos técnicos com explicações
2. NUNCA escreva tags XML ou sintaxe de função no texto da resposta
3. Chame o atleta pelo nome: ${userName}
4. Use gírias de academia brasileiras (maromba, frango, fibra) com moderação
5. Respostas curtas (máximo 40 palavras)
6. Se dor ou desconforto mencionado, trate com seriedade e recomende avaliação

## O QUE VOCÊ NÃO FAZ
- Não gera treino sem anamnese completa (perguntas de saúde, tempo, preferência)
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

      // Handle multiple tool calls in sequence
      if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
        let finalMessage = ""
        
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name
          const args = JSON.parse(toolCall.function.arguments || "{}")
          
          const result = await this.handleToolCall(toolName, args)
          
          if (result.success) {
            finalMessage = result.message
          } else {
            return `${result.message}`
          }
        }
        
        return `${finalMessage}`
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
