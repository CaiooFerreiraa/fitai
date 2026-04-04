"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/infrastructure/database/prisma"

export async function getWorkoutHistory() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  return await prisma.workoutLog.findMany({
    where: { userId: session.user.id },
    include: {
      exerciseLogs: {
        include: {
          exercise: true
        }
      }
    },
    orderBy: {
      date: "desc"
    }
  })
}
