import { NextResponse } from "next/server"
import prisma from "@/infrastructure/database/prisma"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: "FALHA ESTRUTURAL. COMPLETE TODOS OS CAMPOS." },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "ATLETA JÁ CADASTRADO." },
        { status: 409 }
      )
    }

    const bcrypt = await import("bcryptjs")
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split("@")[0],
      },
    })

    return NextResponse.json(
      { message: "SUCESSO.", user: { id: newUser.id, email: newUser.email } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { message: "ERRO CRÍTICO NO BANCO." },
      { status: 500 }
    )
  }
}
