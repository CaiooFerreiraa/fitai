"use server"

import { auth } from "@/lib/auth"
import { PrismaWorkoutRepository } from "@/infrastructure/repositories/prisma-workout-repository"
import { WorkoutPlan } from "@/domain/entities/workout"
import { revalidatePath } from "next/cache"

const workoutRepo = new PrismaWorkoutRepository()

export async function saveWorkoutPlanAction(plan: Omit<WorkoutPlan, "userId">) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await workoutRepo.save({
    ...plan,
    userId: session.user.id
  })

  revalidatePath("/dashboard")
  revalidatePath("/config")
  
  return { success: true }
}

export async function getMyWorkoutPlans() {
  const session = await auth()
  if (!session?.user?.id) return []

  return await workoutRepo.findByUserId(session.user.id)
}
