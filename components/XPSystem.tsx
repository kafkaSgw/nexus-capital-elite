'use client'

import { useState, useEffect } from 'react'
import { Trophy, Star, TrendingUp, Zap } from 'lucide-react'

// Mocking XP calculation since we don't have a backend table for it yet.
// In a real scenario, XP would be stored in a 'user_profiles' table.
// For now, we'll calculate it based on local storage so it persists per browser.

const LEVELS = [
    { level: 1, title: 'Iniciante', minXP: 0, color: 'text-gray-400', bg: 'bg-gray-400/10', icon: Star },
    { level: 2, title: 'Aprendiz', minXP: 500, color: 'text-blue-400', bg: 'bg-blue-400/10', icon: TrendingUp },
    { level: 3, title: 'Investidor', minXP: 2000, color: 'text-purple-400', bg: 'bg-purple-400/10', icon: Zap },
    { level: 4, title: 'Expert', minXP: 5000, color: 'text-accent-indigo', bg: 'bg-accent-indigo/10', icon: Trophy },
    { level: 5, title: 'Magnata', minXP: 10000, color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Star },
]

export default function XPSystem() {
    const [xp, setXP] = useState(0)
    const [mounted, setMounted] = useState(false)

    // Load from local storage on mount
    useEffect(() => {
        setMounted(true)
        const storedXP = localStorage.getItem('nexus_user_xp')
        if (storedXP) {
            setXP(parseInt(storedXP, 10))
        } else {
            // First time giving base XP
            setXP(120)
            localStorage.setItem('nexus_user_xp', '120')
        }

        // Custom event listener for XP gains across the app
        const handleAddXP = (e: Event) => {
            const customEvent = e as CustomEvent<{ amount: number, reason: string }>
            setXP(prev => {
                const newXP = prev + customEvent.detail.amount
                localStorage.setItem('nexus_user_xp', newXP.toString())
                return newXP
            })
            // Could show a toast here: "Gained 50 XP!"
        }

        window.addEventListener('addXP', handleAddXP)
        return () => window.removeEventListener('addXP', handleAddXP)
    }, [])

    if (!mounted) return null // Prevent hydration mismatch

    // Determine current level
    let currentLevelIdx = 0
    for (let i = 0; i < LEVELS.length; i++) {
        if (xp >= LEVELS[i].minXP) {
            currentLevelIdx = i
        } else {
            break
        }
    }

    const currentLevel = LEVELS[currentLevelIdx]
    const nextLevel = currentLevelIdx < LEVELS.length - 1 ? LEVELS[currentLevelIdx + 1] : null

    const progressPercent = nextLevel
        ? ((xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100
        : 100

    const LevelIcon = currentLevel.icon

    return (
        <div className="flex items-center gap-3">
            {/* Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5 ${currentLevel.bg}`}>
                <LevelIcon className={`w-3.5 h-3.5 ${currentLevel.color}`} />
                <span className={`text-xs font-bold tracking-wide ${currentLevel.color}`}>
                    LVL {currentLevel.level} <span className="hidden sm:inline opacity-70 ml-1 font-medium">{currentLevel.title}</span>
                </span>
            </div>

            {/* Progress */}
            {nextLevel && (
                <div className="hidden md:flex flex-col gap-1 w-24">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400">{xp} <span className="opacity-50 font-normal">XP</span></span>
                        <span className="text-[10px] text-gray-500">{nextLevel.minXP}</span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-bg rounded-full overflow-hidden border border-white/5">
                        <div
                            className={`h-full ${currentLevel.bg.replace('/10', '')} transition-all duration-1000 ease-out`}
                            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

// Utility to dispatch XP globally
export const addXP = (amount: number, reason: string) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('addXP', { detail: { amount, reason } }))
    }
}
