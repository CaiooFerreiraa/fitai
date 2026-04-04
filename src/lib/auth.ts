import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/infrastructure/database/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) {
          console.error("AUTH_DEBUG: Missing email or password")
          return null
        }

        try {
          console.log("AUTH_DEBUG: Searching for user:", email)
          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user) {
            console.error("AUTH_DEBUG: User not found")
            return null
          }

          if (!user.password) {
            console.error("AUTH_DEBUG: User has no password (OAuth account?)")
            return null
          }

          console.log("AUTH_DEBUG: Comparing passwords")
          const isPasswordValid = await bcrypt.compare(password, user.password)

          if (!isPasswordValid) {
            console.error("AUTH_DEBUG: Invalid password")
            return null
          }

          console.log("AUTH_DEBUG: Login successful")
          return { 
            id: user.id, 
            email: user.email, 
            name: user.name 
          }
        } catch (error) {
          console.error("AUTH_DEBUG: Unexpected error:", error)
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
    async jwt({ token, user }) {
      if (user) {
        console.log("AUTH_DEBUG: JWT callback - user logged in", { id: user.id })
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      console.log("AUTH_DEBUG: Session callback", { sub: token?.sub })
      if (session.user && token.sub) {
        (session.user as unknown as { id: string }).id = token.sub
      }
      return session
    },
  },
  trustHost: true,
})