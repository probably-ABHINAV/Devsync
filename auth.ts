import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Discord from "next-auth/providers/discord"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { prisma } from "@/lib/prisma"

const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/sign-up",
  },
  trustHost: true,
}

const providers = []

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  )
}

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  providers.push(
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  )
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  )
}

if (providers.length === 0) {
  providers.push(
    Credentials({
      credentials: {},
      authorize: async () => {
        throw new Error("Please configure OAuth providers in environment variables")
      },
    }),
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.provider = token.provider as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (typeof window !== "undefined") {
        return true
      }

      try {
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email || "" },
        })

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email || "",
              name: user.name || "",
              image: user.image || "",
              discordId: account?.provider === "discord" ? profile?.id : undefined,
              githubId: account?.provider === "github" ? Number.parseInt(profile?.id || "0") : undefined,
              profile: {
                create: {
                  username: user.name || "",
                  displayName: user.name || "",
                  avatarUrl: user.image || "",
                },
              },
            },
            include: { profile: true },
          })
        } else {
          if (account?.provider === "discord" && profile?.id) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { discordId: profile.id },
            })
          }
          if (account?.provider === "github" && profile?.id) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { githubId: Number.parseInt(profile.id) },
            })
          }
        }

        return true
      } catch (error) {
        console.error("SignIn error:", error)
        return false
      }
    },
  },
})
