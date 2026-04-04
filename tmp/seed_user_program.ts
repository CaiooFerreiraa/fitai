import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const userId = "cmnjvbm480000ovo4qgkoc1so" // The user id used previously
  const email = "caioferreiraadev@gmail.com"

  console.log(`Seeding actual PPL-UL training program for user: ${email} (${userId})`)

  // Delete previous standalone workouts
  await prisma.workoutPlan.deleteMany({
    where: { userId }
  })
  
  // Delete previous training programs to avoid clutter
  await prisma.trainingProgram.deleteMany({
    where: { userId }
  })

  // 1. Create the Training Program
  const trainingProgram = await prisma.trainingProgram.create({
    data: {
      userId,
      name: "Protocolo Brutalista - PPL-UL",
      description: "Push, Pull, Legs, Upper, Lower. Foco máximo e destruição muscular.",
      goal: "Hipertrofia Extrema",
      duration: "Ate A Falha",
    },
  })

  const programId = trainingProgram.id
  console.log(`Program created: ${programId}`)

  // 2. Create Workout Plans and Exercises
  const workouts = [
    {
      dayOfWeek: "MONDAY",
      name: "Push",
      exercises: [
        { name: "Supino inclinado smith", sets: 2, reps: 10, timer: 90, order: 0 },
        { name: "Supino máquina", sets: 2, reps: 10, timer: 90, order: 1 },
        { name: "Voador máquina", sets: 2, reps: 12, timer: 60, order: 2 },
        { name: "Desenvolvimento máquina", sets: 2, reps: 10, timer: 90, order: 3 },
        { name: "Elevação lateral polia", sets: 3, reps: 12, timer: 60, order: 4 },
        { name: "Tríceps polia unilateral", sets: 3, reps: 12, timer: 60, order: 5 },
      ],
    },
    {
      dayOfWeek: "TUESDAY",
      name: "Pull",
      exercises: [
        { name: "Remada máquina articulada", sets: 2, reps: 10, timer: 90, order: 0 },
        { name: "Puxada alta triângulo", sets: 2, reps: 10, timer: 90, order: 1 },
        { name: "Remada baixa", sets: 2, reps: 10, timer: 90, order: 2 },
        { name: "Voador invertido", sets: 3, reps: 15, timer: 60, order: 3 },
        { name: "Rosca Scott", sets: 2, reps: 10, timer: 60, order: 4 },
        { name: "Flexão de punho", sets: 2, reps: 15, timer: 60, order: 5 },
      ],
    },
    {
      dayOfWeek: "WEDNESDAY",
      name: "Legs",
      exercises: [
        { name: "Agachamento livre", sets: 2, reps: 8, timer: 120, order: 0 },
        { name: "Cadeira flexora", sets: 2, reps: 10, timer: 90, order: 1 },
        { name: "Cadeira extensora unilateral", sets: 3, reps: 12, timer: 60, order: 2 },
        { name: "Flexão em pé", sets: 2, reps: 10, timer: 60, order: 3 },
        { name: "Panturrilha máquina", sets: 3, reps: 15, timer: 60, order: 4 },
        { name: "Cadeira abdominal", sets: 3, reps: 15, timer: 60, order: 5 },
      ],
    },
    {
      dayOfWeek: "THURSDAY",
      name: "Upper",
      exercises: [
        { name: "Remada curvada c/apoio", sets: 2, reps: 10, timer: 90, order: 0 },
        { name: "Puxada alta triângulo", sets: 2, reps: 10, timer: 90, order: 1 },
        { name: "Supino inclinado smith", sets: 2, reps: 10, timer: 90, order: 2 },
        { name: "JM PRESS", sets: 2, reps: 10, timer: 90, order: 3 },
        { name: "Elevação lateral c/halteres", sets: 3, reps: 12, timer: 60, order: 4 },
        { name: "Rosca máquina", sets: 3, reps: 10, timer: 60, order: 5 },
        { name: "Flexão de punho", sets: 2, reps: 15, timer: 60, order: 6 },
      ],
    },
    {
      dayOfWeek: "FRIDAY",
      name: "Lower",
      exercises: [
        { name: "Stiff", sets: 2, reps: 10, timer: 120, order: 0 },
        { name: "Legpress", sets: 2, reps: 10, timer: 90, order: 1 },
        { name: "Mesa flexora", sets: 3, reps: 10, timer: 60, order: 2 },
        { name: "Cadeira extensora", sets: 2, reps: 12, timer: 60, order: 3 },
        { name: "Panturrilha máquina", sets: 3, reps: 15, timer: 60, order: 4 },
        { name: "Cadeira abdominal", sets: 3, reps: 15, timer: 60, order: 5 },
      ],
    }
  ]

  for (const w of workouts) {
    await prisma.workoutPlan.create({
      data: {
        userId,
        trainingProgramId: programId,
        dayOfWeek: w.dayOfWeek,
        name: w.name,
        exercises: {
          create: w.exercises,
        },
      },
    })
    
    // Create actual active standalone workouts mapping
    await prisma.workoutPlan.create({
      data: {
        userId,
        trainingProgramId: null,
        dayOfWeek: w.dayOfWeek,
        name: w.name,
        exercises: {
          create: w.exercises.map(ex => ({ ...ex }))
        }
      }
    })
    console.log(`Created ${w.name} for ${w.dayOfWeek}`)
  }

  // 3. Set the program as active for the user
  await prisma.user.update({
    where: { id: userId },
    data: {
      activeProgramId: programId,
    },
  })

  console.log(`Program ${programId} set as active for ${email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
