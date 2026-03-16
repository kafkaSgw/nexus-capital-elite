'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Transaction } from '@/lib/supabase'

interface SankeyDiagramProps {
    transactions: Transaction[]
}

export default function SankeyDiagram({ transactions }: SankeyDiagramProps) {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null)

    // Calcule o fluxo financeiro: Receitas -> "Meu Dinheiro" -> Despesas (por categoria)
    const { totalIncome, totalExpense, expenseCategories } = useMemo(() => {
        let income = 0
        let expense = 0
        const categories: Record<string, number> = {}

        transactions.forEach(t => {
            if (t.type === 'income') {
                income += t.amount
            } else {
                expense += Math.abs(t.amount)
                categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount)
            }
        })

        // Sort categories by amount
        const sortedCategories = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .map(([name, amount]) => ({ name, amount }))

        return { totalIncome: income, totalExpense: expense, expenseCategories: sortedCategories }
    }, [transactions])

    if (totalIncome === 0 && totalExpense === 0) {
        return (
            <div className="card-premium p-6 flex items-center justify-center h-64 text-gray-500">
                Registre requeitas e despesas para ver o fluxo.
            </div>
        )
    }

    // Se não houver receita, mas houver despesa, ajustamos para visualização
    const inFlow = Math.max(totalIncome, totalExpense, 1) // prevent division by zero

    // Layout Constants
    const width = 800
    const height = 400
    const nodeWidth = 20
    const padding = 20

    const maxLinkHeight = height - padding * 2
    const incomeHeight = (totalIncome / inFlow) * maxLinkHeight

    // Left Node (Income)
    const incomeNode = {
        id: 'Receita',
        x: padding,
        y: padding + (maxLinkHeight - incomeHeight) / 2,
        height: Math.max(incomeHeight, 2),
        color: '#10B981', // emerald-500
        value: totalIncome
    }

    // Middle Node (Pool/Wallet)
    const poolNode = {
        id: 'Patrimônio',
        x: width / 2 - nodeWidth / 2,
        y: padding,
        height: Math.max(maxLinkHeight, 2),
        color: '#3B82F6', // blue-500
        value: Math.max(totalIncome, totalExpense)
    }

    // Right Nodes (Expenses + Savings)
    const rightNodes: any[] = []
    let currentY = padding
    const savings = Math.max(0, totalIncome - totalExpense)

    // Map categories to right nodes
    expenseCategories.forEach((cat) => {
        const nodeHeight = (cat.amount / inFlow) * maxLinkHeight
        rightNodes.push({
            id: cat.name,
            x: width - padding - nodeWidth,
            y: currentY,
            height: Math.max(nodeHeight, 2), // min height 2px
            color: '#EF4444', // red-500
            value: cat.amount,
            trueHeight: nodeHeight // Guardar altura real para os links
        })
        currentY += Math.max(nodeHeight, 2) + 4 // 4px gap
    })

    if (savings > 0) {
        const savingsHeight = (savings / inFlow) * maxLinkHeight
        rightNodes.push({
            id: 'Poupado',
            x: width - padding - nodeWidth,
            y: currentY,
            height: Math.max(savingsHeight, 2),
            color: '#8B5CF6', // purple-500
            value: savings,
            trueHeight: savingsHeight
        })
    }

    // Generate SVG Path for links
    const createLink = (sourceNode: any, targetNode: any, sourceIndex: number = 0, targetIndex: number = 0, linkHeight: number) => {
        // Calculando posições exatas para conexões suaves (bezier curves)
        const x0 = sourceNode.x + nodeWidth
        const y0 = sourceNode.y + sourceIndex
        const x1 = targetNode.x
        const y1 = targetNode.y + targetIndex

        const curvature = 0.5
        const xi = d3interpolateNumber(x0, x1)
        const x2 = xi(curvature)
        const x3 = xi(1 - curvature)

        return `M ${x0},${y0} 
            C ${x2},${y0} ${x3},${y1} ${x1},${y1} 
            L ${x1},${y1 + linkHeight} 
            C ${x3},${y1 + linkHeight} ${x2},${y0 + linkHeight} ${x0},${y0 + linkHeight} 
            Z`
    }

    // Helper for linear interpolation
    const d3interpolateNumber = (a: number, b: number) => {
        return (t: number) => a + t * (b - a)
    }

    // Linhas do Income -> Pool
    // Alinhar ao centro ou ao topo dependendo do visual, aqui o link sai do topo do node
    const incomeToPoolLink = totalIncome > 0 ? createLink(incomeNode, poolNode, 0, (maxLinkHeight - incomeHeight) / 2, incomeHeight) : ''

    // Linhas do Pool -> Expenses
    const poolToExpensesLinks: any[] = []
    let poolCurrentYOutput = 0

    rightNodes.forEach(rn => {
        const linkPath = createLink(poolNode, rn, poolCurrentYOutput, 0, rn.trueHeight || rn.height)
        poolToExpensesLinks.push({ path: linkPath, targetId: rn.id, color: rn.color, value: rn.value })
        poolCurrentYOutput += rn.trueHeight || rn.height
    })

    return (
        <div className="card-premium p-6">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-white">Fluxo de Caixa (Sankey)</h2>
                <p className="text-sm text-gray-400">Origem e Destino do seu dinheiro</p>
            </div>

            <div className="relative w-full overflow-x-auto custom-scrollbar">
                <div className="min-w-[700px]">
                    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="font-sans">
                        <defs>
                            <linearGradient id="grad-income" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
                            </linearGradient>
                        </defs>

                        {/* Link: Income -> Pool */}
                        {incomeToPoolLink && (
                            <path
                                d={incomeToPoolLink}
                                fill="url(#grad-income)"
                                className="transition-opacity duration-300 hover:opacity-80 cursor-pointer"
                                onMouseEnter={() => setHoveredNode('Receita')}
                                onMouseLeave={() => setHoveredNode(null)}
                                opacity={hoveredNode === null || hoveredNode === 'Receita' ? 1 : 0.2}
                            />
                        )}

                        {/* Links: Pool -> Categories */}
                        {poolToExpensesLinks.map((link, i) => (
                            <path
                                key={i}
                                d={link.path}
                                fill={link.color}
                                fillOpacity={0.4}
                                className="transition-opacity duration-300 hover:opacity-80 cursor-pointer"
                                onMouseEnter={() => setHoveredNode(link.targetId)}
                                onMouseLeave={() => setHoveredNode(null)}
                                opacity={hoveredNode === null || hoveredNode === link.targetId || hoveredNode === 'Patrimônio' ? 1 : 0.1}
                            />
                        ))}

                        {/* Nodes */}
                        {[incomeNode, poolNode, ...rightNodes].map((node) => (
                            <g
                                key={node.id}
                                className="cursor-pointer transition-all duration-300"
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                style={{ opacity: hoveredNode === null || hoveredNode === node.id || (hoveredNode === 'Receita' && node.id === 'Patrimônio') || (hoveredNode === 'Patrimônio' && node.id === 'Receita') ? 1 : 0.3 }}
                            >
                                <rect
                                    x={node.x}
                                    y={node.y}
                                    width={nodeWidth}
                                    height={node.height}
                                    fill={node.color}
                                    rx={4}
                                />

                                {/* Labels */}
                                <text
                                    x={node.x === padding ? node.x + nodeWidth + 10 : node.x === width - padding - nodeWidth ? node.x - 10 : node.x + nodeWidth / 2}
                                    y={node.y + node.height / 2}
                                    dy="0.35em"
                                    textAnchor={node.x === padding ? "start" : node.x === width - padding - nodeWidth ? "end" : "middle"}
                                    fill="#fff"
                                    fontSize="12px"
                                    fontWeight="600"
                                    className="pointer-events-none drop-shadow-md"
                                >
                                    {node.x !== (width / 2 - nodeWidth / 2) && node.id}
                                </text>

                                {/* Value text below label */}
                                <text
                                    x={node.x === padding ? node.x + nodeWidth + 10 : node.x === width - padding - nodeWidth ? node.x - 10 : node.x + nodeWidth / 2}
                                    y={(node.y + node.height / 2) + 16}
                                    dy="0.35em"
                                    textAnchor={node.x === padding ? "start" : node.x === width - padding - nodeWidth ? "end" : "middle"}
                                    fill="rgba(255,255,255,0.6)"
                                    fontSize="10px"
                                    className="pointer-events-none"
                                >
                                    {node.x !== (width / 2 - nodeWidth / 2) && `R$ ${node.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        </div>
    )
}
