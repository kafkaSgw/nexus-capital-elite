'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Clock, Target, GraduationCap, TrendingUp, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface NotificationConfig {
    billReminders: boolean
    studyReminders: boolean
    priceAlerts: boolean
    goalProgress: boolean
}

export default function NotificationManager() {
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [config, setConfig] = useState<NotificationConfig>({
        billReminders: true,
        studyReminders: true,
        priceAlerts: true,
        goalProgress: true,
    })
    const [showPanel, setShowPanel] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission)
        }
        // Load saved config
        const saved = localStorage.getItem('nexus_notifications')
        if (saved) {
            try { setConfig(JSON.parse(saved)) } catch { }
        }
    }, [])

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            toast.error('Seu navegador não suporta notificações')
            return
        }
        const result = await Notification.requestPermission()
        setPermission(result)
        if (result === 'granted') {
            toast.success('Notificações ativadas!')
            new Notification('Nexus Capital Elite', {
                body: 'Notificações ativadas com sucesso! 🔔',
                icon: '/logo.png',
            })
        }
    }

    const updateConfig = (key: keyof NotificationConfig) => {
        const newConfig = { ...config, [key]: !config[key] }
        setConfig(newConfig)
        localStorage.setItem('nexus_notifications', JSON.stringify(newConfig))
        toast.success(`${!config[key] ? 'Ativado' : 'Desativado'}`)
    }

    const sendTestNotification = () => {
        if (permission !== 'granted') {
            toast.error('Permita as notificações primeiro')
            return
        }
        new Notification('🔔 Lembrete Nexus Capital', {
            body: 'Esta é uma notificação de teste! Tudo funcionando.',
            icon: '/logo.png',
        })
    }

    const notifications = [
        { key: 'billReminders' as const, icon: Clock, label: 'Contas a Vencer', description: 'Aviso 3 dias antes do vencimento', color: 'text-accent-red' },
        { key: 'studyReminders' as const, icon: GraduationCap, label: 'Lembrete de Estudo', description: 'Lembrete diário para Academy', color: 'text-accent-purple' },
        { key: 'priceAlerts' as const, icon: TrendingUp, label: 'Alertas de Preço', description: 'Quando ativo atingir preço-alvo', color: 'text-accent-green' },
        { key: 'goalProgress' as const, icon: Target, label: 'Progresso de Metas', description: 'Atualizações semanais das metas', color: 'text-accent-yellow' },
    ]

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="fixed bottom-20 left-4 z-[45] w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-accent-pink shadow-lg shadow-accent-purple/20 flex items-center justify-center hover:scale-110 transition-transform"
                title="Gerenciar Notificações"
            >
                <Bell className="w-5 h-5 text-white" />
                {permission !== 'granted' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-red rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">!</span>
                    </div>
                )}
            </button>

            {/* Panel */}
            <AnimatePresence>
                {showPanel && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-36 left-4 z-[45] w-80 card-premium overflow-hidden shadow-xl"
                    >
                        <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-accent-purple" />
                                <h4 className="text-sm font-bold text-white">Notificações</h4>
                            </div>
                            <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4">
                            {/* Permission Status */}
                            {permission !== 'granted' && (
                                <button
                                    onClick={requestPermission}
                                    className="w-full mb-3 py-2.5 px-4 rounded-xl bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-sm font-medium hover:bg-accent-purple/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Bell className="w-4 h-4" />
                                    Permitir Notificações
                                </button>
                            )}

                            {/* Notification Types */}
                            <div className="space-y-2">
                                {notifications.map(notif => (
                                    <button
                                        key={notif.key}
                                        onClick={() => updateConfig(notif.key)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                                    >
                                        <notif.icon className={`w-4 h-4 ${notif.color} shrink-0`} />
                                        <div className="flex-1 text-left">
                                            <p className="text-xs font-medium text-gray-200">{notif.label}</p>
                                            <p className="text-[10px] text-gray-500">{notif.description}</p>
                                        </div>
                                        <div className={`w-8 h-5 rounded-full transition-colors ${config[notif.key] ? 'bg-accent-green' : 'bg-gray-700'} flex items-center`}>
                                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${config[notif.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Test button */}
                            {permission === 'granted' && (
                                <button
                                    onClick={sendTestNotification}
                                    className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                                >
                                    Enviar notificação de teste
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
