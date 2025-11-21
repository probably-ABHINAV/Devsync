"use client"

import { useState } from "react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGitHubLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log("[v0] Starting GitHub OAuth flow")
      const response = await fetch("/api/auth/github-url", { method: "POST" })
      console.log("[v0] GitHub URL response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] GitHub error:", errorData)
        throw new Error(errorData.error || "Failed to get GitHub OAuth URL")
      }

      const { url } = await response.json()
      console.log("[v0] GitHub redirect URL generated, redirecting...")
      window.location.href = url
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start authentication"
      console.error("[v0] GitHub login error:", message)
      setError(message)
      setIsLoading(false)
    }
  }

  const handleDiscordLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log("[v0] Starting Discord OAuth flow")
      const response = await fetch("/api/auth/discord-url", { method: "POST" })
      console.log("[v0] Discord URL response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Discord error:", errorData)
        throw new Error(errorData.error || "Failed to get Discord OAuth URL")
      }

      const { url } = await response.json()
      console.log("[v0] Discord redirect URL generated, redirecting...")
      window.location.href = url
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start authentication"
      console.error("[v0] Discord login error:", message)
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        padding: "1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "28rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "white", marginBottom: "0.5rem" }}>OpsCord Lite</h1>
          <p style={{ color: "#94a3b8" }}>AI-Powered DevOps Platform</p>
        </div>

        <div
          style={{
            backgroundColor: "#1e293b",
            border: "1px solid #475569",
            borderRadius: "0.5rem",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              onClick={handleGitHubLogin}
              disabled={isLoading}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                backgroundColor: "#475569",
                color: "white",
                fontWeight: "600",
                padding: "0.75rem 1rem",
                borderRadius: "0.375rem",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.5 : 1,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = "#64748b"
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = "#475569"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {isLoading ? "Redirecting..." : "Sign in with GitHub"}
            </button>
            <button
              onClick={handleDiscordLogin}
              disabled={isLoading}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                backgroundColor: "#4f46e5",
                color: "white",
                fontWeight: "600",
                padding: "0.75rem 1rem",
                borderRadius: "0.375rem",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.5 : 1,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = "#6366f1"
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = "#4f46e5"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.417-.875-.627-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.7 10.7 0 0 0 .372-.294.075.075 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.075.075 0 0 1 .079.009c.12.098.246.198.373.295a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.699.77 1.364 1.225 1.994a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.057c.5-4.761-.838-8.898-3.549-12.55a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156 0-1.193.964-2.157 2.157-2.157 1.193 0 2.156.964 2.156 2.157 0 1.19-.963 2.156-2.156 2.156zm7.975 0c-1.183 0-2.157-.965-2.157-2.156 0-1.193.964-2.157 2.157-2.157 1.193 0 2.157.964 2.157 2.157 0 1.19-.964 2.156-2.157 2.156z" />
              </svg>
              {isLoading ? "Redirecting..." : "Sign in with Discord"}
            </button>
          </div>

          {error && (
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "rgba(127, 29, 29, 0.2)",
                border: "1px solid #7f1d1d",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ textAlign: "center", fontSize: "0.875rem", color: "#94a3b8" }}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  )
}
