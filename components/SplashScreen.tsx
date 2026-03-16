'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const QUOTES = [
    'O dinheiro que você tem dá-lhe liberdade; o dinheiro que você persegue lhe escraviza.',
    'Investir em conhecimento rende sempre os melhores juros. — Benjamin Franklin',
    'Não é sobre quanto dinheiro você ganha, mas quanto dinheiro você mantém.',
    'A melhor época para plantar uma árvore foi há 20 anos. A segunda melhor é agora.',
    'Cuide do seu dinheiro, e ele cuidará de você.',
    'Quem não sabe administrar tostões, não sabe administrar milhões.',
]

export default function SplashScreen({ children }: { children: React.ReactNode }) {
    const [show, setShow] = useState(false)
    const [progress, setProgress] = useState(0)
    const [quote, setQuote] = useState('')

    useEffect(() => {
        // Only show if not seen in this session
        if (typeof window !== 'undefined') {
            const hasSeenSplash = sessionStorage.getItem('nexus_splash_seen')
            if (hasSeenSplash) {
                setShow(false)
                return
            } else {
                setShow(true)
            }
        }

        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer)
                    setTimeout(() => {
                        setShow(false)
                        sessionStorage.setItem('nexus_splash_seen', 'true')
                    }, 300)
                    return 100
                }
                return prev + 4
            })
        }, 50)

        return () => clearInterval(timer)
    }, [])

    return (
        <>
            <AnimatePresence>
                {show && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark-bg"
                    >
                        {/* Background glow */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                            <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-accent-purple/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '500ms' }} />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center">
                            {/* Logo */}
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                className="mb-8"
                            >
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-accent-indigo to-accent-purple flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.3)]">
                                        <span className="text-3xl font-black text-white tracking-tighter">N</span>
                                    </div>
                                    <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-primary/20 to-accent-purple/20 blur-xl -z-10 animate-pulse" />
                                </div>
                            </motion.div>

                            {/* Title */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="text-center mb-10"
                            >
                                <h1 className="text-3xl font-black text-white tracking-tight mb-1">
                                    NEXUS <span className="gradient-text">CAPITAL</span>
                                </h1>
                                <p className="text-xs text-gray-500 uppercase tracking-[0.3em] font-medium">Elite Financial System</p>
                            </motion.div>

                            {/* Progress bar */}
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 200, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.3 }}
                                className="mb-6"
                            >
                                <div className="w-[200px] h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary via-accent-indigo to-accent-purple rounded-full transition-all duration-100 ease-linear"
                                        style={{ width: `${progress}%`, boxShadow: '0 0 20px rgba(59,130,246,0.5)' }}
                                    />
                                </div>
                            </motion.div>

                            {/* Quote */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                                className="text-xs text-gray-500 text-center max-w-xs italic leading-relaxed"
                            >
                                "{quote}"
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </>
    )
}
