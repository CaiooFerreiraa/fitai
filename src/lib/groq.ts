import Groq from "groq-sdk"

if (!process.env.GROQ_API_KEY) {
  console.warn("⚠️ GROQ_API_KEY não encontrada no .env. A IA não funcionará.")
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
})

export default groq
