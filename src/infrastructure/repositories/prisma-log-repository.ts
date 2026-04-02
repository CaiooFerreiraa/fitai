import prisma from "@/infrastructure/database/prisma"
import { ExerciseLog, WorkoutLog } from "@/domain/entities/log"

export class PrismaLogRepository {
  async save(log: WorkoutLog): Promise<void> {
    await prisma.workoutLog.create({
      data: {
        userId: log.userId,
        date: log.date,
        exerciseLogs: {
          create: log.logs.map(l => ({
            exerciseId: l.exerciseId,
            weight: l.weight,
            setsReached: l.setsReached,
            repsReached: l.repsReached,
          })),
        },
      },
    })
  }

  async getRecentStats(userId: string, exerciseId: string): Promise<ExerciseLog[]> {
    const history = await prisma.exerciseLog.findMany({
      where: { 
        exerciseId, 
        workoutLog: { userId } 
      },
      orderBy: { createdAt: "desc" },
      take: 5
    })
    
    return history.map((h: any) => ({
      exerciseId: h.exerciseId,
      weight: h.weight,
      setsReached: h.setsReached ?? undefined,
      repsReached: h.repsReached ?? undefined
    }))
  }

  async getGlobalHistory(userId: string): Promise<any[]> {
    return await prisma.exerciseLog.findMany({
      where: { workoutLog: { userId } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { exercise: true }
    })
  }
}
