"use server"

import { signIn, signOut } from "@/lib/auth"
import prisma from "@/infrastructure/database/prisma"
import { AuthError } from "next-auth"

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("LOGIN_ATTEMPT:", { email })

  if (!email || !password) {
    return { error: "DADOS INVÁLIDOS. NÃO TENTE ENGANAR O SISTEMA." }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("LOGIN_ERROR:", message)
    
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "CREDENCIAIS REJEITADAS. ACESSO NEGADO À BASE." }
        default:
          return { error: "FALHA CRÍTICA NA AUTENTICAÇÃO. TENTE NOVAMENTE." }
      }
    }
    // Rethrow to allow Next.js NEXT_REDIRECT to work
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

  if (!name || !email || !password || !dateOfBirth || !gender || !trainingTime) {
    return { error: "CAMPOS INCOMPLETOS. O SISTEMA EXIGE DADOS TOTAIS." }
  }

  const bcrypt = await import("bcryptjs")
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "EMAIL JÁ CADASTRADO. NÃO TENTE DUPLICAR IDENTIDADES." }
    }

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        trainingTime,
      }
    })

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "FALHA AO REGISTRAR. O SISTEMA REJEITOU SUA ENTRADA." }
    }
    // Rethrow to allow Next.js NEXT_REDIRECT to work
    throw error
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}
