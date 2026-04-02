"use server"

import prisma from "@/infrastructure/database/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfileAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const heightStr = formData.get("height") as string
  const weightStr = formData.get("weight") as string
  const goal = formData.get("goal") as string
  const dateOfBirthStr = formData.get("dateOfBirth") as string
  const gender = formData.get("gender") as string
  const trainingTime = formData.get("trainingTime") as string

  console.log("UPDATING PROFILE FOR USER ID:", session.user.id)
  console.log("FORM DATA:", { name, email, phone, heightStr, weightStr, goal, dateOfBirthStr, gender, trainingTime })

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      email,
      phone,
      height: heightStr ? parseFloat(heightStr) : null,
      weight: weightStr ? parseFloat(weightStr) : null,
      goal,
      dateOfBirth: dateOfBirthStr ? new Date(dateOfBirthStr) : null,
      gender: gender || null,
      trainingTime: trainingTime || null,
    }
  })

  console.log("DB UPDATE FINISHED")

  revalidatePath("/profile")
  revalidatePath("/")
}

export async function getUserProfile() {
  const session = await auth()
  if (!session?.user?.id) return null

  return await prisma.user.findUnique({
    where: { id: session.user.id }
  })
}
