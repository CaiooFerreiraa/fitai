"use server"

import { signIn, signOut } from "@/lib/auth"
import prisma from "@/infrastructure/database/prisma"
import { AuthError } from "next-auth"

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("ACTION_DEBUG: Login attempt", { email, hasPassword: !!password })

  if (!email || !password) {
    console.error("ACTION_DEBUG: Missing credentials")
    return { error: "DADOS INVÁLIDOS. NÃO TENTE ENGANAR O SISTEMA." }
  }

  try {
    console.log("ACTION_DEBUG: Calling signIn")
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      console.log("ACTION_DEBUG: Redirecting...")
      throw error
    }
    
    console.error("ACTION_DEBUG: Login error", error)
    
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "CREDENCIAIS REJEITADAS. ACESSO NEGADO À BASE." }
        default:
          return { error: "FALHA CRÍTICA NA AUTENTICAÇÃO. TENTE NOVAMENTE." }
      }
    }
    throw error
  }
}

export async function registerAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const dateOfBirth = formData.get("dateOfBirth") as string
  const gender = formData.get("gender") as string
  const trainingTime = formData.get("trainingTime") as string

  console.log("ACTION_DEBUG: Registration attempt", { name, email, gender, trainingTime })

  if (!name || !email || !password || !dateOfBirth || !gender || !trainingTime) {
    console.error("ACTION_DEBUG: Missing registration fields", {
      name: !!name,
      email: !!email,
      password: !!password,
      dateOfBirth: !!dateOfBirth,
      gender: !!gender,
      trainingTime: !!trainingTime
    })
    return { error: "CAMPOS INCOMPLETOS. O SISTEMA EXIGE DADOS TOTAIS." }
  }

  const bcrypt = await import("bcryptjs")
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    console.log("ACTION_DEBUG: Checking for existing user")
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.error("ACTION_DEBUG: Email already registered")
      return { error: "EMAIL JÁ CADASTRADO. NÃO TENTE DUPLICAR IDENTIDADES." }
    }

    console.log("ACTION_DEBUG: Creating user in database")
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        trainingTime,
      }
    })
    console.log("ACTION_DEBUG: User created successfully", { id: newUser.id })

    console.log("ACTION_DEBUG: Signing in after registration")
    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/",
      })
    } catch (error) {
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        throw error
      }
      console.error("ACTION_DEBUG: SignIn error after registration:", error)
      return { success: true, message: "Conta criada, mas o login automático falhou. Faça login manualmente." }
    }

    return { success: true }
  } catch (error: any) {
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
