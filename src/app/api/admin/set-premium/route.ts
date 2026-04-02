import { NextResponse } from "next/server"
import prisma from "@/infrastructure/database/prisma"

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email obrigatório" },
        { status: 400 }
      )
    }

    // Use raw SQL to bypass TypeScript cache issue
    const result = await prisma.$executeRaw`
      UPDATE "User"
      SET "isPremium" = true
      WHERE email = ${email}
    `

    if (result === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Verify update
    const user = await prisma.$queryRaw<Array<{id: string; email: string | null; name: string | null; isPremium: boolean}>>`
      SELECT id, email, name, "isPremium"
      FROM "User"
      WHERE email = ${email}
    `

    return NextResponse.json({
      message: "Usuário atualizado para Premium",
      user: user[0]
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("SET PREMIUM ERROR:", errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
