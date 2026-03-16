'use client'

import { useState } from 'react'
import { Download, FileText, Calendar } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ExportReportProps {
  transactions: any[]
  assets: any[]
  totalWealth: number
  totalIncome: number
  totalExpense: number
}

export default function ExportReport({ 
  transactions, 
  assets, 
  totalWealth,
  totalIncome,
  totalExpense 
}: ExportReportProps) {
  const [exporting, setExporting] = useState(false)

  const generatePDF = async () => {
    setExporting(true)
    
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          assets,
          summary: {
            totalWealth,
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense
          },
          date: new Date().toISOString()
        })
      })

      if (!response.ok) throw new Error('Erro ao gerar PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Nexus-Capital-Relatorio-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      alert('Erro ao exportar relatório. Tente novamente.')
    } finally {
      setExporting(false)
    }
  }

  const generateCSV = () => {
    const csvContent = [
      ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor'].join(','),
      ...transactions.map(t => [
        formatDate(t.created_at),
        `"${t.description}"`,
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.category,
        t.amount
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Nexus-Capital-Transacoes-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="card-premium">
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-primary rounded-xl flex items-center justify-center shadow-glow">
            <FileText className="w-5 h-5 text-dark-bg" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Exportar Relatórios</h3>
            <p className="text-sm text-gray-400">Baixe seus dados em PDF ou CSV</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Preview do Relatório */}
        <div className="bg-dark-card rounded-lg p-4 mb-6 border border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-300">
              Relatório do Período: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Patrimônio</p>
              <p className="font-bold text-white number-font">{formatCurrency(totalWealth)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Receitas</p>
              <p className="font-bold text-accent-green number-font">{formatCurrency(totalIncome)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Despesas</p>
              <p className="font-bold text-accent-red number-font">{formatCurrency(totalExpense)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Saldo</p>
              <p className={`font-bold number-font ${totalIncome - totalExpense >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {formatCurrency(totalIncome - totalExpense)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-dark-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Transações:</span>
              <span className="text-white font-medium">{transactions.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-400">Ativos:</span>
              <span className="text-white font-medium">{assets.length}</span>
            </div>
          </div>
        </div>

        {/* Botões de Export */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={generatePDF}
            disabled={exporting}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            {exporting ? 'Gerando PDF...' : 'Exportar PDF Completo'}
          </button>

          <button
            onClick={generateCSV}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Exportar CSV (Excel)
          </button>
        </div>

        <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-gray-300">
            <span className="font-bold text-primary">💡 Dica:</span> Use o PDF para enviar ao seu contador 
            ou o CSV para análises personalizadas no Excel!
          </p>
        </div>
      </div>
    </div>
  )
}
