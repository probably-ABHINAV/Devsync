'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface KudosButtonProps {
    activityId: string
    initialCount?: number
    initialLiked?: boolean
}

export function KudosButton({ activityId, initialCount = 0, initialLiked = false }: KudosButtonProps) {
    const [liked, setLiked] = useState(initialLiked)
    const [count, setCount] = useState(initialCount)
    const [showConfetti, setShowConfetti] = useState(false)

    const handleToggle = async () => {
        // Optimistic update
        const newLiked = !liked
        setLiked(newLiked)
        setCount(prev => newLiked ? prev + 1 : prev - 1)
        
        if (newLiked) {
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 1000)
        }

        // Mock API call
        // await fetch('/api/social/kudos', { method: 'POST', body: JSON.stringify({ activityId }) })
    }

    return (
        <div className="relative">
             <button 
                onClick={(e) => { e.stopPropagation(); handleToggle() }}
                className={cn(
                    "flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors",
                    liked 
                        ? "text-pink-500 bg-pink-500/10 hover:bg-pink-500/20" 
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                )}
            >
                <Heart className={cn("size-3", liked && "fill-current")} />
                <span>{count > 0 ? count : 'Kudos'}</span>
            </button>

            {/* Micro-interaction confetti */}
            <AnimatePresence>
                {showConfetti && (
                    <motion.div 
                        initial={{ opacity: 1, scale: 0.5, y: 0 }}
                        animate={{ opacity: 0, scale: 1.5, y: -20 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none text-pink-500 font-bold text-xs"
                    >
                        +1
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
