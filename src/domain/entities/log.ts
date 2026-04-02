export interface ExerciseLog {
  exerciseId: string
  weight: number
  setsReached?: number
  repsReached?: number
}

export interface WorkoutLog {
  userId: string
  date: Date
  logs: ExerciseLog[]
}
