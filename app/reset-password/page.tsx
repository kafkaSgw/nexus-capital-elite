'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function ResetPasswordPage() {
    const { resetPassword } = useAuth()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email.trim()) { setError('Informe seu email'); return }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email inválido'); return }

        setLoading(true)
        const { error: authError } = await resetPassword(email.trim())
        setLoading(false)

        if (authError) {
            setError(authError.message)
        } else {
            setSuccess(true)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            <div className="absolute inset-0 bg-dark-bg">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.15),_transparent_60%)]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-[420px]"
            >
                <div className="text-center mb-8">
                    <Image src="/logo.png?v=tech" alt="Nexus Capital" width={56} height={56} className="w-14 h-14 rounded-xl mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white">Recuperar Senha</h1>
                    <p className="text-gray-400 text-sm mt-2">Enviaremos um link para redefinir sua senha</p>
                </div>

                <div
                    className="rounded-2xl p-6 sm:p-8"
                    style={{
                        background: 'rgba(10, 16, 30, 0.85)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(51, 65, 85, 0.3)',
                        boxShadow: '0 16px 64px rgba(0, 0, 0, 0.4)',
                    }}
                >
                    {success ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-7 h-7 text-accent-green" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Email enviado!</h3>
                            <p className="text-sm text-gray-400 mb-6">
                                Verifique sua caixa de entrada em <strong className="text-white">{email}</strong>
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Voltar ao login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-accent-red/10 border border-accent-red/20"
                                >
                                    <AlertCircle className="w-5 h-5 text-accent-red shrink-0" />
                                    <p className="text-sm text-accent-red">{error}</p>
                                </motion.div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email da conta</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="input-premium w-full pl-11"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                style={{
                                    background: loading ? 'rgba(37, 99, 235, 0.5)' : 'linear-gradient(135deg, #2563EB, #6366F1)',
                                    boxShadow: loading ? 'none' : '0 4px 20px rgba(37, 99, 235, 0.3)',
                                }}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Enviar link de recuperação'
                                )}
                            </button>

                            <Link
                                href="/login"
                                className="block text-center text-sm text-gray-400 hover:text-white transition-colors mt-4"
                            >
                                <span className="inline-flex items-center gap-1">
                                    <ArrowLeft className="w-4 h-4" /> Voltar ao login
                                </span>
                            </Link>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
