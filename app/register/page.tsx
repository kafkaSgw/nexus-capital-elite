'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleEnter = () => {
        setLoading(true)
        // O AuthProvider já fornece a sessão mock, então apenas redirecionamos
        router.push('/')
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
            {/* Background */}
            <div className="absolute inset-0 bg-dark-bg">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.15),_transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(37,99,235,0.1),_transparent_60%)]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-[420px]"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Image src="/logo.png?v=tech" alt="Nexus Capital" width={56} height={56} className="w-14 h-14 rounded-xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Criar Conta
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">O acesso à plataforma está liberado. Nenhuma conta é necessária.</p>
                </div>

                {/* Register Card */}
                <div
                    className="rounded-2xl p-6 sm:p-8 text-center"
                    style={{
                        background: 'rgba(10, 16, 30, 0.85)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(51, 65, 85, 0.3)',
                        boxShadow: '0 16px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.02)',
                    }}
                >
                     <button
                        onClick={handleEnter}
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                           background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                           boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
                        }}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn className="w-6 h-6" />
                                Entrar na Plataforma
                            </>
                        )}
                    </button>
                     <p className="text-sm text-gray-500 mt-6">
                        Ambiente de Demonstração Interativo
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
