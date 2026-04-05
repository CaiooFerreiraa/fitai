"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/infrastructure/database/prisma"

export interface ExerciseProgressPoint {
  date: string
  weight: number
  setsReached: number
  repsReached: number
}

export interface ExerciseStats {
  exerciseId: string
  exerciseName: string
  totalSessions: number
  maxWeight: number
  firstWeight: number
  lastWeight: number
  progression: number // percentage
  history: ExerciseProgressPoint[]
}

export interface WorkoutHistoryLog {
  id: string
  date: string
  exerciseCount: number
  totalVolume: number
  exerciseLogs: {
    id: string
    weight: number
    setsReached: number | null
    repsReached: number | null
    exercise: {
      id: string
      name: string
      sets: number
      reps: number
    }
  }[]
}

export interface HistoryStats {
  totalSessions: number
  totalExercises: number
  totalVolume: number
  consistency: number // %
  streak: number // days
  lastSession: WorkoutHistoryLog | null
  exerciseStats: ExerciseStats[]
  logs: WorkoutHistoryLog[]
}

type Period = "7d" | "30d" | "90d" | "all"

function getPeriodStart(period: Period): Date | null {
  const now = new Date()
  switch (period) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case "all":
      return null
  }
}

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

export async function getHistoryStats(period: Period = "30d"): Promise<HistoryStats> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const periodStart = getPeriodStart(period)
  const whereClause = {
    userId: session.user.id,
    ...(periodStart ? { date: { gte: periodStart } } : {})
  }

  const logs = await prisma.workoutLog.findMany({
    where: whereClause,
    include: {
      exerciseLogs: {
        include: { exercise: true }
      }
    },
    orderBy: { date: "desc" }
  })

  // Last session (always global, regardless of period)
  const lastSessionRaw = await prisma.workoutLog.findFirst({
    where: { userId: session.user.id },
    include: {
      exerciseLogs: { include: { exercise: true } }
    },
    orderBy: { date: "desc" }
  })

  const mapLog = (log: typeof logs[0]): WorkoutHistoryLog => ({
    id: log.id,
    date: log.date.toISOString(),
    exerciseCount: log.exerciseLogs.length,
    totalVolume: log.exerciseLogs.reduce(
      (acc, el) => acc + el.weight * (el.setsReached ?? 1) * (el.repsReached ?? 1),
      0
    ),
    exerciseLogs: log.exerciseLogs.map((el) => ({
      id: el.id,
      weight: el.weight,
      setsReached: el.setsReached,
      repsReached: el.repsReached,
      exercise: {
        id: el.exercise.id,
        name: el.exercise.name,
        sets: el.exercise.sets,
        reps: el.exercise.reps
      }
    }))
  })

  const mappedLogs = logs.map(mapLog)
  const lastSession = lastSessionRaw ? mapLog(lastSessionRaw) : null

  const totalVolume = mappedLogs.reduce((acc, l) => acc + l.totalVolume, 0)
  const totalExercises = mappedLogs.reduce((acc, l) => acc + l.exerciseCount, 0)

  // Streak calculation
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sessionDays = [...new Set(
    logs.map(l => {
      const d = new Date(l.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )].sort((a, b) => b - a)

  for (let i = 0; i < sessionDays.length; i++) {
    const expected = today.getTime() - i * 24 * 60 * 60 * 1000
    if (sessionDays[i] === expected) {
      streak++
    } else {
      break
    }
  }

  // Consistency: days trained / total days in period
  const periodDays = period === "all" ? 90 : parseInt(period)
  const consistency = Math.min(100, Math.round((sessionDays.length / periodDays) * 100))

  // Exercise stats grouped
  const exerciseMap = new Map<string, ExerciseStats>()
  for (const log of logs) {
    for (const el of log.exerciseLogs) {
      const existing = exerciseMap.get(el.exerciseId)
      const point: ExerciseProgressPoint = {
        date: log.date.toISOString(),
        weight: el.weight,
        setsReached: el.setsReached ?? el.exercise.sets,
        repsReached: el.repsReached ?? el.exercise.reps
      }
      if (!existing) {
        exerciseMap.set(el.exerciseId, {
          exerciseId: el.exerciseId,
          exerciseName: el.exercise.name,
          totalSessions: 1,
          maxWeight: el.weight,
          firstWeight: el.weight,
          lastWeight: el.weight,
          progression: 0,
          history: [point]
        })
      } else {
        existing.totalSessions++
        existing.maxWeight = Math.max(existing.maxWeight, el.weight)
        existing.lastWeight = el.weight
        existing.history.push(point)
      }
    }
  }

  // Compute progression %
  const exerciseStats: ExerciseStats[] = Array.from(exerciseMap.values()).map((s) => {
    const sorted = [...s.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const first = sorted[0]?.weight ?? 0
    const last = sorted[sorted.length - 1]?.weight ?? 0
    const progression = first > 0 ? Math.round(((last - first) / first) * 100) : 0
    return {
      ...s,
      firstWeight: first,
      lastWeight: last,
      progression,
      history: sorted
    }
  }).sort((a, b) => b.totalSessions - a.totalSessions)

  return {
    totalSessions: mappedLogs.length,
    totalExercises,
    totalVolume,
    consistency,
    streak,
    lastSession,
    exerciseStats,
    logs: mappedLogs
  }
}
