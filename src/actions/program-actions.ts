"use server"

import { auth } from "@/lib/auth"
import prisma from "@/infrastructure/database/prisma"
import { GetAiTrainingProgramUseCase } from "@/domain/use-cases/get-ai-training-program"
import { revalidatePath } from "next/cache"

const aiProgramUseCase = new GetAiTrainingProgramUseCase()

export async function generateTrainingProgramAction(skipRevalidation: boolean = false) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const userId: string = session.user.id

  // Generate program via AI
  const programStructure = await aiProgramUseCase.execute(userId)

  // Save to database
  const program = await prisma.trainingProgram.create({
    data: {
      userId,
      name: programStructure.name,
      description: programStructure.description,
      goal: programStructure.goal,
      duration: programStructure.duration,
      workoutPlans: {
        create: programStructure.workouts.map((workout) => ({
          userId,
          dayOfWeek: workout.dayOfWeek,
          name: workout.name,
          exercises: {
            create: workout.exercises.map((ex) => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              timer: ex.timer,
              order: ex.order,
            }))
          }
        }))
      }
    },
    include: {
      workoutPlans: {
        include: {
          exercises: true
        }
      }
    }
  })

  if (!skipRevalidation) {
    revalidatePath("/programs")
    revalidatePath("/")
  }
  
  return { success: true, programId: program.id }
}

export async function listTrainingProgramsAction() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const programs = await prisma.trainingProgram.findMany({
    where: { userId: session.user.id },
    include: {
      workoutPlans: {
        include: {
          exercises: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return programs
}

export async function setActiveProgramAction(programId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Verify ownership
  const program = await prisma.trainingProgram.findFirst({
    where: {
      id: programId,
      userId: session.user.id
    }
  })

  if (!program) throw new Error("Program not found")

  // Update user's active program
  await prisma.user.update({
    where: { id: session.user.id },
    data: { activeProgramId: programId }
  })

  revalidatePath("/programs")
  revalidatePath("/")
  
  return { success: true }
}

export async function deleteProgramAction(programId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Verify ownership
  const program = await prisma.trainingProgram.findFirst({
    where: {
      id: programId,
      userId: session.user.id
    }
  })

  if (!program) throw new Error("Program not found")

  // Remove as active if it's active
  await prisma.user.updateMany({
    where: {
      id: session.user.id,
      activeProgramId: programId
    },
    data: {
      activeProgramId: null
    }
  })

  // Delete program (cascade will delete workout plans and exercises)
  await prisma.trainingProgram.delete({
    where: { id: programId }
  })

  revalidatePath("/programs")
  revalidatePath("/")
  
  return { success: true }
}
