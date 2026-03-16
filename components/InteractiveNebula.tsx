'use client'

import React, { useEffect, useRef } from 'react'

export default function InteractiveNebula() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let particles: Particle[] = []

        // Mouse tracking
        let mouse = { x: -1000, y: -1000 }

        const updateSize = () => {
            // Pega o tamanho real do container flex
            const rect = canvas.parentElement?.getBoundingClientRect()
            if (rect) {
                canvas.width = rect.width
                canvas.height = rect.height
                initParticles()
            }
        }

        class Particle {
            x: number
            y: number
            vx: number
            vy: number
            size: number

            constructor(w: number, h: number) {
                this.x = Math.random() * w
                this.y = Math.random() * h
                this.vx = (Math.random() - 0.5) * 0.5
                this.vy = (Math.random() - 0.5) * 0.5
                this.size = Math.random() * 2 + 0.5
            }

            update(w: number, h: number) {
                this.x += this.vx
                this.y += this.vy

                // Rebater nas bordas
                if (this.x < 0 || this.x > w) this.vx *= -1
                if (this.y < 0 || this.y > h) this.vy *= -1

                // Fugir polidamente do mouse
                const dx = mouse.x - this.x
                const dy = mouse.y - this.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                const maxDist = 120

                if (distance < maxDist) {
                    const force = (maxDist - distance) / maxDist
                    this.x -= (dx / distance) * force * 2
                    this.y -= (dy / distance) * force * 2
                }
            }

            draw(context: CanvasRenderingContext2D) {
                context.beginPath()
                context.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                context.fillStyle = '#00D9FF'
                context.fill()
            }
        }

        const initParticles = () => {
            particles = []
            const numParticles = Math.floor((canvas.width * canvas.height) / 10000) // Densidade de estrelas baseada na tela
            for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle(canvas.width, canvas.height))
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Desenhar Fundo Escuro do Espaço (Nebulosa)
            const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height))
            grad.addColorStop(0, '#0a0a1a')
            grad.addColorStop(1, '#020205')
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Atualizar e desenhar partículas e linhas
            for (let i = 0; i < particles.length; i++) {
                particles[i].update(canvas.width, canvas.height)
                particles[i].draw(ctx)

                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 100) {
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(0, 217, 255, ${1 - distance / 100})`
                        ctx.lineWidth = 0.5
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.stroke()
                    }
                }
            }

            // Conectar partículas ao Mouse se estiver perto
            for (let i = 0; i < particles.length; i++) {
                const dx = mouse.x - particles[i].x
                const dy = mouse.y - particles[i].y
                const distance = Math.sqrt(dx * dx + dy * dy)
                if (distance < 150) {
                    ctx.beginPath()
                    ctx.strokeStyle = `rgba(139, 92, 246, ${1 - distance / 150})` // Roxo Neon da logo Nexus
                    ctx.lineWidth = 1
                    ctx.moveTo(particles[i].x, particles[i].y)
                    ctx.lineTo(mouse.x, mouse.y)
                    ctx.stroke()
                }
            }

            animationFrameId = requestAnimationFrame(animate)
        }

        // Event Listeners
        window.addEventListener('resize', updateSize)
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect()
            mouse.x = e.clientX - rect.left
            mouse.y = e.clientY - rect.top
        })
        canvas.addEventListener('mouseleave', () => {
            mouse.x = -1000
            mouse.y = -1000
        })

        // Init
        updateSize() // Preenche baseado na parent div (flex)
        animate()

        return () => {
            window.removeEventListener('resize', updateSize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <div className="card-premium relative overflow-hidden w-full h-full flex items-center justify-center border-primary/20 hover:border-primary/50 transition-colors shadow-[0_0_30px_rgba(0,217,255,0.05)]">
            {/* Canvas Interativo ocupa 100% da caixa */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 cursor-crosshair" />

            {/* Sobreposição: Logo do Nexus no Centro */}
            <div className="relative z-10 flex flex-col items-center pointer-events-none">
                <div className="mb-2 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 via-accent-purple/20 to-transparent flex items-center justify-center border border-primary/30 backdrop-blur-sm shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    {/* Símbolo Abstrato Nexus */}
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-lighter animate-pulse">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-lighter to-accent-purple tracking-[0.2em] font-mono drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                    NEXUS
                </h1>
                <p className="text-[10px] text-gray-400 tracking-[0.3em] font-mono mt-2 uppercase">Neural Network Active</p>
            </div>
        </div>
    )
}
