'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Network, Search, Zap } from 'lucide-react'

// Helper para gerar nós aleatórios fluindo na tela
interface Node {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    type: 'core' | 'income' | 'expense' | 'asset';
    label: string;
}

export default function NeuralGraph() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [nodes, setNodes] = useState<Node[]>([])

    useEffect(() => {
        // Inicializar nós
        const initialNodes: Node[] = [
            { id: 0, x: 150, y: 150, vx: 0, vy: 0, type: 'core', label: 'NET WORTH' },
            { id: 1, x: 50, y: 50, vx: 0.2, vy: 0.1, type: 'income', label: 'B2B' },
            { id: 2, x: 250, y: 60, vx: -0.1, vy: 0.2, type: 'income', label: 'B2C' },
            { id: 3, x: 260, y: 240, vx: -0.2, vy: -0.1, type: 'expense', label: 'OPEX' },
            { id: 4, x: 40, y: 220, vx: 0.1, vy: -0.2, type: 'asset', label: 'CRYPTO' },
            { id: 5, x: 150, y: 40, vx: 0.15, vy: 0.15, type: 'asset', label: 'FIIs' }
        ]
        setNodes(initialNodes)

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Atualizar física
            initialNodes.forEach(node => {
                if (node.type !== 'core') {
                    node.x += node.vx
                    node.y += node.vy

                    // Bounce nas bordas
                    if (node.x <= 20 || node.x >= canvas.width - 20) node.vx *= -1
                    if (node.y <= 20 || node.y >= canvas.height - 20) node.vy *= -1

                    // Atrair levemente pro centro (Gravity)
                    const dx = 150 - node.x
                    const dy = 150 - node.y
                    node.vx += dx * 0.0001
                    node.vy += dy * 0.0001
                }
            })

            // Desenhar linhas neurais
            ctx.lineWidth = 1
            initialNodes.forEach(nodeA => {
                initialNodes.forEach(nodeB => {
                    if (nodeA.id < nodeB.id) {
                        const dist = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y)
                        if (dist < 150) {
                            const opacity = 1 - (dist / 150)

                            // Gradiente da linha
                            const grad = ctx.createLinearGradient(nodeA.x, nodeA.y, nodeB.x, nodeB.y)
                            grad.addColorStop(0, `rgba(59, 130, 246, ${opacity * 0.5})`) // Azul
                            grad.addColorStop(1, `rgba(139, 92, 246, ${opacity * 0.5})`) // Roxo

                            ctx.beginPath()
                            ctx.moveTo(nodeA.x, nodeA.y)
                            ctx.lineTo(nodeB.x, nodeB.y)
                            ctx.strokeStyle = grad
                            ctx.stroke()

                            // Efeito de "dados fluindo" (Datapoints)
                            if (Math.random() > 0.95 && dist > 50) {
                                const t = Math.random()
                                const px = nodeA.x + (nodeB.x - nodeA.x) * t
                                const py = nodeA.y + (nodeB.y - nodeA.y) * t
                                ctx.beginPath()
                                ctx.arc(px, py, 2, 0, Math.PI * 2)
                                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
                                ctx.fill()
                            }
                        }
                    }
                })
            })

            // Desenhar nós
            initialNodes.forEach(node => {
                ctx.beginPath()
                const radius = node.type === 'core' ? 25 : 12
                ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)

                // Cores baseadas no tipo
                if (node.type === 'core') ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
                else if (node.type === 'income') ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'
                else if (node.type === 'expense') ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'
                else ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'

                // Glow Effect
                ctx.shadowBlur = 15
                if (node.type === 'core') ctx.shadowColor = 'rgba(139, 92, 246, 0.6)'
                else if (node.type === 'income') ctx.shadowColor = 'rgba(16, 185, 129, 0.4)'
                else if (node.type === 'expense') ctx.shadowColor = 'rgba(239, 68, 68, 0.4)'
                else ctx.shadowColor = 'rgba(59, 130, 246, 0.4)'

                ctx.fill()

                // Bordas
                ctx.lineWidth = 2
                ctx.shadowBlur = 0
                if (node.type === 'core') ctx.strokeStyle = '#8B5CF6'
                else if (node.type === 'income') ctx.strokeStyle = '#34D399'
                else if (node.type === 'expense') ctx.strokeStyle = '#F87171'
                else ctx.strokeStyle = '#60A5FA'
                ctx.stroke()

                // Texto
                if (node.type !== 'core') {
                    ctx.fillStyle = '#9CA3AF'
                    ctx.font = '9px "JetBrains Mono"'
                    ctx.textAlign = 'center'
                    ctx.fillText(node.label, node.x, node.y + 24)
                } else {
                    ctx.fillStyle = '#FFFFFF'
                    ctx.font = 'bold 10px "Inter"'
                    ctx.textAlign = 'center'
                    ctx.fillText('NEXUS', node.x, node.y + 3)
                }
            })

            animationFrameId = window.requestAnimationFrame(render)
        }

        render()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <div className="card-premium relative overflow-hidden h-[300px] flex flex-col group">
            <div className="absolute inset-0 bg-dark-card/60 backdrop-blur-xl z-0" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10" />

            {/* Header do Card */}
            <div className="relative z-10 p-5 border-b border-white/[0.04] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent-purple/20 flex items-center justify-center border border-primary/20">
                        <Network className="w-4 h-4 text-primary-lighter" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Grafo Neural</h3>
                        <p className="text-[10px] text-gray-500 font-mono">TOPOLOGIA PATRIMONIAL</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse shadow-[0_0_8px_#10B981]" />
                    <span className="text-[9px] text-accent-green font-mono uppercase tracking-widest">Sincronizado</span>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="relative w-full flex-1 flex items-center justify-center z-10 p-4">
                <canvas
                    ref={canvasRef}
                    width={300}
                    height={200}
                    className="w-full h-full max-w-[300px] max-h-[200px]"
                // Em um app real, o tamanho do canvas seria responsivo no ResizeObserver
                />

                {/* Overlay scanning effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_10%,transparent_100%)] opacity-20 pointer-events-none" />
            </div>

            {/* Footer Metrics */}
            <div className="relative z-10 border-t border-white/[0.04] bg-black/20 p-3 flex justify-between items-center text-[10px] font-mono shrink-0">
                <div className="flex gap-4 text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-green/50 border border-accent-green"></span> Inflows</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-red/50 border border-accent-red"></span> Outflows</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/50 border border-primary"></span> Assets</span>
                </div>
                <span className="text-primary-lighter opacity-50 flex items-center gap-1"><Zap className="w-3 h-3" /> ATIVO</span>
            </div>
        </div>
    )
}
