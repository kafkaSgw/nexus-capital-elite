'use client'

import { Calculator, AlertCircle, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface TaxCalculatorProps {
  transactions: any[]
  assets: any[]
}

export default function TaxCalculator({ transactions, assets }: TaxCalculatorProps) {
  // Calcular receitas
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  // Calcular ganho de capital em investimentos
  const capitalGains = assets.reduce((sum, asset) => {
    const invested = asset.quantidade * asset.preco_medio
    const current = asset.quantidade * asset.preco_atual
    const gain = current - invested
    return sum + (gain > 0 ? gain : 0)
  }, 0)

  // Tabela IR Pessoa Física 2024
  const calculateIR = (income: number) => {
    if (income <= 2259.20) return { tax: 0, rate: 0 }
    if (income <= 2826.65) return { tax: income * 0.075 - 169.44, rate: 7.5 }
    if (income <= 3751.05) return { tax: income * 0.15 - 381.44, rate: 15 }
    if (income <= 4664.68) return { tax: income * 0.225 - 662.77, rate: 22.5 }
    return { tax: income * 0.275 - 896.00, rate: 27.5 }
  }

  // Calcular IR mensal estimado
  const monthlyIncome = totalIncome / 12
  const irMensal = calculateIR(monthlyIncome)

  // IR sobre ganho de capital (15%)
  const irCapitalGains = capitalGains * 0.15

  // INSS (simplificado - até R$ 7.507,49 = 14%)
  const inss = Math.min(monthlyIncome * 0.14, 7507.49 * 0.14)

  // Total de impostos estimado
  const totalTaxes = (irMensal.tax * 12) + irCapitalGains + (inss * 12)

  // Cálculo para MEI (se aplicável)
  const meiMonthly = 70.60 // Valor fixo MEI 2024

  return (
    <div className="card-premium">
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-yellow to-accent-red rounded-xl flex items-center justify-center shadow-glow">
            <Calculator className="w-5 h-5 text-dark-bg" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Calculadora de Impostos</h3>
            <p className="text-sm text-gray-400">Estimativa anual - Pessoa Física</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Alerta */}
        <div className="bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-accent-yellow flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-300">
                <span className="font-bold text-accent-yellow">Atenção:</span> Estes são cálculos 
                estimados e simplificados. Para declaração oficial, consulte um contador certificado.
              </p>
            </div>
          </div>
        </div>

        {/* Base de Cálculo */}
        <div className="bg-dark-card rounded-lg p-5">
          <h4 className="font-bold text-white mb-4">Base de Cálculo</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Receita Anual</p>
              <p className="text-xl font-bold text-white number-font">
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ~{formatCurrency(monthlyIncome)}/mês
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Ganho de Capital (Investimentos)</p>
              <p className="text-xl font-bold text-accent-green number-font">
                {formatCurrency(capitalGains)}
              </p>
            </div>
          </div>
        </div>

        {/* Impostos Detalhados */}
        <div className="space-y-4">
          <h4 className="font-bold text-white">Impostos Estimados</h4>

          {/* IR sobre Receitas */}
          <div className="bg-dark-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-white">IR Pessoa Física</p>
                <p className="text-xs text-gray-400">
                  Alíquota: {irMensal.rate}% • Base mensal: {formatCurrency(monthlyIncome)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Mensal</p>
                <p className="font-bold text-accent-red number-font">
                  {formatCurrency(irMensal.tax)}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-dark-border flex items-center justify-between">
              <p className="text-xs text-gray-400">Total Anual</p>
              <p className="font-bold text-accent-red number-font">
                {formatCurrency(irMensal.tax * 12)}
              </p>
            </div>
          </div>

          {/* IR sobre Ganho de Capital */}
          <div className="bg-dark-card rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">IR sobre Ganho de Capital</p>
                <p className="text-xs text-gray-400">Alíquota: 15% sobre lucros</p>
              </div>
              <p className="font-bold text-accent-red number-font">
                {formatCurrency(irCapitalGains)}
              </p>
            </div>
          </div>

          {/* INSS */}
          <div className="bg-dark-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-white">INSS (Autônomo)</p>
                <p className="text-xs text-gray-400">14% sobre receitas (teto: R$ 7.507,49)</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Mensal</p>
                <p className="font-bold text-accent-red number-font">
                  {formatCurrency(inss)}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-dark-border flex items-center justify-between">
              <p className="text-xs text-gray-400">Total Anual</p>
              <p className="font-bold text-accent-red number-font">
                {formatCurrency(inss * 12)}
              </p>
            </div>
          </div>
        </div>

        {/* Total Geral */}
        <div className="bg-gradient-to-br from-accent-red/20 to-accent-red/10 border-2 border-accent-red/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300 mb-1">Total de Impostos Estimado</p>
              <p className="text-xs text-gray-400">IR + Ganho Capital + INSS</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-accent-red number-font">
                {formatCurrency(totalTaxes)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ~{formatCurrency(totalTaxes / 12)}/mês
              </p>
            </div>
          </div>
        </div>

        {/* Comparação MEI */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            Economia com MEI
          </h4>
          <p className="text-sm text-gray-300 mb-3">
            Como MEI você pagaria apenas <span className="font-bold text-primary">
            {formatCurrency(meiMonthly)}/mês</span> (R$ 847,20/ano)
          </p>
          <div className="flex items-center justify-between p-3 bg-dark-card rounded-lg">
            <span className="text-sm text-gray-300">Economia Anual</span>
            <span className="text-xl font-bold text-accent-green number-font">
              {formatCurrency(totalTaxes - (meiMonthly * 12))}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            *MEI é válido para faturamento até R$ 81.000/ano
          </p>
        </div>

        {/* Dicas */}
        <div className="bg-dark-card rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">💡 Dicas para Reduzir Impostos</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Considere abrir MEI se faturar até R$ 81k/ano</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Declare despesas dedutíveis (saúde, educação, previdência)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Mantenha investimentos por +1 ano (menor alíquota)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Consulte um contador para otimização fiscal</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
