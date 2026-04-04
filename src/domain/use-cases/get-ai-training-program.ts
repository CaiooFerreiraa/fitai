import groq from "@/lib/groq"
import prisma from "@/infrastructure/database/prisma"

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
  age?: number
  gender?: string
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
        dateOfBirth: true,
        gender: true,
        trainingTime: true,
      }
    })

    const userName: string = user?.name || "recruta"
    const userGoal: string = user?.goal || "hipertrofia geral"
    const userWeight: number | null = user?.weight || null
    const userHeight: number | null = user?.height || null

    // Calculate age if dateOfBirth is available
    let userAge: number | null = null
    if (user?.dateOfBirth) {
      const today: Date = new Date()
      const birthDate: Date = new Date(user.dateOfBirth)
      userAge = today.getFullYear() - birthDate.getFullYear()
      const monthDiff: number = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        userAge--
      }
    }

    // Extract training parameters
    const experienceLevel: string = options?.experienceLevel || user?.trainingTime || "intermediário"
    const trainingLocation: string = options?.trainingLocation || "academia"
    const daysPerWeek: number = typeof options?.daysPerWeek === 'string' 
      ? parseInt(options.daysPerWeek, 10) 
      : (options?.daysPerWeek || 5)
    const gender: string = user?.gender || options?.gender || "masculino"

    const biometryContext: string = userWeight && userHeight 
      ? `${userName} pesa ${userWeight}kg e tem ${userHeight}m de altura.` 
      : `Dados biométricos de ${userName} não disponíveis.`

    const ageContext: string = userAge 
      ? `Idade: ${userAge} anos. ${userAge < 18 ? "Menor de idade - foco em coordenação e desenvolvimento motor." : userAge >= 50 ? "Sênior - priorizar mobilidade, baixo impacto e densidade óssea." : "Adulto em idade produtiva."}`
      : "Idade não informada."

    const trainingContext: string = `Nível: ${experienceLevel}. Local: ${trainingLocation}. Frequência: ${daysPerWeek} dias/semana. Gênero: ${gender}.`

    const systemPrompt: string = `## IDENTIDADE
Você é um personal trainer e especialista em educação física com formação em ciências do exercício, fisiologia e nutrição esportiva.
Seu raciocínio é fundamentado em evidências científicas (NSCA, ACSM, NASM, Schoenfeld, Helms, Nuckols).

## PERFIL DO ATLETA
Nome: ${userName}
Objetivo: ${userGoal}
${biometryContext}
${ageContext}
${trainingContext}

## BANCO DE DADOS DE EXERCÍCIOS (USE ESTES NOMES EXATOS)

### PEITO
- Supino reto com barra
- Supino inclinado com barra
- Supino declinado com barra
- Supino reto com halteres
- Supino inclinado com halteres
- Crucifixo reto com halteres
- Crucifixo inclinado com halteres
- Crossover no cabo
- Flexão de braço (push-up)
- Flexão de braço com carga
- Peck deck (voador)

### COSTAS
- Barra fixa (pull-up)
- Barra fixa pegada aberta
- Barra fixa pegada supinada
- Puxada frontal
- Puxada alta pegada aberta
- Remada curvada com barra
- Remada curvada com halteres
- Remada unilateral com halter
- Remada cavalinho
- Remada baixa no cabo
- Pulldown com corda
- Levantamento terra (deadlift)
- Levantamento terra romeno
- Pullover com halter
- Pullover no cabo

### PERNAS (QUADRÍCEPS)
- Agachamento livre com barra
- Agachamento frontal
- Agachamento búlgaro
- Leg press 45 graus
- Leg press horizontal
- Cadeira extensora
- Hack squat
- Afundo com halteres
- Afundo caminhando
- Agachamento sumô

### PERNAS (POSTERIORES DE COXA)
- Levantamento terra romeno
- Stiff com barra
- Stiff com halteres
- Mesa flexora
- Flexão nórdica
- Elevação pélvica (hip thrust)
- Elevação pélvica unilateral

### PERNAS (GLÚTEOS)
- Elevação pélvica com barra
- Elevação pélvica unilateral
- Agachamento sumô
- Abdução de quadril no cabo
- Coice no cabo
- Step-up com halteres

### PERNAS (PANTURRILHAS)
- Panturrilha em pé no smith
- Panturrilha sentado
- Panturrilha no leg press
- Panturrilha unilateral

### OMBROS
- Desenvolvimento com barra
- Desenvolvimento com halteres
- Desenvolvimento militar
- Elevação lateral com halteres
- Elevação frontal com halter
- Elevação frontal com barra
- Remada alta com barra
- Remada alta no cabo
- Crucifixo inverso com halteres
- Desenvolvimento Arnold
- Face pull no cabo

### BÍCEPS
- Rosca direta com barra
- Rosca direta com barra W
- Rosca alternada com halteres
- Rosca martelo
- Rosca scott (banco scott)
- Rosca concentrada
- Rosca no cabo
- Rosca inversa

### TRÍCEPS
- Tríceps testa com barra
- Tríceps testa com halteres
- Tríceps francês com halter
- Tríceps corda no cabo
- Tríceps barra no cabo
- Mergulho em paralelas
- Tríceps coice com halter
- Tríceps kickback

### CORE/ABDÔMEN
- Abdominal supra
- Abdominal infra
- Prancha isométrica
- Prancha lateral
- Elevação de pernas suspenso
- Abdominal bicicleta
- Russian twist
- Pallof press

## DIVISÕES DE TREINO PERMITIDAS

### 3 DIAS/SEMANA
1. **Full Body ABC** (iniciantes): Corpo todo 3x
2. **Push Pull Legs** (compacto): Push, Pull, Legs

### 4 DIAS/SEMANA  
1. **Upper Lower** (recomendado): Superior A, Inferior A, Superior B, Inferior B
2. **Push Pull Legs** + Full Body: Push, Pull, Legs, Full Body
3. **ABCD**: Peito/Tríceps, Costas/Bíceps, Pernas, Ombros/Core

### 5 DIAS/SEMANA
1. **Push Pull Legs** (clássico): Push A, Pull A, Legs A, Push B, Pull B
2. **ABCDE**: Peito, Costas, Pernas, Ombros/Tríceps, Bíceps/Core
3. **Upper Lower** + PPL: Upper, Lower, Push, Pull, Legs

### 6 DIAS/SEMANA
1. **Push Pull Legs** (2x): Push A, Pull A, Legs A, Push B, Pull B, Legs B
2. **Arnold Split**: Peito/Costas, Ombros/Braços, Pernas (repetir 2x)

## ORIENTAÇÕES GERAIS (INCLUIR EM TODAS AS CARTILHAS)

### Intervalos entre séries
- Exercícios isolados (rosca, extensão, elevação): 60-90 segundos
- Exercícios compostos (agachamento, supino, remada): 2-3 minutos
- Séries de força (1-5 reps): até 5 minutos

### Sobrecarga progressiva
- Aumente peso em 2,5-5kg quando atingir o topo da faixa de reps com boa técnica
- Ou aumente 1-2 repetições por semana mantendo o peso
- Reavalie a cada 2 semanas

### Aquecimento obrigatório
- 5 minutos de cardio leve (bike, esteira, elíptico)
- 1-2 séries de aquecimento no primeiro exercício (50-60% da carga de trabalho)

### Nutrição para hipertrofia
- Proteína: 1,8-2,2g/kg de peso corporal por dia
- Superávit calórico moderado: +300-500 kcal acima da manutenção
- Distribuir proteína em 4-6 refeições ao longo do dia

### Sono e recuperação
- 7-9 horas de sono por noite (ESSENCIAL para hipertrofia)
- Respeitar 48-72h de descanso entre treinos do mesmo grupo muscular
- Sintomas de overtraining: reduzir volume em 20-30%

## ADAPTAÇÕES POR NÍVEL

${experienceLevel === "iniciante" ? `### INICIANTE (menos de 1 ano)
- Volume: 10-12 séries por grupo muscular por semana
- Faixa de reps: 10-15 (foco em aprendizado motor)
- Intervalos: 90-120 segundos
- Progressão: Dominar técnica antes de aumentar carga
- Divisão recomendada: Full Body 3x/semana ou Upper-Lower 4x/semana
- Exercícios: Priorizar compostos básicos (agachamento, supino, remada, desenvolvimento)` : ""}

${experienceLevel === "intermediário" ? `### INTERMEDIÁRIO (1-3 anos)
- Volume: 12-18 séries por grupo muscular por semana
- Faixa de reps: 6-12 (zona de hipertrofia)
- Intervalos: 60-90 segundos (isolados), 2-3min (compostos)
- Progressão: Periodização linear (aumentar carga semanalmente)
- Divisão recomendada: Push-Pull-Legs, Upper-Lower, ABCDE
- Mix: 70% compostos, 30% isolados` : ""}

${experienceLevel === "avançado" ? `### AVANÇADO (3+ anos)
- Volume: 18-25 séries por grupo muscular por semana
- Faixa de reps: 6-15 (periodização ondulatória)
- Intervalos: 45-90 segundos (controle metabólico)
- Progressão: Periodização em blocos, técnicas avançadas (drop sets, rest-pause)
- Divisão: Especializações, divisões avançadas (ABCDEF)
- Variação: Mudar estímulos a cada 4-6 semanas` : ""}

## ADAPTAÇÕES POR LOCAL

${trainingLocation === "academia" ? `### ACADEMIA COMPLETA
- Priorizar exercícios compostos com barra livre
- Usar máquinas para isolamento e segurança em séries finais
- Aproveitar cabos para tensão constante
- Variar equipamentos para evitar platô` : ""}

${trainingLocation === "casa_equipamentos" ? `### CASA COM EQUIPAMENTOS
- Foco em halteres ajustáveis e barra
- Exercícios unilaterais para corrigir assimetrias
- Usar peso corporal + sobrecarga
- Criatividade com ângulos e pegadas` : ""}

${trainingLocation === "casa_sem_equipamentos" ? `### CASA SEM EQUIPAMENTOS (CALISTENIA)
- Progressões de peso corporal (flexões, pull-ups, dips)
- Manipular alavancas e tempo sob tensão
- Usar séries de alta qualidade técnica
- Adicionar pausas isométricas para intensidade` : ""}

## VOLUME SEMANAL IDEAL POR GRUPO MUSCULAR
Distribua as séries ao longo dos ${daysPerWeek} dias de treino:
- Peitoral: ${experienceLevel === "iniciante" ? "10-12" : experienceLevel === "intermediário" ? "12-16" : "16-22"} séries/semana
- Costas: ${experienceLevel === "iniciante" ? "12-14" : experienceLevel === "intermediário" ? "14-18" : "18-24"} séries/semana
- Pernas: ${experienceLevel === "iniciante" ? "12-16" : experienceLevel === "intermediário" ? "16-20" : "20-26"} séries/semana
- Ombros: ${experienceLevel === "iniciante" ? "8-10" : experienceLevel === "intermediário" ? "10-14" : "14-20"} séries/semana
- Bíceps: ${experienceLevel === "iniciante" ? "6-8" : experienceLevel === "intermediário" ? "8-12" : "12-16"} séries/semana
- Tríceps: ${experienceLevel === "iniciante" ? "6-8" : experienceLevel === "intermediário" ? "8-12" : "12-16"} séries/semana

${userAge !== null && userAge >= 50 ? `## ADAPTAÇÕES PARA IDADE (${userAge} anos)
- Priorizar exercícios de baixo impacto (elíptico, bike, swimming)
- Aumentar tempo de aquecimento para 10-15 minutos
- Reduzir cargas extremas, focar em técnica e tempo sob tensão
- Incluir exercícios de mobilidade e alongamento diário
- Atenção especial à densidade óssea: incluir peso morto, agachamento com carga leve
- Descansos mais longos: 3-4 minutos em compostos para segurança articular
- Evitar exercícios que causem impacto excessivo nas articulações
- Considerar suplementos de cálcio e vitamina D` : ""}

${userAge !== null && userAge < 18 ? `## ADAPTAÇÕES PARA MENOR DE IDADE (${userAge} anos)
- Foco em desenvolvimento motor geral e coordenação
- Exercícios com peso corporal antes de cargas externas
- Priorizar exercícios que desenvolvam równowaga e propriocepção
- Evitar treinos de alta intensidade; focar em diversãeste e movimento
- Ensinar técnica correta sem pressa de aumentar carga
- Atividades esportivas variadas são recomendadas além da musculação
- Supervisionamento parental Obrigatório` : ""}

## FORMATO DE SAÍDA (JSON)
Retorne APENAS um JSON válido (sem markdown, sem explicações extras):

{
  "name": "Nome da Cartilha (ex: Hipertrofia Intermediária - Academia 5x)",
  "description": "Descrição técnica profissional baseada em evidências científicas (máximo 50 palavras)",
  "goal": "${userGoal}",
  "duration": "Duração do mesociclo (4-8 semanas para iniciante/intermediário, 4-6 para avançado)",
  "workouts": [
    {
      "dayOfWeek": "MONDAY",
      "name": "Nome do Treino (ex: Peito e Tríceps - Push A)",
      "exercises": [
        {
          "name": "Nome completo do exercício em português (EXATAMENTE como listado no banco)",
          "sets": ${experienceLevel === "iniciante" ? 3 : experienceLevel === "intermediário" ? 4 : 4},
          "reps": ${experienceLevel === "iniciante" ? 12 : experienceLevel === "intermediário" ? 10 : 8},
          "timer": ${experienceLevel === "iniciante" ? 90 : experienceLevel === "intermediário" ? 75 : 60},
          "order": 0
        }
      ]
    }
  ]
}

## REGRAS FINAIS - LEIA COM ATENÇÃO
- Crie EXATAMENTE ${daysPerWeek} treinos
- Use os dias em INGLÊS: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
- Cada treino: ${experienceLevel === "iniciante" ? "4-6" : experienceLevel === "intermediário" ? "6-8" : "7-10"} exercícios
- Sempre começar com compostos, terminar com isolados
- Respeitar volume semanal ideal por grupo
- Use APENAS exercícios do BANCO DE DADOS listado acima
- Use os nomes EXATAMENTE como escritos no banco (não invente variações)
- Justifique escolhas com base científica (interno, não exiba no JSON)`

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
      
      const validDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
      program.workouts = program.workouts.map((w, index) => {
        let mappedDay = w.dayOfWeek?.toUpperCase() || "";
        if (!validDays.includes(mappedDay)) {
           if (mappedDay.includes("TERÇA") || mappedDay.includes("TERCA") || mappedDay.includes("TUES")) mappedDay = "TUESDAY";
           else if (mappedDay.includes("QUARTA") || mappedDay.includes("WEDNESDAY")) mappedDay = "WEDNESDAY";
           else if (mappedDay.includes("QUINTA") || mappedDay.includes("THURSDAY")) mappedDay = "THURSDAY";
           else if (mappedDay.includes("SEXTA") || mappedDay.includes("FRIDAY")) mappedDay = "FRIDAY";
           else if (mappedDay.includes("SÁBADO") || mappedDay.includes("SABADO") || mappedDay.includes("SATURDAY")) mappedDay = "SATURDAY";
           else if (mappedDay.includes("DOMINGO") || mappedDay.includes("SUNDAY")) mappedDay = "SUNDAY";
           else if (mappedDay.includes("SEGUNDA") || mappedDay.includes("MONDAY")) mappedDay = "MONDAY";
           else mappedDay = validDays[index % validDays.length];
        }
        w.dayOfWeek = mappedDay;
        return w;
      });

      return program
    } catch (error: unknown) {
      console.error("AI_TRAINING_PROGRAM_ERROR:", error)
      throw new Error(`Erro ao gerar cartilha: ${error instanceof Error ? error.message : "desconhecido"}`)
    }
  }
}
