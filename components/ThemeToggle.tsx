'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch by only rendering after mount
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/[0.06] text-transparent">
                <div className="w-4 h-4" />
            </div>
        )
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all duration-300 border border-transparent hover:border-white/[0.06] group"
            aria-label="Toggle theme"
        >
            <div className="relative w-4 h-4 flex items-center justify-center">
                {/* Sun icon for Dark Mode (shows when theme is dark, meaning next state is light if clicked, or just represents current state - standard pattern is to show what it WILL change to, or current state with animation. We'll animate between them.) */}
                <Sun
                    className="absolute w-4 h-4 transition-all duration-300 transform dark:scale-0 dark:opacity-0 scale-100 opacity-100 dark:-rotate-90 group-hover:text-primary-lighter text-yellow-500"
                />
                <Moon
                    className="absolute w-4 h-4 transition-all duration-300 transform scale-0 opacity-0 dark:scale-100 dark:opacity-100 group-hover:text-primary-lighter text-blue-400"
                />
            </div>
        </button>
    )
}
