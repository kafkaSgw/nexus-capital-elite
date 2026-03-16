'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showBanner, setShowBanner] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [showIOSGuide, setShowIOSGuide] = useState(false)

    useEffect(() => {
        // The Service Worker is now automatically registered by @ducanh2912/next-pwa

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        // Detect iOS
        const ua = navigator.userAgent
        const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
        setIsIOS(isiOS)

        // Listen for the beforeinstallprompt event (Chrome, Edge, Samsung)
        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)

            // Show banner after a delay to not interrupt the user immediately
            const dismissed = localStorage.getItem('pwa-banner-dismissed')
            if (!dismissed) {
                setTimeout(() => setShowBanner(true), 5000)
            }
        }

        window.addEventListener('beforeinstallprompt', handler)

        // For iOS, show after delay if not dismissed
        if (isiOS) {
            const dismissed = localStorage.getItem('pwa-banner-dismissed')
            if (!dismissed) {
                setTimeout(() => setShowBanner(true), 8000)
            }
        }

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true)
            setShowBanner(false)
            setDeferredPrompt(null)
        })

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const handleInstall = async () => {
        if (isIOS) {
            setShowIOSGuide(true)
            return
        }

        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setShowBanner(false)
        }

        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setShowBanner(false)
        localStorage.setItem('pwa-banner-dismissed', Date.now().toString())
    }

    // Don't show if already installed
    if (isInstalled) return null

    // Don't show if no prompt available and not iOS
    if (!showBanner) return null

    return (
        <>
            {/* Install Banner */}
            <AnimatePresence>
                {showBanner && !showIOSGuide && (
                    <motion.div
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 80 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:w-[380px] z-[55] rounded-2xl overflow-hidden"
                        style={{
                            background: 'rgba(10, 16, 30, 0.98)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(37, 99, 235, 0.08)',
                        }}
                    >
                        {/* Accent line */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent-purple to-primary" />

                        <div className="p-4 sm:p-5">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent-purple/20 rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
                                    <Smartphone className="w-6 h-6 text-primary-lighter" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-white mb-1">Instalar Nexus Capital</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        {isIOS
                                            ? 'Adicione à tela inicial para usar como app nativo'
                                            : 'Instale o app no seu dispositivo para acesso rápido'}
                                    </p>

                                    <div className="flex items-center gap-2 mt-3">
                                        <button
                                            onClick={handleInstall}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                                            style={{
                                                background: 'linear-gradient(135deg, #2563EB, #6366F1)',
                                                boxShadow: '0 2px 12px rgba(37, 99, 235, 0.3)',
                                            }}
                                        >
                                            <Download className="w-4 h-4" />
                                            Instalar App
                                        </button>
                                        <button
                                            onClick={handleDismiss}
                                            className="px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
                                        >
                                            Agora não
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleDismiss}
                                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* iOS Installation Guide Modal */}
            <AnimatePresence>
                {showIOSGuide && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowIOSGuide(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[380px] rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(10, 16, 30, 0.98)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(51, 65, 85, 0.4)',
                                boxShadow: '0 16px 64px rgba(0, 0, 0, 0.6)',
                            }}
                        >
                            <div className="p-6">
                                <div className="text-center mb-5">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent-purple/20 rounded-2xl flex items-center justify-center border border-primary/20 mx-auto mb-3">
                                        <Smartphone className="w-8 h-8 text-primary-lighter" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Instalar no iOS</h3>
                                    <p className="text-sm text-gray-400 mt-1">Siga os passos abaixo:</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03]">
                                        <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">1</div>
                                        <p className="text-sm text-gray-300">Toque no botão <strong className="text-white">Compartilhar</strong> (ícone ↑) na barra do Safari</p>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03]">
                                        <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">2</div>
                                        <p className="text-sm text-gray-300">Role para baixo e toque em <strong className="text-white">"Adicionar à Tela de Início"</strong></p>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03]">
                                        <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">3</div>
                                        <p className="text-sm text-gray-300">Toque em <strong className="text-white">"Adicionar"</strong> para confirmar</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowIOSGuide(false)
                                        setShowBanner(false)
                                    }}
                                    className="w-full mt-5 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #2563EB, #6366F1)',
                                        boxShadow: '0 2px 12px rgba(37, 99, 235, 0.3)',
                                    }}
                                >
                                    Entendi!
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
