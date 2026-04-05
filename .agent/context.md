# Contexto do Projeto

## Descrição
FitAi - Plataforma de gerenciamento de treinos brutaista-industrial com feedback agressivo por IA.

## Stack / Tecnologias
Next.js 15, Auth.js, Prisma, Neon (PostgreSQL), Groq API, Tailwind CSS, Lucide React.

## Convenções e Padrões
- Design Brutalista-Industrial (Red Aura).
- Tipografia: Inter (Corpo), Italic Black (Display).
- Cores: #ff0033 (Primária), #0a0a0b (Fundo), #1c1c1f (Superfície).
- Componentes Mobile-First com breakpoints xs (375px) e 3xl (1920px).

## Notas Importantes
- O design deve evocar profundidade táctica (sombras em camadas, noise overlays).
- Feedback da IA deve ser agressivo e focado em performance "Alpha".

---

## Banco de Dados

### Banco
PostgreSQL (Neon)

### ORM / Query Builder
Prisma

### Convenções de Migration
Tabelas em snake_case, migrations gerenciadas via Prisma CLI.

### Estrutura Principal
- `User`: Autenticação e perfil tático.
- `WorkoutPlan`: Planos de treino por dia da semana.
- `Exercise`: Exercícios individuais com séries e metas.
- `TrainingLog`: Histórico de execução e feedback da IA.

---

## Design

### Design System
Custom Brutalist-Tactical (Red Aura)

### Tipografia
- Display: Inter Black Italic (com tracking negativo).
- Body: Inter SemiBold/Bold.

### Paleta de Cores
- primary: #ff0033
- accent: #9a0022
- background: #0a0a0b
- surface: #1c1c1f
- alert: #ff1100

### Espaçamento e Grid
Escala de 4px, paddings agressivos (p-10+), gap largo entre cards tácticos.

### Componentes Base
- `.brutalist-card`: Cards com profundidade e noise.
- `.noise-overlay`: Textura granulada global.
- `.aura-bg`: Gradientes radiais pulsantes.

### Acessibilidade
Contraste alto (Branco/Vermelho sobre Preto).

### Animações e Transições
- `aura-pulse`: 4s loop.
- `glitch`: Interações de hover agressivas.
- Transições de 200ms–500ms para mudança de estado táctico.

### Breakpoints
- xs: 375px
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 3xl: 1920px

### Notas de Design
Evitar cores chapadas ou bordas suaves. Tudo deve parecer físico, pesado e industrial.
- **Navbar**: Estritamente mobile (oculta via CSS `!important` em telas >= 1024px).
- **Home**: Layout compacto para PC para evitar scroll excessivo; fonts menores no PC.
- **Quick Log**: Funcionalidade na home para registro tático imediato de carga/reps.

---

## Histórico Visual

### Tema Completo - TC - v1
**Data:** 2026-04-02
**Motivo:** Implementação inicial do sistema Red Aura.

```json
{
  "primary": "#ff0033",
  "background": "#0a0a0b",
  "surface": "#1c1c1f",
  "shadows": {
    "brutalist": "10px 10px 0 0 #000000",
    "tactical": "0 20px 50px rgba(0,0,0,1)"
  }
}
```

---

## Histórico de Decisões

- [2026-04-02] Design — Implementado sistema de profundidade "Deep Aura" com multi-layered radial gradients em globals.css.
- [2026-04-02] Design — Introdução dos breakpoints `xs` e `3xl` no Tailwind para escalonamento agressivo de tipografia.
- [2026-04-02] UI — Refatoração da Home, Treino, Perfil e Configuração para eliminar visual "flat" e otimizar para celular.
- [2026-04-02] UI — Padronização completa de todas as pages (Login, Register, Home, Profile, Config, Workout) com layout brutalista-industrial fiel ao modelo de referência. CTA de Login/Register alterado para branco/preto (conforme imagem de referência). Accent verde removido, vermelho #ff0033 consolidado em 100% das telas.
- [2026-04-02] UI — Criação de sistema de header sticky + bottom-nav mobile reutilizável (`.bottom-nav`) em globals.css. Aplicado em Home, Profile, Config, Workout.
- [2026-04-02] UI — Adição de `.bg-watermark` e `.status-bar` como utilitários CSS globais para consistência entre pages de auth.
- [2026-04-02] Layout — Login e Register: split-screen lg:2col (manifesto esquerdo, formulário direito). Mobile: formulário centralizado com logo inline.
- [2026-04-02] Design — Implementação da Navbar estritamente mobile (oculta no PC via CSS).
- [2026-04-02] UI — Migração de todos os toasts para Sonner com estilo brutalista.
- [2026-04-02] UX — Adição do "Quick Log" na Home com pre-fill automático dos últimos dados salvos (carga/reps).
- [2026-04-02] Design — Otimização de font-sizes e espaçamentos na Home e Perfil para melhor ajuste em PC (full-screen view).
- [2026-04-02] Code — Conversão da página de Perfil para Client Component para suporte a toasts e feedback visual de carregamento.
- [2026-04-02] Auth — Corrigido bug crítico em Auth.js: usuário cadastrado com `email: null` bloqueava login. Implementado reset via `/api/debug/reset-user` e validação explícita de email obrigatório no registro.
- [2026-04-02] Auth — Cadastrado usuário principal: `caioferreiraadev@gmail.com` com senha hashada via bcrypt (hash: `$2b$10$...`). Login operacional.
- [2026-04-02] IA — Implementado sistema de personalização do agente de IA usando dados do perfil do usuário (nome, peso, altura, objetivo). Todos os use cases (GetAiIncentiveUseCase, GetAiCoachAdviceUseCase, GetAiTrainingRecommendationUseCase) agora chamam o usuário pelo nome e contextualizam feedback com biometria e objetivo pessoal. Tipagem explícita adicionada em todos os parâmetros e retornos.
- [2026-04-02] UX — Ajustado AI Coach para respostas mais curtas (máximo 25 palavras) e fonte maior (text-lg/text-xl) para melhor legibilidade. Removido `uppercase` das mensagens para reduzir peso visual.
- [2026-04-02] Feature — Implementado sistema completo de cartilhas de treino geradas por IA. Criada tabela `TrainingProgram` com relação N:1 para `WorkoutPlan`. Use case `GetAiTrainingProgramUseCase` gera cartilha completa via Groq (4-6 treinos/semana, JSON estruturado). Página `/programs` permite criar múltiplas cartilhas, selecionar cartilha ativa e deletar. Campo `activeProgramId` em User rastreia cartilha ativa. Actions: `generateTrainingProgramAction`, `listTrainingProgramsAction`, `setActiveProgramAction`, `deleteProgramAction`.
- [2026-04-02] Monetização — Implementado sistema de plano Premium (R$ 15/mês). Campo `isPremium` (boolean) adicionado em User. Actions de IA verificam premium e lançam erro `PREMIUM_REQUIRED` para usuários free. Rota `/api/admin/set-premium` permite ativar premium via email. Usuário principal `caioferreiraadev@gmail.com` ativado como Premium com perfil: 66kg, 1.80m, objetivo "ganhar massa magra".
- [2026-04-02] IA Agents — Implementado sistema de Tool Calls no GetAiCoachAdviceUseCase. A IA agora pode executar ações no sistema: `update_profile` (atualiza peso, altura, objetivo no banco) e `generate_training_program` (gera cartilha via Groq). Usando function calling do Groq com modelo llama-3.3-70b-versatile.
- [2026-04-04] Config — Adicionado `allowedDevOrigins: ["192.168.1.100"]` no `next.config.ts` para permitir HMR e acesso via rede local.
- [2026-04-04] Auth — Restaurado `src/actions/auth-actions.ts` de um estado corrompido. Corrigido tratamento de `NEXT_REDIRECT` para evitar erros de sintaxe e garantir redirecionamento correto após registro/login.
- [2026-04-04] Code — Corrigido caminho de importação do Prisma em `src/actions/auth-actions.ts` de `@/lib/prisma` para `@/infrastructure/database/prisma`.
- [2026-04-04] UX/Feature — Adicionada funcionalidade de edição de cartilhas. O componente `ConfigPage` foi extraído para `ConfigEditor` para ser reutilizado. A rota `/programs/[id]/edit` foi criada para suportar a edição in-place das cartilhas, salvando como `trainingProgramId = id` ao invés de `standalone`.
- [2026-04-05] Feature — Histórico de treinos completamente redesenhado. Actions: `getHistoryStats(period)` retorna totalSessions, totalExercises, totalVolume, streak, consistency%, lastSession e exerciseStats por período (7d/30d/90d/all). Page: seletor de período, cards de stats, spotlight da última sessão, gráfico de barras inline por exercício (MiniBarChart), diário de missões completo.
- [2026-04-05] Feature — Retomada de sessão de treino. `WorkoutSession` salva estado no `localStorage` com chave `fitai_session_{planId}` a cada mudança de estado. Ao voltar para a página do treino, o estado é restaurado automaticamente com banner dismissível "SESSÃO ANTERIOR RESTAURADA". Sessões expiram após 6h. Botão "REINICIAR SESSÃO" limpa o estado.
- [2026-04-05] UX — Banner de "SESSÃO EM ANDAMENTO" na home page. `getActiveSession()` varre o localStorage após carregar os planos e exibe um banner tático com link direto para o treino em andamento, mostrando o exercício atual e total.
