import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Discord from "next-auth/providers/discord"
import { createClient } from "@/lib/supabase/server"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_OAUTH_ID,
      clientSecret: process.env.GITHUB_OAUTH_SECRET,
    }),
    Discord({
      clientId: process.env.DISCORD_OAUTH_ID,
      clientSecret: process.env.DISCORD_OAUTH_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/sign-up",
  },
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.provider = account.provider
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).provider = token.provider
        ;(session as any).accessToken = token.accessToken
      }
      return session
    },
    async signIn({ user, account, profile }) {
      try {
        const supabase = await createClient()

        // Find or create user in Supabase
        const { data: existingUser } = await supabase.from("users").select("id").eq("email", user.email).single()

        if (!existingUser) {
          // Create new user
          const { error } = await supabase.from("users").insert({
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account?.provider,
            external_id: profile?.id,
          })

          if (error) {
            console.error("Error creating user:", error)
            return false
          }
        }

        return true
      } catch (error) {
        console.error("SignIn callback error:", error)
        return false
      }
    },
  },
})
