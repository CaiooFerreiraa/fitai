"use server"

import { auth } from "@/lib/auth"
import prisma from "@/infrastructure/database/prisma"
import { PrismaWorkoutRepository } from "@/infrastructure/repositories/prisma-workout-repository"
import { WorkoutPlan, DayOfWeek } from "@/domain/entities/workout"
import { revalidatePath } from "next/cache"

const workoutRepo = new PrismaWorkoutRepository()

export async function saveWorkoutPlanAction(plan: Omit<WorkoutPlan, "userId">, programId?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Find existing based on dayOfWeek and (programId OR standalone)
  const existingPlan = await prisma.workoutPlan.findFirst({
    where: {
      userId: session.user.id,
      dayOfWeek: plan.dayOfWeek,
      trainingProgramId: programId || null,
    },
  })

  if (existingPlan) {
    await prisma.workoutPlan.update({
      where: { id: existingPlan.id },
      data: {
        name: plan.name,
        exercises: {
          deleteMany: {},
          create: plan.exercises.map((e, index) => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            timer: e.timer,
            order: e.order || index,
          })),
        },
      },
    })
  } else {
    await prisma.workoutPlan.create({
      data: {
        userId: session.user.id,
        dayOfWeek: plan.dayOfWeek,
        name: plan.name,
        trainingProgramId: programId || null,
        exercises: {
          create: plan.exercises.map((e, index) => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            timer: e.timer,
            order: e.order || index,
          })),
        },
      },
    })
  }

  revalidatePath("/dashboard")
  revalidatePath("/config")
  
  return { success: true }
}

export async function getProgramsAction() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  return await prisma.trainingProgram.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      workoutPlans: {
        include: { exercises: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })
}

export async function moveWorkoutPlanAction(originalDay: DayOfWeek, newDay: DayOfWeek, programId?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const existingSource = await prisma.workoutPlan.findFirst({
    where: { userId: session.user.id, dayOfWeek: originalDay, trainingProgramId: programId || null }
  })

  if (!existingSource) {
    throw new Error("No source plan found to move.")
  }

  const existingTarget = await prisma.workoutPlan.findFirst({
    where: { userId: session.user.id, dayOfWeek: newDay, trainingProgramId: programId || null }
  })

  // If there's a plan in target, delete it to overwrite (or we could swap, but overwrite is simpler for now)
  if (existingTarget) {
     await prisma.workoutPlan.delete({ where: { id: existingTarget.id } })
  }

  await prisma.workoutPlan.update({
    where: { id: existingSource.id },
    data: { dayOfWeek: newDay }
  })

  revalidatePath("/programs")
  if (programId) {
    revalidatePath(`/programs/${programId}/edit`)
  } else {
    revalidatePath("/config")
  }
}

export async function getMyWorkoutPlans(programId?: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  const plans = await prisma.workoutPlan.findMany({
    where: {
      userId: session.user.id,
      trainingProgramId: programId || null,
    },
    include: { exercises: { orderBy: { order: "asc" } } },
  })

  return plans.map((p: any) => ({
    id: p.id,
    userId: p.userId,
    dayOfWeek: p.dayOfWeek,
    name: p.name || undefined,
    exercises: p.exercises.map((e: any) => ({
      id: e.id,
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      timer: e.timer,
      order: e.order,
    })),
  }))
}
