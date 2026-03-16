'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
    const { signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email.trim()) { setError('Informe seu email'); return }
        if (!password) { setError('Informe sua senha'); return }

        setLoading(true)
        const { error: authError } = await signIn(email.trim(), password)
        setLoading(false)

        if (authError) {
            if (authError.message.includes('Invalid login')) {
                setError('Email ou senha incorretos')
            } else if (authError.message.includes('Email not confirmed')) {
                setError('Confirme seu email antes de entrar. Verifique sua caixa de entrada.')
            } else {
                setError(authError.message)
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            {/* Background */}
            <div className="absolute inset-0 bg-dark-bg">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.15),_transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(99,102,241,0.1),_transparent_60%)]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-[420px]"
            >
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Image src="/logo.png?v=tech" alt="Nexus Capital" width={56} height={56} className="w-14 h-14 rounded-xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Nexus Capital <span className="gradient-text">Elite</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">Faça login para acessar sua conta</p>
                </div>

                {/* Login Card */}
                <div
                    className="rounded-2xl p-6 sm:p-8"
                    style={{
                        background: 'rgba(10, 16, 30, 0.85)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(51, 65, 85, 0.3)',
                        boxShadow: '0 16px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.02)',
                    }}
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Alert */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-3 p-3 rounded-xl bg-accent-red/10 border border-accent-red/20"
                            >
                                <AlertCircle className="w-5 h-5 text-accent-red shrink-0 mt-0.5" />
                                <p className="text-sm text-accent-red">{error}</p>
                            </motion.div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-500"
                                    autoComplete="email"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-300">Senha</label>
                                <Link href="/reset-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-500"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            style={{
                                background: loading
                                    ? 'rgba(37, 99, 235, 0.5)'
                                    : 'linear-gradient(135deg, #2563EB, #6366F1)',
                                boxShadow: loading ? 'none' : '0 4px 20px rgba(37, 99, 235, 0.3)',
                            }}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Entrar
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="h-px flex-1 bg-white/[0.12]" />
                        <span className="text-xs text-gray-400 font-medium">ou</span>
                        <div className="h-px flex-1 bg-white/[0.12]" />
                    </div>

                    {/* Register Link */}
                    <Link
                        href="/register"
                        className="w-full py-3.5 rounded-xl font-medium text-sm text-gray-300 flex items-center justify-center gap-2 transition-all hover:bg-white/[0.04] border border-white/[0.08]"
                    >
                        Criar uma conta
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <p className="text-center text-xs text-gray-600 mt-6">
                    © {new Date().getFullYear()} Nexus Capital Elite
                </p>
            </motion.div>
        </div>
    )
}
