"use client"
import { motion } from "framer-motion"
import { Github, ArrowRight, Gauge } from "lucide-react"
import { useState } from "react"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleGitHubLogin = async () => {
    setLoading(true)
    window.location.href = "/api/auth/github"
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
      <div
        className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
        style={{ animationDelay: "2s" }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="relative p-8 sm:p-10 rounded-2xl border border-accent/30 bg-gradient-to-br from-card/80 to-background/80 backdrop-blur-xl shadow-2xl overflow-hidden group hover:border-accent/50 transition-colors duration-300"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />

          <div className="relative space-y-8">
            {/* Header */}
            <motion.div variants={itemVariants} className="space-y-4 text-center">
              <div className="flex justify-center mb-2">
                <img src="/opscord-logo.jpg" alt="Opscord" className="w-16 h-16 rounded-xl object-cover shadow-lg" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Welcome to Opscord</h1>
              <p className="text-muted-foreground text-sm">Monitor GitHub. Sync to Discord. Instantly.</p>
            </motion.div>

            {/* GitHub Login Button */}
            <motion.div variants={itemVariants}>
              <button
                onClick={handleGitHubLogin}
                disabled={loading}
                className="w-full group relative h-12 rounded-lg overflow-hidden font-semibold text-base transition-all duration-300 disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-100 group-hover:opacity-90 transition-opacity" />
                <span className="relative inline-flex items-center justify-center w-full text-white gap-2">
                  <Github className="w-5 h-5" />
                  {loading ? "Connecting..." : "Continue with GitHub"}
                  {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-gradient-to-br from-card/80 to-background/80 text-muted-foreground">
                  What you'll get
                </span>
              </div>
            </motion.div>

            {/* Features List */}
            <motion.div variants={itemVariants} className="space-y-3">
              {[
                "Access to all your GitHub repositories",
                "Real-time issue and PR notifications",
                "One-click Discord channel integration",
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-start gap-3 group/item cursor-pointer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:from-primary/50 group-hover/item:to-accent/50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Footer */}
            <motion.div variants={itemVariants} className="text-center text-xs text-muted-foreground space-y-2">
              <p>By signing in, you agree to our Terms of Service</p>
              <p className="text-border">and Privacy Policy</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Animated accent lines */}
        <motion.div
          className="absolute -top-1 left-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
          initial={{ x: "-50%", opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
        />
        <motion.div
          className="absolute -bottom-1 left-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"
          initial={{ x: "-50%", opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
        />
      </motion.div>
    </div>
  )
}
