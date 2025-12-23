'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/*
 * Simple product tour that highlights elements. 
 * Note: Real implementation would use `react-joyride` or similar for positioning logic,
 * but for this custom "premium" feel we'll use a simple overlay.
 */

interface TourStep {
    targetId: string // The ID of the element to highlight
    title: string
    description: string
    position?: 'top' | 'bottom' | 'left' | 'right'
}

const TOUR_STEPS: TourStep[] = [
    { targetId: 'org-switcher', title: 'Context Switcher', description: 'Switch between organizations here.', position: 'bottom' },
    { targetId: 'filter-bar', title: 'Filters', description: 'Narrow down activities by tool, type, or date.', position: 'bottom' },
    { targetId: 'ai-summary', title: 'AI Insights', description: 'Get automated summaries of your dev activity.', position: 'bottom' },
]

export function ProductTour() {
    const [stepIndex, setStepIndex] = useState(0)
    const [active, setActive] = useState(false)
    
    // Check local storage if tour seen
    useEffect(() => {
        const seen = localStorage.getItem('opscord-tour-seen')
        if (!seen) {
             // Delay start slightly
             setTimeout(() => setActive(true), 1000)
        }
    }, [])

    const handleDismiss = () => {
        setActive(false)
        localStorage.setItem('opscord-tour-seen', 'true')
    }

    const handleNext = () => {
        if (stepIndex < TOUR_STEPS.length - 1) {
            setStepIndex(s => s + 1)
        } else {
            handleDismiss()
        }
    }

    if (!active) return null
    
    const step = TOUR_STEPS[stepIndex]

    return (
        <AnimatePresence>
             {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 pointer-events-none" // pointer-events-none allows clicking through conceptually, but usually tours block interaction. 
                                                                              // For this custom shim, let's keep it simple: just a corner message.
            />

            {/* In a real "portal" implementation, we'd calculate coordinates derived from document.getElementById(step.targetId).getBoundingClientRect() */}
            {/* For this MVP, we will float a modal in the center or consistent spot, as "Targeting" requires complex resize observers */ }

            <motion.div 
                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6"
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                        Tip {stepIndex + 1}/{TOUR_STEPS.length}
                    </span>
                    <button onClick={handleDismiss} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                        <X size={16} />
                    </button>
                </div>
                
                <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-white">{step.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">{step.description}</p>
                
                <div className="flex justify-end gap-2">
                    <button 
                         onClick={handleNext}
                         className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        {stepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
