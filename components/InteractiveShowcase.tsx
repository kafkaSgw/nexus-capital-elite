'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, X, Building2, Activity, Crown, Mic, Scale } from 'lucide-react'
import { useRouter } from 'next/navigation'

const SHOWCASE_STEPS = [
    {
        id: 'step-welcome',
        targetId: null,
        title: 'Bem-vindo ao Nexus Capital Elite',
        description: 'Sua plataforma definitiva de Multi-Family Office. Fizemos uma reformulação extrema na estrutura de sua riqueza, tornando suas interfaces 100% institucionais e ultra-seguras.',
        icon: Building2,
        alignment: 'center',
    },
    {
        id: 'step-macro',
        targetId: 'tour-nav-macro',
        title: 'Terminal Macro (Bloomberg Lite)',
        description: 'No menu lateral, trouxemos um Terminal de Operação densamente populado com dados base do G7. Analise facilmente a curva de juros DI invertida, Risco-País, e Fed Watch Tools em estética Neon.',
        icon: Activity,
        alignment: 'right',
    },
    {
        id: 'step-sucessao',
        targetId: 'tour-nav-sucessao',
        title: 'Sucessão & Holding (ITCMD)',
        description: 'Simulador avançado focando na economia e blindagem patrimonial se você aplicar o Clonamento Patrimonial (transferência vis Holding/Offshore) vs. Inventário comum de morte.',
        icon: Scale,
        alignment: 'right',
    },
    {
        id: 'step-concierge',
        targetId: 'tour-nav-concierge',
        title: 'Concierge VIP & Milhas',
        description: 'Chega de ignorar os benefícios escondidos do seu capital. Conecte cartões e calcule instantaneamente o valor financeiro do seu portfólio aéreo (Livelo, Smiles) a preço de balcão.',
        icon: Crown,
        alignment: 'right',
    },
    {
        id: 'step-copilot',
        targetId: 'tour-copilot',
        title: 'Voice Copilot Interativo',
        description: 'A verdadeira vanguarda. Com seu microfone liberado, este flutuante da tela ouvirá sua voz para responder em tempo real sobre seu patrimônio, dividendos proventos e afins. Tente dizer: "Qual meu Patrimônio?"',
        icon: Mic,
        alignment: 'top-left',
    }
]

export default function InteractiveShowcase() {
    const [isActive, setIsActive] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
    const router = useRouter()

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('nexus_elite_showcase_done')
        if (!hasSeenTour) {
            const timer = setTimeout(() => setIsActive(true), 2000)
            return () => clearTimeout(timer)
        }
    }, [])

    useEffect(() => {
        if (!isActive) return

        const updateRect = () => {
            const step = SHOWCASE_STEPS[currentStep]
            if (!step || !step.targetId) {
                setTargetRect(null)
                return
            }

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
        if (currentStep < SHOWCASE_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            endTour()
        }
    }

    const handlePrev = () => {
        setCurrentStep(prev => Math.max(0, prev - 1))
    }

    const endTour = () => {
        localStorage.setItem('nexus_elite_showcase_done', 'true')
        setIsActive(false)
    }

    const step = SHOWCASE_STEPS[currentStep]
    const Icon = step.icon

    let tooltipStyle: React.CSSProperties = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed'
    }

    if (targetRect && step.targetId) {
        const spacing = 28
        if (step.alignment === 'right') {
            tooltipStyle = { top: targetRect.top, left: targetRect.right + spacing, transform: 'translateY(-50%)', position: 'fixed' }
        } else if (step.alignment === 'top-left') {
            tooltipStyle = { top: targetRect.top - spacing, left: targetRect.left - spacing, transform: 'translate(-100%, -100%)', position: 'fixed' }
        }
        
        // Safety bounds for mobile
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            tooltipStyle = { bottom: 24, left: '50%', transform: 'translateX(-50%)', position: 'fixed', top: 'auto' }
        }
    }

    return (
        <div className="fixed inset-0 z-[150] pointer-events-none overflow-hidden">
            {/* Dark Overlay Background for step 0 (No target rect) */}
            <AnimatePresence>
                {(!targetRect || !step.targetId) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/85 backdrop-blur-sm pointer-events-auto z-[150]"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {targetRect && step.targetId && (
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
                        className="fixed rounded-2xl pointer-events-none z-[155] border-2 border-primary"
                        style={{
                            boxShadow: '0 0 0 9999px rgba(0,0,0,0.85), 0 0 30px rgba(37,99,235,0.4), inset 0 0 20px rgba(37,99,235,0.1)',
                            background: 'transparent'
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Tooltip Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="fixed z-[160] w-[90%] max-w-[420px] pointer-events-auto"
                    style={tooltipStyle}
                >
                    <div className="card-premium p-8 border border-primary/50 shadow-[0_20px_80px_rgba(37,99,235,0.4)] bg-gradient-to-b from-[#0a0e17] to-dark-bg relative overflow-hidden backdrop-blur-2xl">
                        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-90" />

                        <button onClick={endTour} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors bg-dark-bg p-1.5 rounded-lg border border-transparent hover:border-dark-border">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30 relative">
                                <div className="absolute inset-0 bg-primary/20 blur-md rounded-xl" />
                                <Icon className="w-6 h-6 text-primary relative z-10" />
                            </div>
                            <div>
                               <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 block mb-1">
                                   Guia de Elite {currentStep + 1}/{SHOWCASE_STEPS.length}
                               </span>
                               <h3 className="text-xl font-bold text-white leading-tight pr-4">{step.title}</h3>
                            </div>
                        </div>

                        <p className="text-sm text-gray-300 mb-8 leading-relaxed">
                            {step.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                            <button
                                onClick={endTour}
                                className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                Pular Tour
                            </button>

                            <div className="flex gap-3">
                                {currentStep > 0 && (
                                    <button
                                        onClick={handlePrev}
                                        className="w-11 h-11 rounded-xl flex items-center justify-center bg-dark-bg border border-dark-border text-gray-400 hover:text-white transition-all hover:border-gray-500"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    className="px-6 h-11 rounded-xl flex items-center justify-center btn-primary font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                >
                                    {currentStep === SHOWCASE_STEPS.length - 1 ? 'Finalizar' : 'Avançar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
