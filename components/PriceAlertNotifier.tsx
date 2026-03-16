'use client'

import { useEffect, useRef } from 'react'
import { Asset } from '@/lib/supabase'

interface PriceAlertNotifierProps {
  assets: Asset[]
}

interface PriceAlert {
  ticker: string
  targetPrice: number
  direction: 'above' | 'below'
}

const STORAGE_KEY = 'nexus_price_alerts'
const NOTIFIED_KEY = 'nexus_price_alerts_notified'

function getAlerts(): PriceAlert[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function getNotified(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(NOTIFIED_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function markNotified(key: string) {
  const notified = getNotified()
  notified[key] = true
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(notified))
}

export function addPriceAlert(ticker: string, targetPrice: number, direction: 'above' | 'below') {
  const alerts = getAlerts()
  // Avoid duplicates
  const exists = alerts.find(a => a.ticker === ticker && a.targetPrice === targetPrice && a.direction === direction)
  if (!exists) {
    alerts.push({ ticker, targetPrice, direction })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
  }
}

export function removePriceAlert(ticker: string, targetPrice: number) {
  const alerts = getAlerts().filter(a => !(a.ticker === ticker && a.targetPrice === targetPrice))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}

export function getAllPriceAlerts(): PriceAlert[] {
  return getAlerts()
}

export default function PriceAlertNotifier({ assets }: PriceAlertNotifierProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    const checkAlerts = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return

      // Check notification config
      const notifConfig = localStorage.getItem('nexus_notifications')
      if (notifConfig) {
        try {
          const config = JSON.parse(notifConfig)
          if (!config.priceAlerts) return
        } catch {}
      }

      const alerts = getAlerts()
      const notified = getNotified()

      alerts.forEach(alert => {
        const key = `${alert.ticker}_${alert.targetPrice}_${alert.direction}`
        if (notified[key]) return

        const asset = assets.find(a => a.ticker === alert.ticker)
        if (!asset) return

        const triggered =
          (alert.direction === 'above' && asset.preco_atual >= alert.targetPrice) ||
          (alert.direction === 'below' && asset.preco_atual <= alert.targetPrice)

        if (triggered) {
          new Notification(`🔔 Alerta de Preço - ${alert.ticker}`, {
            body: `${alert.ticker} ${alert.direction === 'above' ? 'atingiu' : 'caiu para'} R$ ${asset.preco_atual.toFixed(2)} (alvo: R$ ${alert.targetPrice.toFixed(2)})`,
            icon: '/logo.png',
          })
          markNotified(key)
        }
      })
    }

    // Check immediately and every 60 seconds
    checkAlerts()
    intervalRef.current = setInterval(checkAlerts, 60000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [assets])

  // This is a headless component
  return null
}
