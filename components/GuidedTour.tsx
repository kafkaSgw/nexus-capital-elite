'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, X, Sparkles } from 'lucide-react'

const TOUR_STEPS = [
    {
        targetId: 'tour-kpi-cards',
        title: 'Visão Geral Holográfica',
        description: 'Seus KPIs agora possuem efeitos interativos que reagem ao cursor, oferecendo uma leitura imersiva do seu patrimônio.',
        alignment: 'bottom',
    },
    {
        targetId: 'tour-new-tx',
        title: 'Ultra-Rapidez (⌘N)',
        description: 'Adicione transações em milissegundos usando o atalho de teclado ⌘+N em qualquer tela do sistema.',
        alignment: 'bottom-left',
    },
    {
        targetId: 'tour-smart-insights',
        title: 'Inteligência Artificial',
        description: 'Nosso motor analisa milhares de variáveis financeiras para fornecer alertas e previsões de alta precisão em tempo real.',
        alignment: 'bottom',
    },
    {
        targetId: 'tour-command-center',
        title: 'Nexus Command Center',
        description: 'O núcleo de processamento. Visualize simulações quânticas e métricas hiper-avançadas da sua saúde contábil.',
        alignment: 'top',
    }
]

export function GuidedTour() {
    const [isActive, setIsActive] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('nexus_tech_tour_seen')
        if (!hasSeenTour) {
            const timer = setTimeout(() => setIsActive(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [])

    useEffect(() => {
        if (!isActive) return

        const updateRect = () => {
            const step = TOUR_STEPS[currentStep]
            if (!step) return

            const el = document.getElementById(step.targetId)
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                setTimeout(() => {
                    const updatedEl = document.getElementById(step.targetId)
                    if (updatedEl) setTargetRect(updatedEl.getBoundingClientRect())
                }, 400)
                setTargetRect(el.getBoundingClientRect())
            } else {
                setTargetRect(null)
            }
        }

        updateRect()
        window.addEventListener('resize', updateRect)
        window.addEventListener('scroll', updateRect)
        return () => {
            window.removeEventListener('resize', updateRect)
            window.removeEventListener('scroll', updateRect)
        }
    }, [isActive, currentStep])

    if (!isActive) return null

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            endTour()
        }
    }

    const handlePrev = () => {
        setCurrentStep(prev => Math.max(0, prev - 1))
    }

    const endTour = () => {
        localStorage.setItem('nexus_tech_tour_seen', 'true')
        setIsActive(false)
    }

    const step = TOUR_STEPS[currentStep]

    let tooltipStyle: React.CSSProperties = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    }

    if (targetRect) {
        const spacing = 24
        if (step.alignment === 'bottom') {
            tooltipStyle = { top: targetRect.bottom + spacing, left: targetRect.left + (targetRect.width / 2), transform: 'translateX(-50%)' }
        } else if (step.alignment === 'bottom-left') {
            tooltipStyle = { top: targetRect.bottom + spacing, left: targetRect.right, transform: 'translateX(-100%)' }
        } else if (step.alignment === 'top') {
            tooltipStyle = { top: targetRect.top - spacing, left: targetRect.left + (targetRect.width / 2), transform: 'translate(-50%, -100%)' }
        }

        // Safety bounds
        if (typeof window !== 'undefined') {
            const isMobile = window.innerWidth < 768
            if (isMobile) {
                tooltipStyle = {
                    bottom: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    position: 'fixed'
                }
            }
        }
    }

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
            <AnimatePresence>
                {targetRect && (
                    <motion.div
                        key="highlight-box"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                            top: targetRect.top - 8,
                            left: targetRect.left - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16,
                        }}
                        transition={{ type: "spring", stiffness: 90, damping: 20 }}
                        className="absolute rounded-2xl pointer-events-none z-[105]"
                        style={{
                            boxShadow: '0 0 0 9999px rgba(5,7,11,0.85), 0 0 0 2px #00E5FF, 0 0 40px rgba(0,229,255,0.4), inset 0 0 20px rgba(0,229,255,0.1)',
                            background: 'transparent'
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Tooltip Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-[110] w-[90%] max-w-[340px] pointer-events-auto"
                    style={tooltipStyle}
                >
                    <div className="card-premium p-6 border border-[#00E5FF]/40 shadow-[0_10px_50px_rgba(0,112,243,0.4)] bg-[#0A0E17]/95 backdrop-blur-xl relative overflow-hidden">
                        {/* Tech Edge Glow */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-80" />

                        <button onClick={endTour} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3 mb-4 mt-1">
                            <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/30">
                                <Sparkles className="w-4 h-4 text-[#00E5FF]" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E5FF]">
                                Passo {currentStep + 1} / {TOUR_STEPS.length}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{step.title}</h3>
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                            {step.description}
                        </p>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={endTour}
                                className="text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                Pular tour
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentStep === 0}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-4 h-8 rounded-lg flex items-center justify-center bg-[#0070F3] hover:bg-[#0051B3] text-white font-semibold text-sm transition-all shadow-[0_0_15px_rgba(0,112,243,0.4)]"
                                >
                                    {currentStep === TOUR_STEPS.length - 1 ? 'Iniciar' : 'Avançar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
