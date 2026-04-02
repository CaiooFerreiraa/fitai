"use server"

import { auth } from "@/lib/auth"
import prisma from "@/infrastructure/database/prisma"
import { PrismaLogRepository } from "@/infrastructure/repositories/prisma-log-repository"
import { GetAiIncentiveUseCase } from "@/domain/use-cases/get-ai-incentive"
import { GetAiTrainingRecommendationUseCase } from "@/domain/use-cases/get-ai-training-recommendation"
import { WorkoutLog } from "@/domain/entities/log"
import { GetAiSloganUseCase, SloganContext } from "@/domain/use-cases/get-ai-slogan"
import { GetAiCoachAdviceUseCase } from "@/domain/use-cases/get-ai-coach-advice"
import { getUserProfile } from "./profile-actions"

const logRepo = new PrismaLogRepository()
const aiUseCase = new GetAiIncentiveUseCase(logRepo)
const aiRecommendUseCase = new GetAiTrainingRecommendationUseCase()
const sloganUseCase = new GetAiSloganUseCase()

export async function logExerciseAction(data: {
  exerciseId: string
  weight: number
  reps: number
  sets: number
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const workoutLog: WorkoutLog = {
    userId: session.user.id,
    date: new Date(),
    logs: [
      {
        exerciseId: data.exerciseId,
        weight: data.weight,
        repsReached: data.reps,
        setsReached: data.sets,
      }
    ]
  }

  await logRepo.save(workoutLog)
  const incentive = await aiUseCase.execute(session.user.id, data.weight, data.exerciseId)
  return { success: true, incentive }
}

export async function getAiRecommendationAction() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return await aiRecommendUseCase.execute(session.user.id)
}

export async function getLatestLogAction(exerciseId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const stats = await logRepo.getRecentStats(session.user.id, exerciseId)
  return stats[0] || null
}

export async function getAiSlogansAction(contexts: SloganContext[]) {
  const slogans: Record<string, string> = {}
  await Promise.all(contexts.map(async (ctx) => { slogans[ctx] = await sloganUseCase.execute(ctx) }))
  return slogans as Record<SloganContext, string>
}

export async function getAiCoachAdviceAction(userQuestion?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Check if user is premium
  const user = await prisma.$queryRaw<Array<{isPremium: boolean}>>`
    SELECT "isPremium" FROM "User" WHERE id = ${session.user.id}
  `

  if (!user[0]?.isPremium) {
    throw new Error("PREMIUM_REQUIRED")
  }

  const profile = await getUserProfile()
  const history = await logRepo.getGlobalHistory(session.user.id)

  // Transform profile to UserStats or use default values
  const userStats = profile ? {
    name: profile.name,
    weight: profile.weight,
    height: profile.height,
    goal: profile.goal,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    trainingTime: profile.trainingTime,
  } : {
    name: null,
    weight: null,
    height: null,
    goal: null,
    dateOfBirth: null,
    gender: null,
    trainingTime: null,
  }

  // Create coach instance with userId for tool calls
  const coachUseCase = new GetAiCoachAdviceUseCase(session.user.id)
  return await coachUseCase.execute(userStats, history, userQuestion)
}
