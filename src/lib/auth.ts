import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/infrastructure/database/prisma"

import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("AUTH_VERIFY: Missing credentials")
          return null
        }
        
        const email = credentials.email as string
        const password = credentials.password as string

        try {
          const user = await prisma.user.findUnique({
            where: { email }
          })

          console.log("AUTH_VERIFY: User lookup result:", !!user)

          if (!user || !user.password) {
            console.log("AUTH_VERIFY: User not found or no password hash")
            return null
          }

          const bcrypt = await import("bcryptjs")
          const isPasswordValid = await bcrypt.compare(password, user.password)

          console.log("AUTH_VERIFY: Password match:", isPasswordValid)

          if (!isPasswordValid) return null

          return user
        } catch (error: any) {
          console.error("AUTH_VERIFY: Critical failure:", error.message || error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ""
      }
      return session
    },
  },
})
