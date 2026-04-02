export interface Exercise {
  id?: string
  name: string
  sets: number
  reps: number
  timer: number // em segundos
  order: number
}

export interface WorkoutPlan {
  id?: string
  userId: string
  dayOfWeek: string
  name?: string
  exercises: Exercise[]
}

export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]
