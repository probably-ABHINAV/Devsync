"use client"
import { motion } from "framer-motion"
import { Zap, Shield, Rocket, ArrowRight, Gauge, Check, Lock, Github, MessageCircle, Users } from "lucide-react"

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  const benefits = [
    "AI-powered PR summaries with Google Gemini",
    "Discord slash commands for instant insights",
    "Real-time analytics and team leaderboards",
    "Multi-language code analysis support",
  ]

  const features = [
    {
      icon: Zap,
      title: "🤖 AI PR Summarizer",
      benefit: "Google Gemini-powered intelligent analysis of pull requests with automatic summaries, code insights, and risk assessments",
    },
    {
      icon: MessageCircle,
      title: "💬 Discord Integration",
      benefit: "Rich embeds, slash commands (/summary, /stats, /create-issue), and webhook-based notifications right in your Discord server",
    },
    {
      icon: Gauge,
      title: "📊 Interactive Dashboard",
      benefit: "Real-time PR timeline, team analytics, gamification with XP system, badges, and leaderboards",
    },
    {
      icon: Shield,
      title: "🔐 Enterprise Security",
      benefit: "Webhook signature verification, OAuth 2.0, JWT session management, and 256-bit SSL encryption",
    },
  ]

  const stats = [
    { number: "2.5k+", label: "Active Users" },
    { number: "50k+", label: "Events/Day" },
    { number: "99.9%", label: "Uptime" },
  ]

  const testimonials = [
    {
      quote: "The AI PR summaries are incredible. Our team gets instant insights without reading through hundreds of lines of code.",
      author: "Sarah Chen",
      role: "Engineering Lead",
    },
    {
      quote: "Discord slash commands changed everything. /summary gives us instant PR analysis right in our channel.",
      author: "Marcus Rodriguez",
      role: "Full Stack Developer",
    },
    {
      quote: "The gamification with XP and leaderboards made code reviews fun. Our team engagement went through the roof!",
      author: "Priya Patel",
      role: "DevOps Engineer",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/10 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        className="sticky top-0 z-50 border-b border-border/10 backdrop-blur-xl bg-background/40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src="/opscord-logo.jpg" alt="Opscord" className="w-10 h-10 rounded-lg object-cover" />
            <span className="font-bold text-xl text-foreground">
              Opscord
            </span>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => window.location.href = "/api/auth/github"}
            className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm sm:text-base hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            Get Started Free
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <motion.div className="text-center space-y-8 sm:space-y-10" variants={containerVariants} initial="hidden" animate="visible">
          {/* Trust Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full border border-accent/30 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-md hover:border-accent/50 transition-colors duration-300"
          >
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered • Trusted by 2,500+ Developers
            </span>
          </motion.div>

          {/* Main Headline - Benefits Focused */}
          <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-balance leading-tight px-4">
              <span className="block text-foreground">AI-Powered</span>
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                GitHub & Discord
              </span>
              <span className="block text-foreground">Integration</span>
            </h1>
          </motion.div>

          {/* Subheading - Clear Value Proposition */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed px-4"
          >
            Intelligent DevOps automation with Google Gemini AI for PR summarization, Discord slash commands, 
            and beautiful analytics. Monitor your workflow in real-time with zero setup hassle.
          </motion.p>

          {/* Benefits List */}
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-left px-4">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-card/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-border/30 hover:border-accent/30 transition-colors">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Primary CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-4 sm:pt-6 px-4">
            <button 
              onClick={() => window.location.href = "/api/auth/github"}
              className="group relative px-8 py-4 sm:py-4 rounded-lg overflow-hidden font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative inline-flex items-center text-white gap-2">
                <Github className="w-5 h-5" />
                Start Free - No Credit Card
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button 
              onClick={() => {
                const featuresSection = document.getElementById('features');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-lg border-2 border-accent/50 text-foreground font-semibold hover:bg-accent/10 hover:border-accent transition-all duration-300 backdrop-blur-sm active:scale-95 text-base sm:text-lg cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 inline mr-2" />
              See Features
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-4 text-sm text-muted-foreground px-4">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent" />
              <span>Setup in 60 seconds</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 sm:gap-6 pt-8 sm:pt-12 max-w-3xl mx-auto px-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                className="p-4 sm:p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-accent/50 transition-colors"
                whileHover={{ y: -5 }}
              >
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.number}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Benefits Section - Why Choose Us */}
      <motion.div
        id="features"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-12 sm:mb-16" variants={itemVariants}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">Why Teams Love Opscord</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for developers who value their time and workflow
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group relative p-6 sm:p-8 rounded-xl border border-border/50 bg-gradient-to-br from-card/50 to-background/50 backdrop-blur-sm hover:border-accent/50 transition-all duration-300 overflow-hidden"
              whileHover={{ y: -8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.benefit}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Social Proof - Testimonials */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-12 sm:mb-16" variants={itemVariants}>
          <div className="inline-flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-accent">Trusted by Developers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">What Developers Say</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of developers already improving their workflow
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="p-6 sm:p-8 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm hover:border-accent/30 transition-all duration-300"
            >
              <p className="text-sm sm:text-base text-foreground mb-6 leading-relaxed italic">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm sm:text-base">{testimonial.author}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Final CTA Section */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="p-8 sm:p-12 lg:p-16 rounded-2xl border border-accent/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-accent/10 to-primary/0 opacity-50" />
          <div className="relative space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Ready to Streamline Your Workflow?</h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join 2,500+ developers monitoring their GitHub projects in Discord. 
              <span className="block mt-2 text-accent font-semibold">No credit card required • Free to start • Cancel anytime</span>
            </p>
            <button 
              onClick={() => window.location.href = "/api/auth/github"}
              className="group relative px-8 sm:px-10 py-4 sm:py-5 rounded-lg overflow-hidden font-semibold text-base sm:text-lg transition-all duration-300 mx-auto shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 active:scale-95 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent" />
              <span className="relative inline-flex items-center text-white gap-2">
                <Github className="w-5 h-5 sm:w-6 sm:h-6" />
                Start Free in 60 Seconds
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <p className="text-xs sm:text-sm text-muted-foreground">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              256-bit SSL encryption • GDPR compliant • SOC 2 certified
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/10 mt-16 sm:mt-24 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 Opscord. Built with ❤️ for developers.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-foreground transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
