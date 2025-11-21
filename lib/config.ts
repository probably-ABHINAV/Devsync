/**
 * Configuration validation and helpers
 * Ensures all required environment variables are set
 */

interface Config {
  appUrl: string
  geminiKey: string
  github: {
    clientId: string
    clientSecret: string
  }
  discord: {
    clientId: string
    clientSecret: string
    token: string
  }
}

export function validateConfig(): Config {
  const errors: string[] = []

  // App URL
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    errors.push("NEXT_PUBLIC_APP_URL is required")
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️  GEMINI_API_KEY not set - AI features will be disabled")
  }

  // GitHub OAuth
  if (!process.env.GITHUB_OAUTH_ID) {
    errors.push("GITHUB_OAUTH_ID is required")
  }
  if (!process.env.GITHUB_OAUTH_SECRET) {
    errors.push("GITHUB_OAUTH_SECRET is required")
  }

  // Discord OAuth
  if (!process.env.DISCORD_OAUTH_ID) {
    errors.push("DISCORD_OAUTH_ID is required")
  }
  if (!process.env.DISCORD_OAUTH_SECRET) {
    errors.push("DISCORD_OAUTH_SECRET is required")
  }
  if (!process.env.DISCORD_TOKEN) {
    errors.push("DISCORD_TOKEN is required")
  }

  if (errors.length > 0) {
    console.error("❌ Configuration errors:")
    errors.forEach((err) => console.error(`  - ${err}`))
    throw new Error(`Missing required environment variables: ${errors.join(", ")}`)
  }

  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL!,
    geminiKey: process.env.GEMINI_API_KEY || "",
    github: {
      clientId: process.env.GITHUB_OAUTH_ID || "",
      clientSecret: process.env.GITHUB_OAUTH_SECRET || "",
    },
    discord: {
      clientId: process.env.DISCORD_OAUTH_ID || "",
      clientSecret: process.env.DISCORD_OAUTH_SECRET || "",
      token: process.env.DISCORD_TOKEN!,
    },
  }
}

// Validate on module load (server-side only)
if (typeof window === "undefined") {
  try {
    validateConfig()
    console.log("✅ Opscord environment configuration valid")
  } catch (error) {
    console.error(error)
  }
}

export const config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  geminiKey: process.env.GEMINI_API_KEY || "",
  github: {
    clientId: process.env.GITHUB_OAUTH_ID || "",
    clientSecret: process.env.GITHUB_OAUTH_SECRET || "",
  },
  discord: {
    clientId: process.env.DISCORD_OAUTH_ID || "",
    clientSecret: process.env.DISCORD_OAUTH_SECRET || "",
    token: process.env.DISCORD_TOKEN || "",
  },
}
