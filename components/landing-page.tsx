"use client"
import { motion } from "framer-motion"
import { Zap, Shield, ArrowRight, Gauge, Check, Github, MessageCircle, Users, Star, BarChart3, Bell, GitPullRequest, Bot, CheckCircle2, Circle, Target, Rocket } from "lucide-react"

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
    "Event logging for all GitHub activities",
  ]

  const features = [
    {
      icon: Bot,
      title: "AI PR Summarizer",
      benefit: "Google Gemini-powered intelligent analysis with automatic summaries, code insights, and risk assessments",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: MessageCircle,
      title: "Discord Integration",
      benefit: "Rich embeds, slash commands, and webhook notifications. Log all GitHub events to your channel",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Dashboard",
      benefit: "Real-time PR timeline, team analytics, gamification with XP system, badges, and leaderboards",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      benefit: "Webhook signature verification, OAuth 2.0, JWT sessions, and encrypted data transmission",
      gradient: "from-emerald-500 to-teal-500",
    },
  ]

  const stats = [
    { number: "2.5k+", label: "Active Users", icon: Users },
    { number: "50k+", label: "Events/Day", icon: Zap },
    { number: "99.9%", label: "Uptime", icon: Star },
  ]

  const testimonials = [
    {
      quote: "The AI PR summaries are incredible. Our team gets instant insights without reading hundreds of lines of code.",
      author: "Sarah Chen",
      role: "Engineering Lead",
      avatar: "S",
    },
    {
      quote: "Discord slash commands changed everything. /summary gives us instant PR analysis right in our channel.",
      author: "Marcus Rodriguez",
      role: "Full Stack Developer",
      avatar: "M",
    },
    {
      quote: "The gamification with XP and leaderboards made code reviews fun. Team engagement went through the roof!",
      author: "Priya Patel",
      role: "DevOps Engineer",
      avatar: "P",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/15 via-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <motion.nav
        className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#0a0a0f]/80"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-50" />
              <img src="/opscord-logo.jpg" alt="Opscord" className="relative w-10 h-10 rounded-xl object-cover" />
            </div>
            <span className="font-bold text-xl text-white">Opscord</span>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => window.location.href = "/api/auth/github"}
            className="relative group px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl font-semibold text-sm sm:text-base overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all group-hover:opacity-90" />
            <span className="relative text-white flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <motion.div className="text-center space-y-8 sm:space-y-10" variants={containerVariants} initial="hidden" animate="visible">
          {/* Trust Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-md"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AI-Powered • Trusted by 2,500+ Developers
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-balance leading-tight px-4">
              <span className="block text-white">AI-Powered</span>
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                GitHub & Discord
              </span>
              <span className="block text-white">Integration</span>
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto text-balance leading-relaxed px-4"
          >
            Intelligent DevOps automation with Google Gemini AI for PR summarization, Discord slash commands, 
            and beautiful analytics. Monitor your workflow in real-time with zero setup hassle.
          </motion.p>

          {/* Benefits List */}
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-left px-4">
              {benefits.map((benefit, idx) => (
                <motion.div 
                  key={idx} 
                  className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10 hover:border-cyan-500/30 transition-all hover:bg-white/10"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="p-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
                    <Check className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-sm sm:text-base text-gray-300">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-4 sm:pt-6 px-4">
            <button 
              onClick={() => window.location.href = "/api/auth/github"}
              className="group relative px-8 py-4 sm:py-4 rounded-xl overflow-hidden font-semibold text-base sm:text-lg transition-all cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
              className="px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 hover:border-white/30 transition-all backdrop-blur-sm cursor-pointer text-base sm:text-lg"
            >
              <MessageCircle className="w-5 h-5 inline mr-2" />
              See Features
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-4 text-sm text-gray-500 px-4">
            {["No credit card required", "Setup in 60 seconds", "Cancel anytime"].map((text, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 sm:gap-6 pt-8 sm:pt-12 max-w-3xl mx-auto px-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                className="relative p-4 sm:p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden group"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <stat.icon className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {stat.number}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div
        id="features"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-12 sm:mb-16" variants={itemVariants}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Why Teams Love Opscord</h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Built for developers who value their time and workflow
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group relative p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative space-y-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl text-white mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{feature.benefit}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Get Started in 3 Steps</h2>
          <p className="text-gray-400">From signup to insights in under 2 minutes</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "1", title: "Connect GitHub", desc: "Sign in with your GitHub account to link your repositories", icon: Github },
            { step: "2", title: "Add Discord", desc: "Paste your Discord webhook URL to enable notifications", icon: MessageCircle },
            { step: "3", title: "Get Insights", desc: "Receive AI-powered summaries and analytics instantly", icon: BarChart3 },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-center"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                {item.step}
              </div>
              <div className="mt-4">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Testimonials */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-12 sm:mb-16" variants={itemVariants}>
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-gray-300">Trusted by Developers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">What Developers Say</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-cyan-500/30 transition-all"
              whileHover={{ y: -5 }}
            >
              <p className="text-sm sm:text-base text-gray-300 mb-6 leading-relaxed italic">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm sm:text-base">{testimonial.author}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Product Roadmap Section */}
      <motion.div
        id="roadmap"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-12 sm:mb-16" variants={itemVariants}>
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Rocket className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-gray-300">Product Roadmap</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">What's Coming Next</h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Our journey from MVP to enterprise SaaS platform
          </p>
        </motion.div>

        {/* Roadmap Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-cyan-500 to-purple-500 transform md:-translate-x-1/2" />

          <div className="space-y-8">
            {[
              {
                version: "v1.0",
                status: "complete",
                title: "Core Platform",
                timeline: "November 2025",
                features: ["GitHub OAuth integration", "Discord webhooks", "AI PR summaries (Gemini)", "Gamification system"],
                gradient: "from-green-500 to-emerald-600",
              },
              {
                version: "v1.1",
                status: "in-progress",
                title: "Stability & Performance",
                timeline: "December 2025",
                features: ["Performance optimization", "Database improvements", "Error handling", "Security audit"],
                gradient: "from-cyan-500 to-blue-600",
              },
              {
                version: "v2.0",
                status: "planned",
                title: "Enterprise AI Features",
                timeline: "Q1 2026",
                features: ["Issue auto-classification", "Release notes generator", "CI failure analysis", "Admin dashboard"],
                gradient: "from-purple-500 to-pink-600",
              },
              {
                version: "v3.0",
                status: "planned",
                title: "ML Intelligence",
                timeline: "Q2-Q3 2026",
                features: ["Automated code review", "Failure prediction", "Anomaly detection", "GitLab & Slack support"],
                gradient: "from-orange-500 to-red-600",
              },
            ].map((phase, idx) => (
              <motion.div
                key={phase.version}
                variants={itemVariants}
                className={`relative flex items-start gap-6 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-gradient-to-r transform -translate-x-1/2 md:-translate-x-1/2 ring-4 ring-[#0a0a0f] z-10"
                  style={{ background: phase.status === 'complete' ? '#22c55e' : phase.status === 'in-progress' ? '#06b6d4' : '#6b7280' }}
                />

                {/* Content card */}
                <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${idx % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}>
                  <motion.div
                    className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-cyan-500/30 transition-all"
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {phase.status === 'complete' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      {phase.status === 'in-progress' && <Circle className="w-5 h-5 text-cyan-400 animate-pulse" />}
                      {phase.status === 'planned' && <Circle className="w-5 h-5 text-gray-500" />}
                      <span className={`text-lg font-bold bg-gradient-to-r ${phase.gradient} bg-clip-text text-transparent`}>
                        {phase.version}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        phase.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                        phase.status === 'in-progress' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {phase.status === 'complete' ? 'Complete' : phase.status === 'in-progress' ? 'In Progress' : 'Planned'}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-1">{phase.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{phase.timeline}</p>
                    <ul className="space-y-1">
                      {phase.features.map((feature, fIdx) => (
                        <li key={fIdx} className="text-sm text-gray-400 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-cyan-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Success Metrics */}
        <motion.div variants={itemVariants} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Monthly Active Teams", target: "1,000+", icon: "👥" },
            { label: "Paying Customers", target: "100+", icon: "💰" },
            { label: "API Uptime", target: "99.9%", icon: "⚡" },
            { label: "User Rating", target: "4.5+", icon: "⭐" },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              className="p-4 rounded-xl border border-white/10 bg-white/5 text-center hover:border-cyan-500/30 transition-all"
              whileHover={{ y: -3 }}
            >
              <div className="text-2xl mb-2">{metric.icon}</div>
              <p className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {metric.target}
              </p>
              <p className="text-xs text-gray-500 mt-1">{metric.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div 
          variants={itemVariants}
          className="relative p-8 sm:p-12 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-bl-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-tr-full blur-2xl" />
          
          <div className="relative text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Ready to supercharge your workflow?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Join thousands of developers using Opscord to streamline their GitHub and Discord workflow
            </p>
            <button 
              onClick={() => window.location.href = "/api/auth/github"}
              className="group relative px-10 py-4 rounded-xl overflow-hidden font-semibold text-lg transition-all cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative inline-flex items-center text-white gap-2">
                <Github className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/opscord-logo.jpg" alt="Opscord" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-semibold text-white">Opscord</span>
            </div>
            <p className="text-sm text-gray-500">
              Built with love for engineering teams everywhere
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
