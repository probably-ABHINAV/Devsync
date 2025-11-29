"use client"
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { Zap, Shield, ArrowRight, Check, Github, MessageCircle, Users, Star, BarChart3, Bot, CheckCircle2, Circle, Rocket, Quote, ChevronLeft, ChevronRight, Sparkles, Code2, Activity, Globe } from "lucide-react"
import { useRef, useState, useEffect, useCallback } from "react"

function useCounter(end: number, duration: number = 2000, inView: boolean) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!inView) return
    
    let startTime: number
    let animationFrame: number
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, inView])
  
  return count
}

function TypewriterText({ texts, className }: { texts: string[], className?: string }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  
  useEffect(() => {
    const text = texts[currentTextIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < text.length) {
          setCurrentText(text.slice(0, currentText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(text.slice(0, currentText.length - 1))
        } else {
          setIsDeleting(false)
          setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        }
      }
    }, isDeleting ? 50 : 100)
    
    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentTextIndex, texts])
  
  return (
    <span className={className}>
      {currentText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block w-[3px] h-[1em] bg-cyan-400 ml-1 align-middle"
      />
    </span>
  )
}

function FloatingOrb({ delay, duration, size, color, initialX, initialY }: { 
  delay: number, duration: number, size: number, color: string, initialX: string, initialY: string 
}) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        left: initialX,
        top: initialY,
      }}
      animate={{
        x: [0, 100, -50, 80, 0],
        y: [0, -80, 60, -40, 0],
        scale: [1, 1.2, 0.9, 1.1, 1],
        opacity: [0.3, 0.5, 0.3, 0.4, 0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

function Particle({ index }: { index: number }) {
  const [particleConfig, setParticleConfig] = useState<{
    x: number
    delay: number
    duration: number
    size: number
  } | null>(null)
  
  useEffect(() => {
    setParticleConfig({
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 20,
      size: 1 + Math.random() * 2,
    })
  }, [])
  
  if (!particleConfig) return null
  
  return (
    <motion.div
      className="absolute rounded-full bg-white pointer-events-none"
      style={{
        width: particleConfig.size,
        height: particleConfig.size,
        left: `${particleConfig.x}%`,
        top: "100%",
      }}
      animate={{
        y: [0, -1500],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: particleConfig.duration,
        delay: particleConfig.delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  )
}

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}

function TiltCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 })
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])
  
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
  }
  
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  )
}

function FloatingIcon({ icon: Icon, delay, x, y }: { icon: React.ElementType, delay: number, x: string, y: string }) {
  return (
    <motion.div
      className="absolute hidden lg:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -15, 0],
        rotateY: [0, 180, 360],
      }}
      transition={{
        opacity: { delay, duration: 0.5 },
        scale: { delay, duration: 0.5 },
        y: { delay: delay + 0.5, duration: 4, repeat: Infinity, ease: "easeInOut" },
        rotateY: { delay: delay + 0.5, duration: 8, repeat: Infinity, ease: "linear" },
      }}
    >
      <Icon className="w-6 h-6 text-cyan-400" />
    </motion.div>
  )
}

function AnimatedStatCard({ stat, idx, inView }: { stat: { number: number, suffix: string, label: string, icon: React.ElementType }, idx: number, inView: boolean }) {
  const count = useCounter(stat.number, 2000, inView)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: idx * 0.1, duration: 0.6 }}
      className="relative group"
      whileHover={{ y: -8 }}
    >
      <motion.div
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ background: `linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(139, 92, 246, 0.3))` }}
      />
      <div className="relative p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: "radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15) 0%, transparent 60%)",
          }}
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
        >
          <stat.icon className="w-6 h-6 text-cyan-400 mx-auto mb-3" />
        </motion.div>
        <p className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          {stat.number === 99.9 ? count.toFixed(1) : count}{stat.suffix}
        </p>
        <motion.div 
          className="h-0.5 w-12 mx-auto mt-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
          initial={{ width: 0 }}
          animate={inView ? { width: 48 } : {}}
          transition={{ delay: 0.5 + idx * 0.2, duration: 0.8 }}
        />
        <p className="text-sm text-gray-500 mt-3">{stat.label}</p>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })
  
  const heroInView = useInView(heroRef, { once: true })
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" })
  const timelineInView = useInView(timelineRef, { once: true, margin: "-100px" })
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const glowVariants = {
    initial: { boxShadow: "0 0 20px rgba(6, 182, 212, 0)" },
    animate: { 
      boxShadow: [
        "0 0 20px rgba(6, 182, 212, 0.3)",
        "0 0 40px rgba(6, 182, 212, 0.5)",
        "0 0 20px rgba(6, 182, 212, 0.3)",
      ],
    },
  }

  const benefits = [
    "AI-powered PR summaries with Google Gemini",
    "Discord slash commands for instant insights",
    "Real-time analytics and team leaderboards",
    "Event logging for all GitHub activities",
  ]

  const features = [
    {
      icon: Bot,
      title: "AI PR Summarizer",
      benefit: "Google Gemini-powered intelligent analysis with automatic summaries, code insights, and risk assessments",
      gradient: "from-cyan-500 to-blue-500",
      glowColor: "rgba(6, 182, 212, 0.4)",
    },
    {
      icon: MessageCircle,
      title: "Discord Integration",
      benefit: "Rich embeds, slash commands, and webhook notifications. Log all GitHub events to your channel",
      gradient: "from-indigo-500 to-purple-500",
      glowColor: "rgba(99, 102, 241, 0.4)",
    },
    {
      icon: BarChart3,
      title: "Advanced Dashboard",
      benefit: "Real-time PR timeline, team analytics, gamification with XP system, badges, and leaderboards",
      gradient: "from-orange-500 to-red-500",
      glowColor: "rgba(249, 115, 22, 0.4)",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      benefit: "Webhook signature verification, OAuth 2.0, JWT sessions, and encrypted data transmission",
      gradient: "from-emerald-500 to-teal-500",
      glowColor: "rgba(16, 185, 129, 0.4)",
    },
  ]

  const stats = [
    { number: 2500, suffix: "+", label: "Active Users", icon: Users },
    { number: 50, suffix: "k+", label: "Events/Day", icon: Zap },
    { number: 99.9, suffix: "%", label: "Uptime", icon: Star },
  ]

  const testimonials = [
    {
      quote: "The AI PR summaries are incredible. Our team gets instant insights without reading hundreds of lines of code.",
      author: "Sarah Chen",
      role: "Engineering Lead",
      company: "TechFlow",
      avatar: "S",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      quote: "Discord slash commands changed everything. /summary gives us instant PR analysis right in our channel.",
      author: "Marcus Rodriguez",
      role: "Full Stack Developer",
      company: "DevStudio",
      avatar: "M",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      quote: "The gamification with XP and leaderboards made code reviews fun. Team engagement went through the roof!",
      author: "Priya Patel",
      role: "DevOps Engineer",
      company: "CloudScale",
      avatar: "P",
      gradient: "from-orange-500 to-red-500",
    },
  ]

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [testimonials.length])

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000)
    return () => clearInterval(interval)
  }, [nextTestimonial])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030308] overflow-hidden">
      {/* Animated Background */}
      <motion.div className="fixed inset-0 pointer-events-none" style={{ y: backgroundY }}>
        {/* Aurora Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-1/4 w-[800px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, rgba(6, 182, 212, 0.15) 0%, transparent 70%)",
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, 50, -30, 0],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
            }}
            animate={{
              x: [0, -80, 60, 0],
              y: [0, -60, 40, 0],
              scale: [1, 0.9, 1.1, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute bottom-0 left-1/3 w-[700px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, rgba(236, 72, 153, 0.1) 0%, transparent 70%)",
            }}
            animate={{
              x: [0, 60, -80, 0],
              y: [0, -40, 60, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
        </div>

        {/* Floating Orbs */}
        <FloatingOrb delay={0} duration={15} size={400} color="rgba(6, 182, 212, 0.08)" initialX="10%" initialY="20%" />
        <FloatingOrb delay={2} duration={18} size={300} color="rgba(139, 92, 246, 0.08)" initialX="70%" initialY="60%" />
        <FloatingOrb delay={4} duration={20} size={350} color="rgba(236, 72, 153, 0.06)" initialX="30%" initialY="70%" />
        <FloatingOrb delay={1} duration={17} size={250} color="rgba(16, 185, 129, 0.06)" initialX="80%" initialY="10%" />

        {/* Grid */}
        <GridBackground />

        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          {Array.from({ length: 30 }).map((_, i) => (
            <Particle key={i} index={i} />
          ))}
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.nav
        className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-2xl bg-[#030308]/70"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative group">
              <motion.div 
                className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <img src="/opscord-logo.jpg" alt="Opscord" className="relative w-11 h-11 rounded-xl object-cover ring-2 ring-white/10" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Opscord</span>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => window.location.href = "/api/auth/github"}
            className="relative group px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl font-semibold text-sm sm:text-base overflow-hidden cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
            />
            <motion.div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: "radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)",
              }}
            />
            <span className="relative text-white flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.div 
        ref={heroRef}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36"
        style={{ opacity: heroOpacity }}
      >
        {/* Floating Icons */}
        <FloatingIcon icon={Code2} delay={0.5} x="5%" y="20%" />
        <FloatingIcon icon={Activity} delay={0.7} x="90%" y="15%" />
        <FloatingIcon icon={Globe} delay={0.9} x="8%" y="70%" />
        <FloatingIcon icon={Sparkles} delay={1.1} x="88%" y="65%" />
        
        <motion.div 
          className="text-center space-y-10"
          variants={containerVariants}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
        >
          {/* Trust Badge */}
          <motion.div variants={itemVariants}>
            <motion.div
              className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl"
              variants={glowVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </motion.div>
              <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI-Powered • Trusted by 2,500+ Developers
              </span>
            </motion.div>
          </motion.div>

          {/* Main Headline */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1]">
              <motion.span 
                className="block text-white"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(255,255,255,0)",
                    "0 0 40px rgba(255,255,255,0.1)",
                    "0 0 20px rgba(255,255,255,0)",
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                AI-Powered
              </motion.span>
              <motion.span 
                className="block bg-clip-text text-transparent py-2"
                style={{
                  backgroundImage: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 25%, #8b5cf6 50%, #ec4899 75%, #06b6d4 100%)",
                  backgroundSize: "200% 200%",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                GitHub & Discord
              </motion.span>
              <span className="block text-white">Integration</span>
            </h1>
          </motion.div>

          {/* Typewriter Effect */}
          <motion.div variants={itemVariants} className="h-8">
            <TypewriterText 
              texts={[
                "Intelligent PR Analysis",
                "Real-time Team Analytics",
                "Gamified Code Reviews",
                "Zero Setup Hassle",
              ]}
              className="text-lg sm:text-xl text-gray-400"
            />
          </motion.div>

          {/* Benefits List */}
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-4 text-left px-4">
              {benefits.map((benefit, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-start gap-3 bg-white/[0.03] backdrop-blur-xl rounded-xl p-4 border border-white/[0.05] hover:border-cyan-500/30 transition-all group"
                >
                  <motion.div 
                    className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Check className="w-4 h-4 text-cyan-400" />
                  </motion.div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-6 px-4">
            <motion.button 
              onClick={() => window.location.href = "/api/auth/github"}
              className="group relative px-10 py-4 rounded-2xl overflow-hidden font-semibold text-lg transition-all cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
                  backgroundSize: "200% 200%",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25) 0%, transparent 60%)",
                }}
              />
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(6, 182, 212, 0.5)",
                    "0 0 60px rgba(59, 130, 246, 0.5)",
                    "0 0 30px rgba(139, 92, 246, 0.5)",
                    "0 0 30px rgba(6, 182, 212, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative inline-flex items-center text-white gap-2">
                <Github className="w-5 h-5" />
                Start Free - No Credit Card
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </span>
            </motion.button>
            
            <motion.button 
              onClick={() => {
                const featuresSection = document.getElementById('features')
                featuresSection?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="relative px-10 py-4 rounded-2xl border-2 border-white/20 text-white font-semibold backdrop-blur-xl cursor-pointer text-lg overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                See Features
              </span>
            </motion.button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-gray-500 px-4">
            {["No credit card required", "Setup in 60 seconds", "Cancel anytime"].map((text, idx) => (
              <motion.div 
                key={idx} 
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + idx * 0.2 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                >
                  <Check className="w-4 h-4 text-cyan-400" />
                </motion.div>
                <span>{text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        ref={statsRef}
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          {stats.map((stat, idx) => (
            <AnimatedStatCard key={idx} stat={stat} idx={idx} inView={statsInView} />
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        id="features"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <motion.h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            animate={{
              textShadow: [
                "0 0 30px rgba(6, 182, 212, 0)",
                "0 0 60px rgba(6, 182, 212, 0.2)",
                "0 0 30px rgba(6, 182, 212, 0)",
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            Why Teams Love Opscord
          </motion.h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Built for developers who value their time and workflow
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              custom={idx}
              style={{ perspective: 1000 }}
            >
              <TiltCard className="h-full">
                <motion.div
                  className="group relative h-full p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden"
                  whileHover={{ borderColor: "rgba(6, 182, 212, 0.5)" }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${feature.glowColor} 0%, transparent 60%)`,
                    }}
                  />
                  <div className="relative space-y-4">
                    <motion.div 
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="w-full h-full rounded-xl bg-[#0a0a0f] flex items-center justify-center">
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-xl text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{feature.benefit}</p>
                    </div>
                  </div>
                </motion.div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        ref={timelineRef}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Get Started in 3 Steps</h2>
          <p className="text-gray-400">From signup to insights in under 2 minutes</p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
              initial={{ scaleX: 0, originX: 0 }}
              animate={timelineInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Connect GitHub", desc: "Sign in with your GitHub account to link your repositories", icon: Github, gradient: "from-cyan-500 to-blue-500" },
              { step: "2", title: "Add Discord", desc: "Paste your Discord webhook URL to enable notifications", icon: MessageCircle, gradient: "from-blue-500 to-purple-500" },
              { step: "3", title: "Get Insights", desc: "Receive AI-powered summaries and analytics instantly", icon: BarChart3, gradient: "from-purple-500 to-pink-500" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                custom={idx}
                className="relative"
              >
                <motion.div
                  className="relative p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl text-center group"
                  whileHover={{ y: -8, borderColor: "rgba(6, 182, 212, 0.5)" }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: "radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.1) 0%, transparent 60%)",
                    }}
                  />
                  
                  {/* Step Number */}
                  <motion.div 
                    className={`absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r ${item.gradient} flex items-center justify-center text-white font-bold shadow-lg`}
                    initial={{ scale: 0 }}
                    animate={timelineInView ? { scale: 1 } : {}}
                    transition={{ delay: 0.5 + idx * 0.2, type: "spring" }}
                  >
                    {item.step}
                  </motion.div>

                  <div className="mt-4">
                    <motion.div 
                      className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <item.icon className="w-8 h-8 text-cyan-400" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Testimonials */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <div className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-gray-300">Trusted by Developers</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">What Developers Say</h2>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative"
              >
                <div className="max-w-3xl mx-auto">
                  <div className="relative p-8 sm:p-12 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
                    {/* Glow Quote */}
                    <motion.div
                      className="absolute -top-6 left-8"
                      animate={{ 
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Quote className="w-12 h-12 text-cyan-500/30" />
                    </motion.div>

                    <p className="text-xl sm:text-2xl text-gray-200 mb-8 leading-relaxed italic relative z-10">
                      &quot;{testimonials[currentTestimonial].quote}&quot;
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonials[currentTestimonial].gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                        animate={{ 
                          y: [0, -5, 0],
                          boxShadow: [
                            "0 10px 30px rgba(6, 182, 212, 0.3)",
                            "0 20px 40px rgba(6, 182, 212, 0.5)",
                            "0 10px 30px rgba(6, 182, 212, 0.3)",
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        {testimonials[currentTestimonial].avatar}
                      </motion.div>
                      <div>
                        <p className="font-semibold text-white text-lg">{testimonials[currentTestimonial].author}</p>
                        <p className="text-sm text-gray-400">{testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <motion.button
              onClick={prevTestimonial}
              className="p-3 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentTestimonial ? 'bg-cyan-400 w-8' : 'bg-white/20'}`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
            
            <motion.button
              onClick={nextTestimonial}
              className="p-3 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Product Roadmap Section */}
      <motion.div
        id="roadmap"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <div className="inline-flex items-center gap-2 mb-4 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
            <Rocket className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-gray-300">Product Roadmap</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">What's Coming Next</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Our journey from MVP to enterprise SaaS platform
          </p>
        </motion.div>

        {/* Roadmap Timeline */}
        <div className="relative">
          {/* Timeline line with glow */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 transform md:-translate-x-1/2">
            <motion.div
              className="h-full w-full rounded-full"
              style={{
                background: "linear-gradient(to bottom, #22c55e, #06b6d4, #8b5cf6, #f97316)",
              }}
              initial={{ scaleY: 0, originY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full blur-md"
              style={{
                background: "linear-gradient(to bottom, #22c55e, #06b6d4, #8b5cf6, #f97316)",
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <div className="space-y-12">
            {[
              {
                version: "v1.0",
                status: "complete",
                title: "Core Platform",
                timeline: "November 2025",
                features: ["GitHub OAuth integration", "Discord webhooks", "AI PR summaries (Gemini)", "Gamification system"],
                gradient: "from-green-500 to-emerald-600",
                glowColor: "rgba(34, 197, 94, 0.3)",
              },
              {
                version: "v1.1",
                status: "in-progress",
                title: "Stability & Performance",
                timeline: "December 2025",
                features: ["Performance optimization", "Database improvements", "Error handling", "Security audit"],
                gradient: "from-cyan-500 to-blue-600",
                glowColor: "rgba(6, 182, 212, 0.3)",
              },
              {
                version: "v2.0",
                status: "planned",
                title: "Enterprise AI Features",
                timeline: "Q1 2026",
                features: ["Issue auto-classification", "Release notes generator", "CI failure analysis", "Admin dashboard"],
                gradient: "from-purple-500 to-pink-600",
                glowColor: "rgba(139, 92, 246, 0.3)",
              },
              {
                version: "v3.0",
                status: "planned",
                title: "ML Intelligence",
                timeline: "Q2-Q3 2026",
                features: ["Automated code review", "Failure prediction", "Anomaly detection", "GitLab & Slack support"],
                gradient: "from-orange-500 to-red-600",
                glowColor: "rgba(249, 115, 22, 0.3)",
              },
            ].map((phase, idx) => (
              <motion.div
                key={phase.version}
                variants={itemVariants}
                custom={idx}
                className={`relative flex items-start gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Timeline dot */}
                <motion.div 
                  className="absolute left-4 md:left-1/2 w-5 h-5 rounded-full transform -translate-x-1/2 md:-translate-x-1/2 z-10"
                  style={{ 
                    background: phase.status === 'complete' ? '#22c55e' : phase.status === 'in-progress' ? '#06b6d4' : '#6b7280',
                    boxShadow: phase.status !== 'planned' ? `0 0 20px ${phase.glowColor}` : 'none',
                  }}
                  animate={phase.status === 'in-progress' ? {
                    scale: [1, 1.3, 1],
                    boxShadow: [
                      `0 0 20px ${phase.glowColor}`,
                      `0 0 40px ${phase.glowColor}`,
                      `0 0 20px ${phase.glowColor}`,
                    ],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Content card */}
                <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${idx % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}>
                  <motion.div
                    className="relative p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden group"
                    whileHover={{ 
                      y: -5, 
                      borderColor: phase.status !== 'planned' ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${phase.glowColor} 0%, transparent 60%)`,
                      }}
                    />
                    
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-3">
                        {phase.status === 'complete' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {phase.status === 'in-progress' && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Circle className="w-5 h-5 text-cyan-400" />
                          </motion.div>
                        )}
                        {phase.status === 'planned' && <Circle className="w-5 h-5 text-gray-500" />}
                        <span className={`text-xl font-bold bg-gradient-to-r ${phase.gradient} bg-clip-text text-transparent`}>
                          {phase.version}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full ${
                          phase.status === 'complete' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          phase.status === 'in-progress' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {phase.status === 'complete' ? 'Complete' : phase.status === 'in-progress' ? 'In Progress' : 'Planned'}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-1">{phase.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">{phase.timeline}</p>
                      <ul className="space-y-2">
                        {phase.features.map((feature, fIdx) => (
                          <motion.li 
                            key={fIdx} 
                            className="text-sm text-gray-400 flex items-center gap-2"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: fIdx * 0.1 }}
                          >
                            <motion.span 
                              className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${phase.gradient}`}
                              animate={phase.status === 'in-progress' ? { scale: [1, 1.5, 1] } : {}}
                              transition={{ duration: 1, repeat: Infinity, delay: fIdx * 0.2 }}
                            />
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Success Metrics */}
        <motion.div variants={itemVariants} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Monthly Active Teams", target: "1,000+", icon: "👥" },
            { label: "Paying Customers", target: "100+", icon: "💰" },
            { label: "API Uptime", target: "99.9%", icon: "⚡" },
            { label: "User Rating", target: "4.5+", icon: "⭐" },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              className="relative p-5 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl text-center overflow-hidden group"
              whileHover={{ y: -5, borderColor: "rgba(6, 182, 212, 0.3)" }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 60%)",
                }}
              />
              <motion.div 
                className="text-3xl mb-2"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
              >
                {metric.icon}
              </motion.div>
              <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {metric.target}
              </p>
              <p className="text-xs text-gray-500 mt-1">{metric.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div 
          variants={itemVariants}
          className="relative p-10 sm:p-16 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden"
        >
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 0% 0%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 0% 100%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 100% 0%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          
          {/* Floating particles */}
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${10 + i * 10}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
          
          <div className="relative text-center space-y-8">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white"
              animate={{
                textShadow: [
                  "0 0 30px rgba(6, 182, 212, 0)",
                  "0 0 60px rgba(6, 182, 212, 0.3)",
                  "0 0 30px rgba(6, 182, 212, 0)",
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Ready to supercharge your workflow?
            </motion.h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Join thousands of developers using Opscord to streamline their GitHub and Discord workflow
            </p>
            
            <motion.button 
              onClick={() => window.location.href = "/api/auth/github"}
              className="group relative px-12 py-5 rounded-2xl overflow-hidden font-semibold text-lg cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 33%, #8b5cf6 66%, #ec4899 100%)",
                  backgroundSize: "300% 300%",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0"
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(6, 182, 212, 0.4)",
                    "0 0 60px rgba(139, 92, 246, 0.4)",
                    "0 0 30px rgba(236, 72, 153, 0.4)",
                    "0 0 30px rgba(6, 182, 212, 0.4)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)",
                }}
              />
              <span className="relative inline-flex items-center text-white gap-3">
                <Github className="w-6 h-6" />
                Get Started Free
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.span>
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-40"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <img src="/opscord-logo.jpg" alt="Opscord" className="relative w-10 h-10 rounded-xl object-cover" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Opscord</span>
            </motion.div>
            <p className="text-sm text-gray-500">
              Built with 💙 for engineering teams everywhere
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
