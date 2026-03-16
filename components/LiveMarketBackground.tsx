'use client'

import React, { useEffect, useRef, useCallback } from 'react'

type MarketSentiment = 'bullish' | 'bearish' | 'neutral'

interface LiveMarketBackgroundProps {
  sentiment?: MarketSentiment
}

// Color palettes per sentiment
const PALETTES: Record<MarketSentiment, { particles: string[]; links: string; glow: string; bgGrad: [string, string] }> = {
  bullish: {
    particles: ['#10B981', '#34D399', '#6EE7B7', '#059669', '#00D9FF'],
    links: 'rgba(16, 185, 129, VAR)',
    glow: 'rgba(16, 185, 129, 0.08)',
    bgGrad: ['rgba(5, 46, 30, 0.4)', 'rgba(0, 0, 0, 0)'],
  },
  bearish: {
    particles: ['#7F1D1D', '#991B1B', '#B91C1C', '#6B2138', '#4A1942'],
    links: 'rgba(127, 29, 29, VAR)',
    glow: 'rgba(127, 29, 29, 0.06)',
    bgGrad: ['rgba(50, 10, 20, 0.4)', 'rgba(0, 0, 0, 0)'],
  },
  neutral: {
    particles: ['#3B82F6', '#8B5CF6', '#6366F1', '#2563EB', '#7C3AED'],
    links: 'rgba(59, 130, 246, VAR)',
    glow: 'rgba(59, 130, 246, 0.06)',
    bgGrad: ['rgba(15, 23, 42, 0.4)', 'rgba(0, 0, 0, 0)'],
  },
}

// Speed multipliers per sentiment
const SPEED: Record<MarketSentiment, number> = {
  bullish: 1.0,
  bearish: 0.45,
  neutral: 0.65,
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  baseSpeed: number
  depth: number // 0-1, for parallax effect
  opacity: number
  pulsePhase: number
}

export default function LiveMarketBackground({ sentiment = 'neutral' }: LiveMarketBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const sentimentRef = useRef(sentiment)
  const particlesRef = useRef<Particle[]>([])
  const frameRef = useRef(0)
  const timeRef = useRef(0)

  // Keep sentimentRef in sync
  useEffect(() => {
    sentimentRef.current = sentiment
  }, [sentiment])

  const createParticle = useCallback((w: number, h: number): Particle => {
    const palette = PALETTES[sentimentRef.current]
    const depth = 0.3 + Math.random() * 0.7 // 0.3 to 1.0
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: (Math.random() * 2.5 + 0.5) * depth,
      color: palette.particles[Math.floor(Math.random() * palette.particles.length)],
      baseSpeed: 0.3 + Math.random() * 0.5,
      depth,
      opacity: 0.15 + depth * 0.4,
      pulsePhase: Math.random() * Math.PI * 2,
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animId: number
    let w = 0
    let h = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Initialize particles based on area (density)
      const count = Math.min(Math.floor((w * h) / 12000), 120)
      if (particlesRef.current.length === 0) {
        particlesRef.current = Array.from({ length: count }, () => createParticle(w, h))
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    }

    const handleTouchEnd = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    // ---- WAVE FUNCTION ----
    const drawWaves = (time: number) => {
      const sent = sentimentRef.current
      const palette = PALETTES[sent]
      const speed = SPEED[sent]

      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath()
        const amplitude = 20 + wave * 10
        const frequency = 0.003 - wave * 0.0005
        const yOffset = h * (0.6 + wave * 0.12)
        const phaseShift = time * 0.0005 * speed + wave * 1.2

        ctx.moveTo(0, h)
        for (let x = 0; x <= w; x += 4) {
          const y = yOffset + Math.sin(x * frequency + phaseShift) * amplitude
            + Math.sin(x * frequency * 1.8 + phaseShift * 0.7) * (amplitude * 0.4)
          ctx.lineTo(x, y)
        }
        ctx.lineTo(w, h)
        ctx.closePath()

        const waveOpacity = 0.015 - wave * 0.003
        const grad = ctx.createLinearGradient(0, yOffset - amplitude, 0, h)
        grad.addColorStop(0, palette.links.replace('VAR', String(waveOpacity)))
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.fill()
      }
    }

    // ---- MAIN LOOP ----
    const animate = (timestamp: number) => {
      timeRef.current = timestamp
      frameRef.current++

      ctx.clearRect(0, 0, w, h)

      const sent = sentimentRef.current
      const palette = PALETTES[sent]
      const speedMul = SPEED[sent]
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const particles = particlesRef.current

      // Subtle radial glow from center (sentiment color)
      const centerGlow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7)
      centerGlow.addColorStop(0, palette.glow)
      centerGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = centerGlow
      ctx.fillRect(0, 0, w, h)

      // Draw flowing waves
      drawWaves(timestamp)

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Gradually shift particle color to match current sentiment palette
        if (frameRef.current % 120 === 0) {
          p.color = palette.particles[Math.floor(Math.random() * palette.particles.length)]
        }

        // Movement with depth-based parallax
        p.x += p.vx * speedMul * p.depth
        p.y += p.vy * speedMul * p.depth

        // Gentle sine drift for organic feel
        p.x += Math.sin(timestamp * 0.0003 + p.pulsePhase) * 0.15 * p.depth
        p.y += Math.cos(timestamp * 0.00025 + p.pulsePhase * 1.3) * 0.1 * p.depth

        // Bounce on edges
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) }
        if (p.x > w) { p.x = w; p.vx = -Math.abs(p.vx) }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) }
        if (p.y > h) { p.y = h; p.vy = -Math.abs(p.vy) }

        // Mouse repulsion with depth-weighted strength
        const dx = mx - p.x
        const dy = my - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const repelRadius = 160 * p.depth

        if (dist < repelRadius && dist > 0) {
          const force = ((repelRadius - dist) / repelRadius) * 3.5 * p.depth
          p.x -= (dx / dist) * force
          p.y -= (dy / dist) * force
        }

        // Pulsing opacity
        const pulse = Math.sin(timestamp * 0.001 + p.pulsePhase) * 0.12
        const alpha = Math.max(0.05, p.opacity + pulse)

        // Draw glow (larger particles get glow)
        if (p.size > 1.5) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
          ctx.fillStyle = p.color.replace(')', `, ${alpha * 0.15})`).replace('rgb', 'rgba')
          ctx.fill()
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = alpha
        ctx.fill()
        ctx.globalAlpha = 1

        // Draw links between nearby particles (only check forward to avoid duplicates)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const ldx = p.x - p2.x
          const ldy = p.y - p2.y
          const ldist = Math.sqrt(ldx * ldx + ldy * ldy)
          const linkDist = 120 * Math.min(p.depth, p2.depth)

          if (ldist < linkDist) {
            const linkAlpha = (1 - ldist / linkDist) * 0.12 * Math.min(p.depth, p2.depth)
            ctx.beginPath()
            ctx.strokeStyle = palette.links.replace('VAR', String(linkAlpha))
            ctx.lineWidth = 0.5
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }

        // Draw link to mouse if nearby
        if (dist < 200 && dist > 0) {
          const mouseAlpha = (1 - dist / 200) * 0.25 * p.depth
          ctx.beginPath()
          ctx.strokeStyle = palette.links.replace('VAR', String(mouseAlpha))
          ctx.lineWidth = 1
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(mx, my)
          ctx.stroke()
        }
      }

      animId = requestAnimationFrame(animate)
    }

    // Event listeners
    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true })
    canvas.addEventListener('touchend', handleTouchEnd)

    resize()
    animId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      cancelAnimationFrame(animId)
    }
  }, [createParticle])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-auto z-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: 'crosshair' }}
      />
      {/* Soft vignette overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)',
        }}
      />
    </div>
  )
}
