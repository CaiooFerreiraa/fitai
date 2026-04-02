import prisma from "@/infrastructure/database/prisma"
import { WorkoutPlan, Exercise } from "@/domain/entities/workout"

export class PrismaWorkoutRepository {
  async findByUserId(userId: string): Promise<WorkoutPlan[]> {
    const plans = await prisma.workoutPlan.findMany({
      where: {
        userId,
        trainingProgramId: null, // Only standalone plans
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

  async save(plan: WorkoutPlan): Promise<void> {
    const { userId, dayOfWeek, name, exercises } = plan

    // Find existing standalone workout plan (not part of a training program)
    const existingPlan = await prisma.workoutPlan.findFirst({
      where: {
        userId,
        dayOfWeek,
        trainingProgramId: null, // Only standalone plans
      },
    })

    if (existingPlan) {
      // Update existing plan
      await prisma.workoutPlan.update({
        where: { id: existingPlan.id },
        data: {
          name,
          exercises: {
            deleteMany: {},
            create: exercises.map((e, index) => ({
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
      // Create new standalone plan
      await prisma.workoutPlan.create({
        data: {
          userId,
          dayOfWeek,
          name,
          trainingProgramId: null, // Standalone plan
          exercises: {
            create: exercises.map((e, index) => ({
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
  }

  async delete(userId: string, dayOfWeek: string): Promise<void> {
    // Find standalone workout plan (not part of a training program)
    const plan = await prisma.workoutPlan.findFirst({
      where: {
        userId,
        dayOfWeek,
        trainingProgramId: null, // Only standalone plans
      },
    })

    if (plan) {
      await prisma.workoutPlan.delete({
        where: { id: plan.id },
      })
    }
  }
}
