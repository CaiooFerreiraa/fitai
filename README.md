# 🔥 FitAi - Treinos Inteligentes com IA

Plataforma de gerenciamento de treinos com feedback agressivo por inteligência artificial. Design brutalista-industrial focado em performance.

---

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **Auth.js** - Autenticação com credentials
- **Prisma** - ORM para PostgreSQL (Neon)
- **Groq API** - Inteligência Artificial
- **Tailwind CSS** - Estilização brutalista
- **Lucide React** - Ícones

---

## 🎯 Features

- 📋 **Planos de Treino** - Organize seus treinos por dia
- 🤖 **IA Coach** - Chat com inteligência artificial que entende seu progresso
- 📊 **Registro de Carga** - Acompanhe sua evolução
- 💪 **Feedback Agressivo** - IA motiva de forma brutal
- 🏋️ **Cartilhas Automáticas** - Gere programas de treino via IA
- 👑 **Sistema Premium** - R$ 15/mês para acesso total à IA

---

## 🛠️ Setup

```bash
# Instalar dependências
bun install

# Configurar banco (Neon PostgreSQL)
# Edite o .env com sua DATABASE_URL

# Gerar Prisma Client
bun prisma generate

# Executar migration
bun prisma db push

# Iniciar servidor
bun dev
```

---

## 🔧 Variáveis de Ambiente

```env
# Banco de Dados (Neon/Postgres)
DATABASE_URL="postgresql://..."

# Auth.js
AUTH_SECRET="sua-chave-secreta"

# Groq API (IA)
GROQ_API_KEY="sua-chave-groq"
```

---

## 📱 Páginas

- `/` - Home com treino do dia
- `/login` - Login
- `/register` - Cadastro
- `/profile` - Perfil e biometria
- `/config` - Configuração de treinos
- `/workout/[id]` - Sessão de treino
- `/programs` - Cartilhas de treino
- `/ai-coach` - Chat com IA
- `/premium` - Informações do plano

---

## 🎨 Design

- Estilo **Brutalist-Industrial** (Red Aura)
- Cores: #ff0033 (primária), #0a0a0b (fundo)
- Tipografia: Inter + Italic Black
- Mobile-first

---

## 📄 Licença

MIT © 2026 FitAi
