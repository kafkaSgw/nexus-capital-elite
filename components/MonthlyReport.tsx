'use client'

import { useState } from 'react'
import { FileDown, Loader2, FileText } from 'lucide-react'
import { getTransactions, getAssets, getFinancialGoals } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function MonthlyReport() {
    const [generating, setGenerating] = useState(false)

    const generatePDF = async () => {
        setGenerating(true)
        try {
            const [transactions, assets, goals] = await Promise.all([
                getTransactions(), getAssets(), getFinancialGoals()
            ])

            // Dynamic import to avoid SSR issues
            const { default: jsPDF } = await import('jspdf')
            const autoTableModule = await import('jspdf-autotable')
            const autoTable = autoTableModule.default

            const doc = new jsPDF()
            const now = new Date()
            const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

            // Filter current month transactions
            const monthTxs = transactions.filter(t => {
                const d = new Date(t.created_at)
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            })

            const totalIncome = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
            const totalExpense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)
            const balance = totalIncome - totalExpense
            const totalInvested = assets.reduce((s, a) => s + a.preco_medio * a.quantidade, 0)
            const totalCurrentValue = assets.reduce((s, a) => s + a.preco_atual * a.quantidade, 0)

            // Header
            doc.setFillColor(10, 16, 30)
            doc.rect(0, 0, 210, 40, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(22)
            doc.setFont('helvetica', 'bold')
            doc.text('NEXUS CAPITAL ELITE', 15, 20)
            doc.setFontSize(11)
            doc.setFont('helvetica', 'normal')
            doc.text(`Relatório Mensal — ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`, 15, 30)

            let yPos = 55

            // Summary Cards
            doc.setTextColor(60, 60, 60)
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text('Resumo Financeiro', 15, yPos)
            yPos += 10

            const summaryData = [
                ['Receitas', formatCurrency(totalIncome)],
                ['Despesas', formatCurrency(totalExpense)],
                ['Saldo', formatCurrency(balance)],
                ['Patrimônio em Ativos', formatCurrency(totalCurrentValue)],
                ['Patrimônio Total', formatCurrency(balance + totalCurrentValue)],
            ]

            autoTable(doc, {
                startY: yPos,
                head: [['Indicador', 'Valor']],
                body: summaryData,
                theme: 'striped',
                headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10, fontStyle: 'bold' },
                bodyStyles: { fontSize: 10 },
                margin: { left: 15, right: 15 },
            })

            yPos = (doc as any).lastAutoTable.finalY + 15

            // Top Categories
            const categoryMap = new Map<string, number>()
            monthTxs.filter(t => t.type === 'expense').forEach(t => {
                categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + Math.abs(t.amount))
            })
            const topCategories = [...categoryMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

            if (topCategories.length > 0) {
                doc.setFontSize(14)
                doc.setFont('helvetica', 'bold')
                doc.text('Top 5 Categorias de Gasto', 15, yPos)
                yPos += 10

                autoTable(doc, {
                    startY: yPos,
                    head: [['Categoria', 'Valor Gasto', '% do Total']],
                    body: topCategories.map(([cat, val]) => [
                        cat,
                        formatCurrency(val),
                        `${totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(1) : '0'}%`
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [239, 68, 68], textColor: 255, fontSize: 10, fontStyle: 'bold' },
                    bodyStyles: { fontSize: 10 },
                    margin: { left: 15, right: 15 },
                })

                yPos = (doc as any).lastAutoTable.finalY + 15
            }

            // Investments
            if (assets.length > 0) {
                if (yPos > 230) { doc.addPage(); yPos = 20 }

                doc.setFontSize(14)
                doc.setFont('helvetica', 'bold')
                doc.text('Carteira de Investimentos', 15, yPos)
                yPos += 10

                autoTable(doc, {
                    startY: yPos,
                    head: [['Ativo', 'Classe', 'Qtd', 'Preço Médio', 'Preço Atual', 'Resultado']],
                    body: assets.map(a => {
                        const result = (a.preco_atual - a.preco_medio) * a.quantidade
                        return [
                            a.ticker,
                            a.classe,
                            a.quantidade.toString(),
                            formatCurrency(a.preco_medio),
                            formatCurrency(a.preco_atual),
                            formatCurrency(result),
                        ]
                    }),
                    theme: 'striped',
                    headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 9, fontStyle: 'bold' },
                    bodyStyles: { fontSize: 9 },
                    margin: { left: 15, right: 15 },
                })

                yPos = (doc as any).lastAutoTable.finalY + 15
            }

            // Goals
            if (goals.length > 0) {
                if (yPos > 230) { doc.addPage(); yPos = 20 }

                doc.setFontSize(14)
                doc.setFont('helvetica', 'bold')
                doc.text('Metas Financeiras', 15, yPos)
                yPos += 10

                autoTable(doc, {
                    startY: yPos,
                    head: [['Meta', 'Progresso', 'Atual', 'Alvo', 'Prazo']],
                    body: goals.map(g => [
                        g.title,
                        `${g.target_amount > 0 ? ((g.current_amount / g.target_amount) * 100).toFixed(0) : '0'}%`,
                        formatCurrency(g.current_amount),
                        formatCurrency(g.target_amount),
                        new Date(g.deadline).toLocaleDateString('pt-BR'),
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 10, fontStyle: 'bold' },
                    bodyStyles: { fontSize: 10 },
                    margin: { left: 15, right: 15 },
                })
            }

            // Footer
            const pageCount = doc.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(8)
                doc.setTextColor(150, 150, 150)
                doc.text(
                    `Nexus Capital Elite • Gerado em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')} • Página ${i}/${pageCount}`,
                    105, 290, { align: 'center' }
                )
            }

            doc.save(`nexus-capital-relatorio-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.pdf`)
            toast.success('Relatório PDF gerado com sucesso!')
        } catch (err) {
            console.error('Erro ao gerar PDF:', err)
            toast.error('Erro ao gerar relatório')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <button
            onClick={generatePDF}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary/20 to-accent-indigo/20 text-primary hover:from-primary/30 hover:to-accent-indigo/30 border border-primary/20 hover:border-primary/40 transition-all text-sm font-medium disabled:opacity-50"
        >
            {generating ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando...
                </>
            ) : (
                <>
                    <FileDown className="w-4 h-4" />
                    Relatório Mensal PDF
                </>
            )}
        </button>
    )
}
