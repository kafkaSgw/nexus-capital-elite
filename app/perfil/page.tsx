"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { UserCircle, Mail, Calendar, Shield, LogOut, ArrowLeft, Loader2, Bell, Clock, Target, GraduationCap, TrendingUp } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface NotificationConfig {
    billReminders: boolean
    studyReminders: boolean
    priceAlerts: boolean
    goalProgress: boolean
}

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [saving, setSaving] = useState(false)
    const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default')
    const [notifConfig, setNotifConfig] = useState<NotificationConfig>({
        billReminders: true,
        studyReminders: true,
        priceAlerts: true,
        goalProgress: true,
    })

    useEffect(() => {
        async function loadUser() {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error || !user) {
                router.push('/login')
                return
            }
            setUser(user)
            setName(user.user_metadata?.full_name || '')
            setLoading(false)
        }
        loadUser()

        // Load notification config
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotifPermission(Notification.permission)
        }
        const saved = localStorage.getItem('nexus_notifications')
        if (saved) {
            try { setNotifConfig(JSON.parse(saved)) } catch { }
        }
    }, [router])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: name }
            })
            if (error) throw error
            toast.success('Perfil atualizado com sucesso!')
        } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar perfil')
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const requestNotifPermission = async () => {
        if (!('Notification' in window)) {
            toast.error('Seu navegador não suporta notificações')
            return
        }
        const result = await Notification.requestPermission()
        setNotifPermission(result)
        if (result === 'granted') {
            toast.success('Notificações ativadas!')
            new Notification('Nexus Capital Elite', {
                body: 'Notificações ativadas com sucesso! 🔔',
                icon: '/logo.png',
            })
        }
    }

    const updateNotifConfig = (key: keyof NotificationConfig) => {
        const newConfig = { ...notifConfig, [key]: !notifConfig[key] }
        setNotifConfig(newConfig)
        localStorage.setItem('nexus_notifications', JSON.stringify(newConfig))
        toast.success(`${!notifConfig[key] ? 'Ativado' : 'Desativado'}`)
    }

    const notificationOptions = [
        { key: 'billReminders' as const, icon: Clock, label: 'Contas a Vencer', description: 'Aviso 3 dias antes do vencimento', color: 'text-accent-red' },
        { key: 'studyReminders' as const, icon: GraduationCap, label: 'Lembrete de Estudo', description: 'Lembrete diário para Academy', color: 'text-accent-purple' },
        { key: 'priceAlerts' as const, icon: TrendingUp, label: 'Alertas de Preço', description: 'Quando ativo atingir preço-alvo', color: 'text-accent-green' },
        { key: 'goalProgress' as const, icon: Target, label: 'Progresso de Metas', description: 'Atualizações semanais das metas', color: 'text-accent-yellow' },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto pb-32 sm:pb-20 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Gerenciar Conta</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* User Info View */}
                <div className="md:col-span-1 card-premium p-6 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-4 shadow-lg border-4 border-black/50">
                        <span className="text-3xl font-bold">{user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <h2 className="text-xl font-bold">{user?.user_metadata?.full_name || 'Usuário Nexus'}</h2>
                    <p className="text-gray-400 text-sm mb-6">{user?.email}</p>

                    <div className="w-full space-y-3 text-left">
                        <div className="flex items-center gap-3 text-sm text-gray-400 bg-black/20 p-3 rounded-xl border border-white/5">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>Membro desde {new Date(user?.created_at || '').toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400 bg-black/20 p-3 rounded-xl border border-white/5">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span>Segurança aprimorada padrão Nexus</span>
                        </div>
                    </div>

                    <div className="w-full mt-6 pt-6 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors font-medium border border-red-500/20"
                        >
                            <LogOut className="w-4 h-4" />
                            Encerrar Sessão
                        </button>
                    </div>
                </div>

                {/* Edit Form + Notification Settings */}
                <div className="md:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <div className="card-premium p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <UserCircle className="w-5 h-5 text-primary" /> Informações Pessoais
                        </h3>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#161922] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                                    placeholder="Seu nome"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">E-mail (Acesso Principal)</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full bg-[#161922]/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">O e-mail não pode ser alterado por motivos de segurança.</p>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving || !name.trim()}
                                    className="px-6 py-3 bg-gradient-to-r from-primary to-indigo-500 hover:from-primary hover:to-indigo-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center gap-2"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Notification Settings */}
                    <div className="card-premium p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-accent-purple" /> Notificações
                        </h3>

                        {/* Permission Status */}
                        {notifPermission !== 'granted' && (
                            <button
                                onClick={requestNotifPermission}
                                className="w-full mb-4 py-3 px-4 rounded-xl bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-sm font-medium hover:bg-accent-purple/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <Bell className="w-4 h-4" />
                                Permitir Notificações
                            </button>
                        )}

                        {notifPermission === 'granted' && (
                            <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-green/10 border border-accent-green/20">
                                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                                <span className="text-xs text-accent-green font-medium">Notificações ativadas</span>
                            </div>
                        )}

                        {/* Notification Types */}
                        <div className="space-y-2">
                            {notificationOptions.map(notif => (
                                <button
                                    key={notif.key}
                                    onClick={() => updateNotifConfig(notif.key)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                                >
                                    <notif.icon className={`w-4 h-4 ${notif.color} shrink-0`} />
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium text-gray-200">{notif.label}</p>
                                        <p className="text-xs text-gray-500">{notif.description}</p>
                                    </div>
                                    <div className={`w-9 h-5 rounded-full transition-colors ${notifConfig[notif.key] ? 'bg-accent-green' : 'bg-gray-700'} flex items-center px-0.5`}>
                                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifConfig[notif.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
