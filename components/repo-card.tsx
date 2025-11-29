"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ExternalLink, GitFork, Star, AlertCircle, GitPullRequest } from "lucide-react"
import { useRef, useState } from "react"

interface RepoCardProps {
  repo: {
    name: string
    description: string | null
    url: string
    stars: number
    language: string | null
    openIssues: number
    openPRs: number
  }
}

const LANGUAGE_GRADIENTS: Record<string, string> = {
  TypeScript: "from-blue-500 to-cyan-500",
  JavaScript: "from-yellow-500 to-orange-500",
  Python: "from-green-500 to-emerald-500",
  Rust: "from-orange-500 to-red-500",
  Go: "from-cyan-500 to-teal-500",
  Java: "from-red-500 to-orange-500",
  "C++": "from-purple-500 to-pink-500",
  C: "from-gray-500 to-slate-500",
  Ruby: "from-red-600 to-pink-600",
  PHP: "from-indigo-500 to-purple-500",
  Swift: "from-orange-400 to-red-500",
  Kotlin: "from-purple-400 to-orange-500",
  Shell: "from-green-600 to-lime-500",
  HTML: "from-orange-500 to-red-400",
  CSS: "from-blue-400 to-purple-500",
}

export default function RepoCard({ repo }: RepoCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 })
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"])
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }
  
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  const languageGradient = repo.language ? LANGUAGE_GRADIENTS[repo.language] || "from-gray-500 to-slate-500" : "from-gray-500 to-slate-500"

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative group cursor-pointer"
      whileHover={{ z: 50 }}
    >
      <motion.div 
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: `linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4))`,
        }}
        animate={isHovered ? {
          background: [
            "linear-gradient(0deg, rgba(6, 182, 212, 0.4), rgba(139, 92, 246, 0.4))",
            "linear-gradient(90deg, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4))",
            "linear-gradient(180deg, rgba(236, 72, 153, 0.4), rgba(6, 182, 212, 0.4))",
            "linear-gradient(270deg, rgba(6, 182, 212, 0.4), rgba(139, 92, 246, 0.4))",
            "linear-gradient(360deg, rgba(6, 182, 212, 0.4), rgba(139, 92, 246, 0.4))",
          ],
        } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.5), rgba(139, 92, 246, 0.5), rgba(236, 72, 153, 0.5))",
          backgroundSize: "200% 200%",
        }}
        animate={isHovered ? {
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <Card 
        className="relative h-full p-5 border-white/10 bg-[#0d0d1a]/90 backdrop-blur-xl overflow-hidden rounded-2xl"
        style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-30 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)`,
          }}
        />
        
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
          style={{
            background: `
              linear-gradient(
                105deg,
                transparent 40%,
                rgba(255, 255, 255, 0.03) 45%,
                rgba(255, 255, 255, 0.05) 50%,
                rgba(255, 255, 255, 0.03) 55%,
                transparent 60%
              )
            `,
            backgroundSize: "200% 100%",
          }}
          animate={isHovered ? {
            backgroundPosition: ["200% 0%", "-200% 0%"],
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        />

        <div className="relative space-y-4" style={{ transform: "translateZ(30px)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <motion.h3
                className="font-semibold text-lg text-white truncate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{ transform: "translateZ(20px)" }}
              >
                <motion.span
                  className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text"
                  animate={isHovered ? {
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  {repo.name}
                </motion.span>
              </motion.h3>
              {repo.description && (
                <p className="text-sm text-gray-400 line-clamp-2 mt-1">{repo.description}</p>
              )}
            </div>
            <motion.a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0 relative"
              whileHover={{ scale: 1.2, rotate: 45 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{ transform: "translateZ(40px)" }}
            >
              <motion.div
                className="absolute -inset-2 bg-cyan-500/20 rounded-full opacity-0 group-hover:opacity-100 blur-md"
                animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <ExternalLink className="w-5 h-5 relative" />
            </motion.a>
          </div>

          <div className="flex flex-wrap gap-2" style={{ transform: "translateZ(25px)" }}>
            {repo.language && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative overflow-hidden"
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${languageGradient} opacity-20 blur-sm`}
                  animate={isHovered ? {
                    opacity: [0.2, 0.4, 0.2],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Badge 
                  variant="secondary" 
                  className={`relative bg-gradient-to-r ${languageGradient} bg-opacity-20 text-white border-0 px-3 py-1`}
                  style={{
                    background: `linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2))`,
                  }}
                >
                  <motion.span
                    className={`w-2 h-2 rounded-full bg-gradient-to-r ${languageGradient} mr-2 inline-block`}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {repo.language}
                </Badge>
              </motion.div>
            )}
            {repo.stars > 0 && (
              <motion.div whileHover={{ scale: 1.1 }}>
                <Badge 
                  variant="secondary" 
                  className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 flex items-center gap-1"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="w-3 h-3 fill-current" />
                  </motion.div>
                  {repo.stars}
                </Badge>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2" style={{ transform: "translateZ(20px)" }}>
            <motion.div
              className="relative p-3 rounded-xl bg-white/5 border border-white/10 text-center overflow-hidden group/stat"
              whileHover={{ scale: 1.05, borderColor: "rgba(249, 115, 22, 0.5)" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover/stat:opacity-100 transition-opacity"
              />
              <div className="relative">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-1">
                  <motion.div
                    animate={repo.openIssues > 0 ? { 
                      scale: [1, 1.2, 1],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <AlertCircle className="w-3 h-3" />
                  </motion.div>
                  Issues
                </div>
                <motion.p 
                  className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  {repo.openIssues}
                </motion.p>
              </div>
            </motion.div>
            <motion.div
              className="relative p-3 rounded-xl bg-white/5 border border-white/10 text-center overflow-hidden group/stat"
              whileHover={{ scale: 1.05, borderColor: "rgba(139, 92, 246, 0.5)" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover/stat:opacity-100 transition-opacity"
              />
              <div className="relative">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-1">
                  <motion.div
                    animate={repo.openPRs > 0 ? { 
                      rotate: [0, 10, -10, 0],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <GitPullRequest className="w-3 h-3" />
                  </motion.div>
                  PRs
                </div>
                <motion.p 
                  className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  {repo.openPRs}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
        
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), rgba(139, 92, 246, 0.5), rgba(236, 72, 153, 0.5), transparent)`,
          }}
          initial={{ scaleX: 0 }}
          animate={isHovered ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.5 }}
        />
      </Card>
    </motion.div>
  )
}
