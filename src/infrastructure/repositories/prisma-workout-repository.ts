import prisma from "@/infrastructure/database/prisma"
import { WorkoutPlan, Exercise } from "@/domain/entities/workout"

export class PrismaWorkoutRepository {
  async findByUserId(userId: string): Promise<WorkoutPlan[]> {
    const plans = await prisma.workoutPlan.findMany({
      where: { userId },
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

    await prisma.workoutPlan.upsert({
      where: { userId_dayOfWeek: { userId, dayOfWeek } },
      update: {
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
      create: {
        userId,
        dayOfWeek,
        name,
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

  async delete(userId: string, dayOfWeek: string): Promise<void> {
    await prisma.workoutPlan.delete({
      where: { userId_dayOfWeek: { userId, dayOfWeek } },
    })
  }
}
