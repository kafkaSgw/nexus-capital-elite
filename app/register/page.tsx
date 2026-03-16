'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft, AlertCircle, CheckCircle, User } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RegisterPage() {
    const { signUp } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const passwordChecks = {
        length: password.length >= 6,
        match: password === confirmPassword && confirmPassword.length > 0,
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!name.trim()) { setError('Informe seu nome'); return }
        if (!email.trim()) { setError('Informe seu email'); return }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email inválido'); return }
        if (!password) { setError('Crie uma senha'); return }
        if (password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres'); return }
        if (password !== confirmPassword) { setError('As senhas não coincidem'); return }

        setLoading(true)
        const { error: authError } = await signUp(email.trim(), password, name.trim())
        setLoading(false)

        if (authError) {
            if (authError.message.includes('already registered')) {
                setError('Este email já está cadastrado. Tente fazer login.')
            } else {
                setError(authError.message)
            }
        } else {
            setSuccess(true)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
                <div className="absolute inset-0 bg-dark-bg">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.15),_transparent_60%)]" />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-[420px] text-center"
                >
                    <div
                        className="rounded-2xl p-8"
                        style={{
                            background: 'rgba(10, 16, 30, 0.85)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.4)',
                        }}
                    >
                        <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-accent-green" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Conta criada!</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Verifique seu email <strong className="text-white">{email}</strong> para confirmar sua conta.
                            Depois, volte aqui para fazer login.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all"
                            style={{
                                background: 'linear-gradient(135deg, #2563EB, #6366F1)',
                                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
                            }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Ir para Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        )
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
                    <p className="text-gray-400 text-sm mt-2">Comece a gerenciar suas finanças agora</p>
                </div>

                {/* Register Card */}
                <div
                    className="rounded-2xl p-6 sm:p-8"
                    style={{
                        background: 'rgba(10, 16, 30, 0.85)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(51, 65, 85, 0.3)',
                        boxShadow: '0 16px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.02)',
                    }}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nome completo</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome"
                                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-500"
                                    autoComplete="name"
                                    autoFocus
                                />
                            </div>
                        </div>

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
                                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-500"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-500"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {/* Password strength */}
                            {password.length > 0 && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className={`h-1 flex-1 rounded-full ${passwordChecks.length ? 'bg-accent-green' : 'bg-gray-700'}`} />
                                    <span className={`text-xs ${passwordChecks.length ? 'text-accent-green' : 'text-gray-500'}`}>
                                        {passwordChecks.length ? '✓ 6+ caracteres' : 'Mín. 6 caracteres'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repita a senha"
                                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-500"
                                    autoComplete="new-password"
                                />
                            </div>
                            {confirmPassword.length > 0 && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className={`h-1 flex-1 rounded-full ${passwordChecks.match ? 'bg-accent-green' : 'bg-accent-red'}`} />
                                    <span className={`text-xs ${passwordChecks.match ? 'text-accent-green' : 'text-accent-red'}`}>
                                        {passwordChecks.match ? '✓ Senhas coincidem' : 'Senhas não coincidem'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
                            style={{
                                background: loading
                                    ? 'rgba(37, 99, 235, 0.5)'
                                    : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                boxShadow: loading ? 'none' : '0 4px 20px rgba(99, 102, 241, 0.3)',
                            }}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Criar Conta
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="text-center mt-6">
                        <Link
                            href="/login"
                            className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Já tem conta? Fazer login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
