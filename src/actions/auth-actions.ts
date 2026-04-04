"use server"

import { signIn, signOut } from "@/lib/auth"
import { prisma } from "@/infrastructure/database/prisma"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"


export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email e senha são obrigatórios" }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciais inválidas" }
        default:
          return { error: "Erro na autenticação" }
      }
    }
    // IMPORTANTE: Next.js redirect joga um erro especial que deve ser repassado
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error
    }
    throw error
  }
}

export async function registerAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const gender = formData.get("gender") as string
  const trainingTime = formData.get("trainingTime") as string

  console.log("ACTION_DEBUG: Registration attempt", { name, email, gender, trainingTime })

  if (!email || !password || !name) {
    return { error: "Campos obrigatórios ausentes" }
  }

  try {
    console.log("ACTION_DEBUG: Checking for existing user")
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "Este email já está cadastrado" }
    }

    console.log("ACTION_DEBUG: Creating user in database")
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gender,
        trainingTime,
      },
    })

    console.log("ACTION_DEBUG: User created successfully", { id: user.id })

    // Auto login após registro
    console.log("ACTION_DEBUG: Signing in after registration")
    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
      })
    } catch (error) {
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        throw error
      }
      console.error("ACTION_DEBUG: SignIn error after registration:", error)
      return { success: true, message: "Conta criada, mas o login automático falhou. Faça login manualmente." }
    }

    return { success: true }
  } catch (error: unknown) {
    if (error instanceof Error && (error.message.includes("NEXT_REDIRECT") || error.message === "NEXT_REDIRECT")) {
      console.log("ACTION_DEBUG: Redirecting successfully")
      throw error
    }
    console.error("ACTION_DEBUG: Registration critical error", error)
    return { error: "ERRO CRÍTICO NO PROTOCOLO" }
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}
