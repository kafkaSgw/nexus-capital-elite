'use client'

import { useState, useEffect } from 'react'
import { Bell, X, AlertTriangle, CheckCircle, Info, TrendingDown, BellRing } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

interface Notification {
  id: string
  type: 'warning' | 'success' | 'info' | 'alert'
  title: string
  message: string
  date: Date
  read: boolean
  action?: () => void
  actionLabel?: string
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user } = useAuth()
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [pushStatus, setPushStatus] = useState<string>('pending')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushStatus('unsupported')
    } else {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) setPushStatus('subscribed')
          else setPushStatus('unsubscribed')
        }).catch(() => setPushStatus('unsupported'))
      }).catch(() => setPushStatus('unsupported'))
    }
  }, [])

  const subscribeUser = async () => {
    try {
      if (!user) return
      setIsSubscribing(true)
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      const res = await fetch('/api/web-push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, userEmail: user.email })
      })

      if (res.ok) setPushStatus('subscribed')
      else console.error('Falha ao salvar assinatura de push.')
    } catch (e) {
      console.error('Falha no Push Manager', e)
    } finally {
      setIsSubscribing(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const loadNotifications = async () => {
    const notifs: Notification[] = []

    try {
      // 1. Verificar contas a vencer (próximos 7 dias)
      const { data: scheduled } = await supabase
        .from('scheduled_transactions')
        .select('*')
        .eq('is_paid', false)
        .gte('due_date', new Date().toISOString().split('T')[0])
        .lte('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

      if (scheduled && scheduled.length > 0) {
        scheduled.forEach((item: any) => {
          const daysLeft = Math.ceil((new Date(item.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

          notifs.push({
            id: `scheduled-${item.id}`,
            type: daysLeft <= 3 ? 'warning' : 'info',
            title: daysLeft === 0 ? 'Vence HOJE!' : daysLeft === 1 ? 'Vence AMANHÃ!' : `Vence em ${daysLeft} dias`,
            message: `${item.description} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(item.amount))}`,
            date: new Date(),
            read: false
          })
        })
      }

      // 2. Verificar transações recentes (últimas 24h)
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(3)

      if (recentTransactions && recentTransactions.length > 0) {
        recentTransactions.forEach((t: any) => {
          if (t.type === 'income') {
            notifs.push({
              id: `transaction-${t.id}`,
              type: 'success',
              title: 'Receita Recebida',
              message: `${t.description} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}`,
              date: new Date(t.created_at),
              read: false
            })
          }
        })
      }

      // 3. Verificar investimentos com grande variação
      const { data: assets } = await supabase
        .from('assets')
        .select('*')

      if (assets && assets.length > 0) {
        assets.forEach((asset: any) => {
          const variation = ((asset.preco_atual - asset.preco_medio) / asset.preco_medio) * 100

          if (Math.abs(variation) > 10) {
            notifs.push({
              id: `asset-${asset.id}`,
              type: variation > 0 ? 'success' : 'alert',
              title: variation > 0 ? 'Investimento em alta!' : 'Investimento em queda',
              message: `${asset.ticker}: ${variation > 0 ? '+' : ''}${variation.toFixed(1)}% (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.preco_atual)})`,
              date: new Date(asset.updated_at),
              read: false
            })
          }
        })
      }

      // Restaurar estado de leitura e remoção do localStorage
      const savedState = localStorage.getItem('nexus_notifications')
      const parsedState = savedState ? JSON.parse(savedState) : { readIds: [], removedIds: [] }
      const readIds = parsedState.readIds || []
      const removedIds = parsedState.removedIds || []

      // Filtrar notificações removidas e aplicar status de leitura
      const finalNotifs = notifs
        .filter(n => !removedIds.includes(n.id))
        .map((n: Notification) => ({
          ...n,
          read: readIds.includes(n.id) ? true : n.read
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime())

      setNotifications(finalNotifs)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    }
  }

  // Save to locale storage whenever it changes
  const saveStateToStorage = (read: string[], removed: string[]) => {
    localStorage.setItem('nexus_notifications', JSON.stringify({ readIds: read, removedIds: removed }))
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const hasWarning = notifications.some(n => !n.read && n.type === 'warning')

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      const readIds = updated.filter(n => n.read).map(n => n.id)
      const removedIds = JSON.parse(localStorage.getItem('nexus_notifications') || '{}').removedIds || []
      saveStateToStorage(readIds, removedIds)
      return updated
    })
  }

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      const readIds = updated.map(n => n.id)
      const removedIds = JSON.parse(localStorage.getItem('nexus_notifications') || '{}').removedIds || []
      saveStateToStorage(readIds, removedIds)
      return updated
    })
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id)
      const readIds = updated.filter(n => n.read).map(n => n.id)
      const removedIds = JSON.parse(localStorage.getItem('nexus_notifications') || '{}').removedIds || []
      saveStateToStorage(readIds, [...removedIds, id])
      return updated
    })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-accent-yellow" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-accent-green" />
      case 'alert':
        return <TrendingDown className="w-5 h-5 text-accent-red" />
      default:
        return <Info className="w-5 h-5 text-primary" />
    }
  }


  const getColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-accent-yellow/30 bg-accent-yellow/5'
      case 'success':
        return 'border-accent-green/30 bg-accent-green/5'
      case 'alert':
        return 'border-accent-red/30 bg-accent-red/5'
      default:
        return 'border-primary/30 bg-primary/5'
    }
  }


  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 hover:bg-dark-hover rounded-lg transition-colors ${hasWarning ? 'animate-pulse' : ''}`}
      >
        <Bell className="w-5 h-5 text-gray-400" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 w-5 h-5 bg-accent-red rounded-full flex items-center justify-center text-xs font-bold text-white ${hasWarning ? 'shadow-[0_0_12px_rgba(255,71,87,1)]' : ''}`}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-dark-card/95 backdrop-blur-xl border-l border-dark-border z-[100] flex flex-col animate-slide-in-right shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between p-5 border-b border-dark-border flex-shrink-0">
              <div>
                <h3 className="font-bold text-white text-lg tracking-tight">Notificações</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-xs text-corporate-silver/60 uppercase tracking-widest font-semibold">{unreadCount} pendentes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary-light transition-colors px-2 py-1 rounded hover:bg-primary/10"
                  >
                    Marcar todas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {pushStatus === 'unsubscribed' && (
              <div className="mx-4 mt-4 p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-primary" />
                  <span className="text-xs text-primary font-medium">Ativar push messages</span>
                </div>
                <button
                  onClick={subscribeUser}
                  disabled={isSubscribing}
                  className="text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-3 py-1.5 rounded hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {isSubscribing ? 'Ativando...' : 'Ativar'}
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-600 mb-3" />
                  <p className="text-gray-400 font-medium">Nenhuma notificação</p>
                  <p className="text-xs text-gray-500 mt-1">Quando houver novidades, elas aparecerão aqui</p>
                </div>
              ) : (
                <div className="divide-y divide-dark-border mt-2">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-dark-hover transition-colors cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center ${getColor(notification.type)}`}>
                          {getIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-medium text-white text-sm">
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notification.id)
                              }}
                              className="flex-shrink-0 p-1 hover:bg-dark-bg rounded transition-colors"
                            >
                              <X className="w-3 h-3 text-gray-500" />
                            </button>
                          </div>

                          <p className="text-xs text-gray-400 mb-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {notification.date.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>

                            {notification.actionLabel && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  notification.action?.()
                                }}
                                className="text-xs text-primary hover:text-primary-light font-medium"
                              >
                                {notification.actionLabel}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
