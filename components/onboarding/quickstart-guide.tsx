'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GuideStep {
    id: string
    title: string
    completed: boolean
    actionUrl?: string
}

export function QuickstartGuide() {
    const [isOpen, setIsOpen] = useState(true)
    const [isVisible, setIsVisible] = useState(true)
    const [steps, setSteps] = useState<GuideStep[]>([
        { id: '1', title: 'Connect your first tool', completed: false, actionUrl: '/org/settings?tab=integrations' },
        { id: '2', title: 'Invite a team member', completed: false, actionUrl: '/org/settings?tab=members' },
        { id: '3', title: 'View your activity feed', completed: false, actionUrl: '/' },
        { id: '4', title: 'Check AI insights', completed: false, actionUrl: '/' }, // Auto-complete when viewing insight
    ])

    // Mock progress check - in real app, fetch from API or check context
    useEffect(() => {
        // Simulate checking completion status
        const checkProgress = () => {
             // Mock logic: randomly mark complete for demo if they visit links
             // For now, let's just leave them interactive
        }
    }, [])

    const toggleStep = (id: string) => {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s))
    }

    if (!isVisible) return null

    const completedCount = steps.filter(s => s.completed).length
    const progress = (completedCount / steps.length) * 100

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-4 right-4 z-50 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div 
                    className="flex items-center justify-between p-4 bg-zinc-900 cursor-pointer border-b border-zinc-800/50"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative size-6">
                            <svg className="size-full -rotate-90 text-zinc-800" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current" strokeWidth="4"></circle>
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-blue-500" strokeWidth="4" strokeDasharray={`${progress}, 100`}></circle>
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Getting Started</h3>
                            <p className="text-xs text-zinc-400">{completedCount} of {steps.length} completed</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }} className="p-1 hover:bg-zinc-800 rounded">
                            {isOpen ? <ChevronDown className="size-4 text-zinc-400" /> : <ChevronUp className="size-4 text-zinc-400" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setIsVisible(false) }} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">
                            <X className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden bg-zinc-900/95"
                        >
                            <div className="p-2 space-y-1">
                                {steps.map((step) => (
                                    <div 
                                        key={step.id} 
                                        onClick={() => toggleStep(step.id)}
                                        className={cn(
                                            "group flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer",
                                            step.completed ? "bg-blue-500/10 hover:bg-blue-500/20" : "hover:bg-zinc-800"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex items-center justify-center size-5 rounded-full border transition-colors",
                                            step.completed ? "bg-blue-500 border-blue-500 text-white" : "border-zinc-600 group-hover:border-zinc-400"
                                        )}>
                                            {step.completed && <Check className="size-3" />}
                                        </div>
                                        <span className={cn(
                                            "text-sm",
                                            step.completed ? "text-zinc-400 line-through" : "text-zinc-200"
                                        )}>
                                            {step.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    )
}
