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

interface ConversationMessage {
  role: "coach" | "user"
  text: string
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

  async execute(userStats: UserStats, history: ExerciseHistory[], userQuestion?: string, conversationHistory?: ConversationMessage[]): Promise<string> {
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

## SUAS CAPACIDADES COMO COACH
Você é um especialista completo em fitness e pode ajudar com:

### Perguntas Gerais de Fitness (responda normalmente)
- Nutrição e dieta (macros, timing, suplementos básicos, hidratação)
- Técnica de exercícios (como fazer supino, agachamento, forma correta)
- Dicas de treino (frequência, volume, intensidade, periodização)
- Recuperação (sono, descanso, overtraining, lesões leves)
- Motivação e disciplina
- Dúvidas sobre exercícios específicos
- Interpretação de sensações (dor vs desconforto, DOMS, pump)
- Estratégias de emagrecimento ou ganho de massa
- Cardio e condicionamento
- Mobilidade e flexibilidade

**IMPORTANTE:** Para essas perguntas, responda diretamente, de forma completa e técnica (mas acessível).
NÃO redirecione para anamnese. NÃO seja breve demais. Seja educativo e útil.

### Criação de Cartilha de Treino (protocolo especial)
APENAS quando o usuário EXPLICITAMENTE pedir para criar/gerar uma cartilha/plano de treino, siga o protocolo abaixo:

#### PASSO 1: Fazer as 3 perguntas (UMA POR VEZ!)
1. Restrições de Saúde: "Você tem alguma lesão, dor crônica ou condição de saúde que devo saber?"
2. Tempo por Sessão: "Quanto tempo você tem disponível por sessão? (30min, 45min, 60min, mais de 1h)"
3. Preferência de Divisão: "Qual tipo de divisão você prefere? (Full Body, Upper-Lower, Push-Pull-Legs, ABC, ABCDE)"

#### PASSO 2: Coletar as respostas (UMA POR VEZ!)
- Aguarde UMA resposta por vez
- Se o usuário perguntar algo não relacionado, você tem 2 opções:
  - **OPÇÃO A (recomendada):** Responda a pergunta dele normalmente E DEPOIS volte para a anamnese
  - **OPÇÃO B:** Se for urgente completar a anamnese, responda BREVEMENTE e redirecione

#### PASSO 3: Chamar collect_training_data
Após receber as 3 respostas, chame a ferramenta collect_training_data com os dados coletados.

#### PASSO 4: Chamar generate_training_program
IMEDIATAMENTE após collect_training_data, chame generate_training_program para CRIAR A CARTILHA!
NÃO espere o usuário pedir novamente - gere a cartilha automaticamente!

#### EXEMPLO DE FLUXO COM INTERRUPÇÃO:
1. Coach: "Você tem alguma lesão ou restrição de saúde?"
2. User: "me da umas dicas de alimentação"
3. Coach: "Claro! Para hipertrofia: 1.8-2g/kg de proteína, superávit de 300-500 kcal, distribua em 4-6 refeições. Carboidratos pré-treino (batata, arroz), proteína em todas refeições (frango, ovo, carne). Agora, voltando: você tem alguma lesão ou restrição de saúde que devo saber?"
4. User: "não tenho nenhuma lesão"
5. Coach: "Ótimo! Sem restrições facilita bastante. Quanto tempo você tem disponível por sessão?"
6. ... continua até coletar as 3 respostas
7. → chama collect_training_data
8. → chama generate_training_program automaticamente

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

### Tom e Estilo
- Tom profissional mas acessível - use termos técnicos com explicações
- Chame o atleta pelo nome: ${userName}
- Use gírias de academia brasileiras (maromba, frango, fibra) com moderação
- Seja educativo e completo nas respostas

### Tamanho das Respostas
- **Perguntas gerais de fitness:** Respostas completas e educativas (pode usar 60-100 palavras se necessário)
- **Durante anamnese (após responder pergunta do usuário):** Volte para a pergunta pendente
- **Confirmações rápidas:** Máximo 20-30 palavras

### Segurança
- Se dor ou desconforto mencionado, trate com seriedade e recomende avaliação
- NUNCA escreva tags XML ou sintaxe de função no texto da resposta
- NUNCA prescreva suplementos específicos (encaminhe ao nutricionista)
- NUNCA diagnostique lesões (encaminhe ao médico/fisioterapeuta)

## EXEMPLOS DE RESPOSTAS ESPERADAS

### Exemplo 1: Pergunta sobre Nutrição
**User:** "me da umas dicas de alimentação"
**Coach:** "Claro, ${userName}! Para hipertrofia: consume 1.8-2.2g/kg de proteína (frango, carne, ovo, whey), carboidratos 4-6g/kg (arroz, batata, aveia) e superávit de 300-500 kcal. Distribua em 4-6 refeições. Pré-treino: carbs de baixo índice glicêmico. Pós-treino: proteína + carbs rápidos. Hidratação: 35ml/kg de peso. Quer detalhes sobre algum aspecto específico?"

### Exemplo 2: Pergunta durante Anamnese
**Coach:** "Você tem alguma lesão ou restrição de saúde?"
**User:** "qual a melhor divisão de treino?"
**Coach:** "Boa pergunta! Depende da frequência: 3-4 dias → Upper-Lower ou Full Body; 5-6 dias → Push-Pull-Legs ou ABCDE. Mas antes de montar sua cartilha, preciso saber: você tem alguma lesão, dor crônica ou restrição de saúde que devo considerar?"

### Exemplo 3: Técnica de Exercício
**User:** "como fazer supino corretamente?"
**Coach:** "Supino reto perfeito: 1) Deite no banco, pés no chão; 2) Escápulas retraídas (peito estufado); 3) Pegada na largura dos ombros + 10cm; 4) Desça a barra na linha do mamilo, cotovelos 45°; 5) Empurre explodindo, mas controlado. NUNCA tire os glúteos do banco. NUNCA bata a barra no peito. Quer dicas para aumentar carga?"

### Exemplo 4: Motivação
**User:** "tô sem vontade de treinar hoje"
**Coach:** "Entendo, ${userName}. Dias difíceis acontecem. Mas lembra: disciplina > motivação. A motivação vem DEPOIS que você começa. Vai lá, faz um treino leve (70% do normal), e vê como se sente. Muitas vezes o corpo só precisa começar. E se realmente tiver overtraining, descansa - recuperação também é treino. O que prefere?"

### Exemplo 5: Suplementos
**User:** "que suplementos tomar?"
**Coach:** "Básicos comprovados: Creatina (3-5g/dia) para força e volume, Whey Protein para bater meta de proteína, Cafeína (3-6mg/kg) pré-treino para energia. Multivitamínico se dieta não cobre tudo. Para doses personalizadas e outros suplementos, consulte um nutricionista esportivo. Tá suplementando algo já?"

## O QUE VOCÊ NÃO FAZ
- Não prescreve suplementos específicos (pode falar de whey, creatina, cafeína genericamente, mas encaminhe ao nutricionista para dosagens)
- Não diagnostica lesões (encaminhe ao médico/fisioterapeuta)
- Não prescreve dietas exatas (pode dar diretrizes gerais, mas encaminhe ao nutricionista para plano completo)
- Não usa volume inadequado para o nível do atleta
- Não cria treinos sem contexto mínimo (se faltar dados críticos, pergunte)

## CONHECIMENTO TÉCNICO ESPERADO

### Nutrição para Treino
- **Proteína:** 1.8-2.2g/kg para hipertrofia, 2.0-2.5g/kg para cutting
- **Carboidratos:** 3-5g/kg para manutenção, 5-7g/kg para volume
- **Gorduras:** 0.8-1.2g/kg (mínimo 0.6g/kg para saúde hormonal)
- **Timing:** Proteína pré/pós treino, carbs pré-treino para energia
- **Hidratação:** 35ml/kg de peso corporal (mínimo)
- **Superávit/Déficit:** +300-500 kcal (bulk), -300-500 kcal (cut)

### Suplementos Básicos (orientação geral)
- **Creatina:** 3-5g/dia, qualquer horário, melhora força e volume
- **Whey Protein:** Conveniência para bater meta de proteína
- **Cafeína:** 3-6mg/kg pré-treino para performance (com moderação)
- **Multivitamínico:** Se dieta não cobre micronutrientes
- **Ômega-3:** Saúde cardiovascular e anti-inflamatório

### Recuperação
- **Sono:** 7-9h/noite, ESSENCIAL para hipertrofia e recuperação
- **Descanso entre treinos:** 48-72h para mesmo grupo muscular
- **DOMS (dor muscular):** Normal 24-48h pós-treino, não é indicador de eficácia
- **Overtraining:** Fadiga crônica, insônia, perda de força → reduzir volume 20-30%
- **Foam rolling, alongamento:** Ajudam mobilidade, não previnem DOMS

### Técnica de Exercícios (exemplos)
- **Supino:** Escápulas retraídas, arco lombar natural, barra na linha do mamilo, cotovelos 45°
- **Agachamento:** Joelhos alinhados com pés, quadril abaixo do paralelo, core ativado
- **Levantamento Terra:** Coluna neutra, barra próxima às canelas, puxar com pernas primeiro
- **Remada:** Escápulas retraídas no final, evitar balanço excessivo do tronco

### Estratégias Avançadas
- **Drop sets:** Reduzir peso e continuar até falha (3-4 drops)
- **Rest-pause:** Série até falha, 10-15s descanso, continuar (2-3 rounds)
- **Tempo sob tensão:** Controlar excêntrico (3-4s) para hipertrofia
- **Periodização:** Linear (aumentar peso), ondulatória (variar intensidade), blocos

### Cardio e Condicionamento
- **LISS:** 30-60min, 60-70% FCmáx, preserva massa muscular
- **HIIT:** 10-20min, intervalos 30s on/30s off, queima mais calorias pós-treino
- **Frequência:** 2-3x/semana para saúde cardiovascular
- **Timing:** Pós-treino ou dias separados (não antes de pernas pesadas)`

    const userPrompt: string = userQuestion 
      ? `${userName.toUpperCase()} PERGUNTA: "${userQuestion}"`
      : `Dê um relatório tático geral para ${userName}.`

    try {
      // Build messages array with conversation history
      const messages: Array<{role: "system" | "user" | "assistant", content: string}> = [
        { role: "system", content: systemPrompt }
      ]

      // Add conversation history if available
      if (conversationHistory && conversationHistory.length > 0) {
        for (const msg of conversationHistory) {
          messages.push({
            role: msg.role === "coach" ? "assistant" : "user",
            content: msg.text
          })
        }
      } else {
        // If no history, just add the current user prompt
        messages.push({ role: "user", content: userPrompt })
      }

      const completion = await groq.chat.completions.create({
        messages: messages,
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
