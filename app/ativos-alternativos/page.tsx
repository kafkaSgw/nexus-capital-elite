'use client'

import { useState } from 'react'
import { Building2, Watch, Car, TrendingUp, Plus, Diamond, ShieldCheck } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const mockAssets = [
  {
    id: 1,
    type: 'real_estate',
    name: 'Cobertura Duplex - Jurerê Internacional',
    purchasePrice: 4500000,
    currentValue: 5800000,
    purchaseDate: '2021-05-15',
    icon: Building2,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    id: 2,
    type: 'watches',
    name: 'Rolex Daytona Platinum Ice Blue',
    purchasePrice: 480000,
    currentValue: 620000,
    purchaseDate: '2022-11-10',
    icon: Watch,
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/10'
  },
  {
    id: 3,
    type: 'vehicles',
    name: 'Porsche 911 GT3 RS',
    purchasePrice: 2100000,
    currentValue: 2400000,
    purchaseDate: '2023-02-20',
    icon: Car,
    color: 'text-accent-red',
    bg: 'bg-accent-red/10'
  },
  {
    id: 4,
    type: 'art',
    name: 'Obras de Arte - Coleção Moderna Privada',
    purchasePrice: 1200000,
    currentValue: 1850000,
    purchaseDate: '2020-08-05',
    icon: Diamond,
    color: 'text-accent-yellow',
    bg: 'bg-accent-yellow/10'
  }
]

export default function AtivosAlternativos() {
  const [activeTab, setActiveTab] = useState<'all' | 'real_estate' | 'watches' | 'vehicles' | 'art'>('all')

  const filteredAssets = mockAssets.filter(asset => activeTab === 'all' || asset.type === activeTab)

  const totalPurchase = mockAssets.reduce((sum, item) => sum + item.purchasePrice, 0)
  const totalCurrent = mockAssets.reduce((sum, item) => sum + item.currentValue, 0)
  const totalAppreciation = totalCurrent - totalPurchase
  const appreciationPercentage = (totalAppreciation / totalPurchase) * 100

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            Ativos Alternativos
            <span className="px-3 py-1 bg-accent-purple/20 text-accent-purple text-sm rounded-full flex items-center gap-1 font-medium">
              <ShieldCheck className="w-4 h-4" /> Modalidade Elite
            </span>
          </h1>
          <p className="text-gray-400">
            Gestão de patrimônio físico, imóveis, veículos de luxo e colecionáveis.
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus className="w-4 h-4" />
          Registrar Ativo
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-premium p-6 border-t-2 border-t-primary">
          <p className="text-sm text-gray-400 mb-1">Valor Total de Mercado</p>
          <p className="text-3xl font-bold text-white number-font">{formatCurrency(totalCurrent)}</p>
          <div className="flex items-center gap-2 mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-accent-green" />
            <span className="text-accent-green font-medium">+{appreciationPercentage.toFixed(1)}%</span>
            <span className="text-gray-500">desde a aquisição</span>
          </div>
        </div>

        <div className="card-premium p-6">
          <p className="text-sm text-gray-400 mb-1">Custo de Aquisição</p>
          <p className="text-3xl font-bold text-gray-300 number-font">{formatCurrency(totalPurchase)}</p>
          <div className="mt-4 text-sm text-gray-500">
            Capital original investido
          </div>
        </div>

        <div className="card-premium p-6 bg-gradient-to-br from-accent-green/10 to-transparent border border-accent-green/20">
          <p className="text-sm text-gray-400 mb-1">Valorização Total</p>
          <p className="text-3xl font-bold text-accent-green number-font">+{formatCurrency(totalAppreciation)}</p>
          <div className="mt-4 text-sm text-gray-400">
            Ganho de capital não realizado
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 no-scrollbar">
        {[
          { id: 'all', label: 'Todos os Ativos' },
          { id: 'real_estate', label: 'Imóveis' },
          { id: 'vehicles', label: 'Veículos' },
          { id: 'watches', label: 'Relógios & Joias' },
          { id: 'art', label: 'Arte & Coleções' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-dark-card text-gray-400 hover:text-white hover:bg-dark-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAssets.map(asset => {
          const appreciation = asset.currentValue - asset.purchasePrice
          const percent = (appreciation / asset.purchasePrice) * 100
          const Icon = asset.icon

          return (
            <div key={asset.id} className="card-premium p-6 hover:border-dark-border/80 transition-all group">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${asset.bg}`}>
                    <Icon className={`w-6 h-6 ${asset.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                      {asset.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Adquirido em {new Date(asset.purchaseDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-border/50">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Custo de Aquisição</p>
                  <p className="text-lg font-semibold text-gray-300 number-font">
                    {formatCurrency(asset.purchasePrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valor de Mercado</p>
                  <p className="text-lg font-bold text-white number-font">
                    {formatCurrency(asset.currentValue)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-dark-border/50 flex items-center justify-between">
                <span className="text-sm text-gray-400">Valorização Estimada</span>
                <div className="flex items-center gap-2">
                  <span className="text-accent-green font-bold number-font text-sm">
                    +{formatCurrency(appreciation)}
                  </span>
                  <span className="bg-accent-green/10 text-accent-green px-2 py-1 rounded text-xs font-bold">
                    +{percent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
