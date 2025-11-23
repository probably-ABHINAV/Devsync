import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const geist = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
})
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://opscord.app'),
  title: "Opscord - Real-Time GitHub Notifications for Discord | Monitor Repos Instantly",
  description: "Get instant GitHub notifications in Discord. Monitor pull requests, issues, and commits in real-time. Secure OAuth integration, zero setup hassle. Free to start.",
  keywords: ["GitHub Discord integration", "GitHub notifications", "Discord webhooks", "repository monitoring", "GitHub alerts", "Discord bot", "developer tools"],
  authors: [{ name: "Opscord" }],
  creator: "Opscord",
  publisher: "Opscord",
  openGraph: {
    title: "Opscord - Real-Time GitHub Notifications for Discord",
    description: "Monitor GitHub repos, issues & PRs directly in Discord. Instant notifications, enterprise security, zero configuration.",
    url: "https://opscord.app",
    siteName: "Opscord",
    type: "website",
    images: [
      {
        url: "/placeholder-logo.png",
        width: 1200,
        height: 630,
        alt: "Opscord - GitHub to Discord Integration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Opscord - Real-Time GitHub Notifications for Discord",
    description: "Monitor GitHub repos, issues & PRs directly in Discord. Instant notifications, enterprise security.",
    images: ["/placeholder-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
