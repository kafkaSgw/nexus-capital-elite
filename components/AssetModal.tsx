'use client'

import { useState, useEffect } from 'react'
import { X, TrendingUp, Search, RefreshCw } from 'lucide-react'
import { createAsset } from '@/lib/supabase'
import axios from 'axios'
import Image from 'next/image'

const POPULAR_ASSETS = [
  { ticker: 'BTC', name: 'Bitcoin', classe: 'Crypto', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: '₿' },
  { ticker: 'ETH', name: 'Ethereum', classe: 'Crypto', color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: 'Ξ' },
  { ticker: 'SOL', name: 'Solana', classe: 'Crypto', color: 'text-cyan-400', bg: 'bg-cyan-400/10', icon: '◎' },
  { ticker: 'NU', name: 'Nubank', classe: 'Stocks', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: 'N' },
  { ticker: 'PETR4', name: 'Petrobras', classe: 'Stocks', color: 'text-green-500', bg: 'bg-green-500/10', icon: '⛽' },
  { ticker: 'AAPL', name: 'Apple', classe: 'Stocks', color: 'text-gray-300', bg: 'bg-gray-500/10', icon: '' },
]

const ALL_ASSETS = [
  // ============ CRYPTO (30+) ============
  { ticker: 'BTC', name: 'Bitcoin', classe: 'Crypto', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: '₿' },
  { ticker: 'ETH', name: 'Ethereum', classe: 'Crypto', color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: 'Ξ' },
  { ticker: 'SOL', name: 'Solana', classe: 'Crypto', color: 'text-cyan-400', bg: 'bg-cyan-400/10', icon: '◎' },
  { ticker: 'BNB', name: 'BNB', classe: 'Crypto', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: 'B' },
  { ticker: 'XRP', name: 'XRP', classe: 'Crypto', color: 'text-gray-300', bg: 'bg-gray-500/10', icon: '✕' },
  { ticker: 'ADA', name: 'Cardano', classe: 'Crypto', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: '₳' },
  { ticker: 'AVAX', name: 'Avalanche', classe: 'Crypto', color: 'text-red-500', bg: 'bg-red-500/10', icon: '🔺' },
  { ticker: 'DOGE', name: 'Dogecoin', classe: 'Crypto', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: 'Ð' },
  { ticker: 'DOT', name: 'Polkadot', classe: 'Crypto', color: 'text-pink-500', bg: 'bg-pink-500/10', icon: '●' },
  { ticker: 'LINK', name: 'Chainlink', classe: 'Crypto', color: 'text-blue-600', bg: 'bg-blue-600/10', icon: '🔗' },
  { ticker: 'MATIC', name: 'Polygon', classe: 'Crypto', color: 'text-purple-600', bg: 'bg-purple-600/10', icon: '⬡' },
  { ticker: 'USDT', name: 'Tether', classe: 'Crypto', color: 'text-teal-500', bg: 'bg-teal-500/10', icon: '₮' },
  { ticker: 'USDC', name: 'USD Coin', classe: 'Crypto', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: '$' },
  { ticker: 'SHIB', name: 'Shiba Inu', classe: 'Crypto', color: 'text-orange-400', bg: 'bg-orange-400/10', icon: '🐕' },
  { ticker: 'UNI', name: 'Uniswap', classe: 'Crypto', color: 'text-pink-400', bg: 'bg-pink-400/10', icon: '🦄' },
  { ticker: 'ATOM', name: 'Cosmos', classe: 'Crypto', color: 'text-indigo-400', bg: 'bg-indigo-400/10', icon: '⚛' },
  { ticker: 'LTC', name: 'Litecoin', classe: 'Crypto', color: 'text-gray-400', bg: 'bg-gray-400/10', icon: 'Ł' },
  { ticker: 'FTM', name: 'Fantom', classe: 'Crypto', color: 'text-blue-300', bg: 'bg-blue-300/10', icon: '👻' },
  { ticker: 'NEAR', name: 'NEAR Protocol', classe: 'Crypto', color: 'text-green-400', bg: 'bg-green-400/10', icon: 'Ⓝ' },
  { ticker: 'APE', name: 'ApeCoin', classe: 'Crypto', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: '🦍' },
  { ticker: 'ALGO', name: 'Algorand', classe: 'Crypto', color: 'text-gray-300', bg: 'bg-gray-300/10', icon: 'A' },
  { ticker: 'FIL', name: 'Filecoin', classe: 'Crypto', color: 'text-cyan-500', bg: 'bg-cyan-500/10', icon: 'F' },
  { ticker: 'AAVE', name: 'Aave', classe: 'Crypto', color: 'text-purple-400', bg: 'bg-purple-400/10', icon: '👻' },
  { ticker: 'CRO', name: 'Cronos', classe: 'Crypto', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: 'C' },
  { ticker: 'ARB', name: 'Arbitrum', classe: 'Crypto', color: 'text-blue-300', bg: 'bg-blue-300/10', icon: '🔵' },
  { ticker: 'OP', name: 'Optimism', classe: 'Crypto', color: 'text-red-400', bg: 'bg-red-400/10', icon: '🔴' },
  { ticker: 'SUI', name: 'Sui', classe: 'Crypto', color: 'text-cyan-300', bg: 'bg-cyan-300/10', icon: 'S' },
  { ticker: 'SEI', name: 'Sei', classe: 'Crypto', color: 'text-red-300', bg: 'bg-red-300/10', icon: 'S' },
  { ticker: 'RENDER', name: 'Render', classe: 'Crypto', color: 'text-teal-400', bg: 'bg-teal-400/10', icon: 'R' },
  { ticker: 'INJ', name: 'Injective', classe: 'Crypto', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: 'I' },
  { ticker: 'TIA', name: 'Celestia', classe: 'Crypto', color: 'text-purple-300', bg: 'bg-purple-300/10', icon: '☀' },
  { ticker: 'JUP', name: 'Jupiter', classe: 'Crypto', color: 'text-green-300', bg: 'bg-green-300/10', icon: 'J' },
  // ============ AÇÕES B3 — IBOVESPA TOP (70+) ============
  { ticker: 'PETR4', name: 'Petrobras PN', classe: 'Stocks', color: 'text-green-500', bg: 'bg-green-500/10', icon: '⛽' },
  { ticker: 'PETR3', name: 'Petrobras ON', classe: 'Stocks', color: 'text-green-600', bg: 'bg-green-600/10', icon: '⛽' },
  { ticker: 'VALE3', name: 'Vale', classe: 'Stocks', color: 'text-green-500', bg: 'bg-green-500/10', icon: '⛏️' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco', classe: 'Stocks', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: '🏦' },
  { ticker: 'BBDC4', name: 'Bradesco PN', classe: 'Stocks', color: 'text-red-500', bg: 'bg-red-500/10', icon: '🏦' },
  { ticker: 'BBAS3', name: 'Banco do Brasil', classe: 'Stocks', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: '🏦' },
  { ticker: 'B3SA3', name: 'B3 (Bolsa)', classe: 'Stocks', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: '📊' },
  { ticker: 'ABEV3', name: 'Ambev', classe: 'Stocks', color: 'text-yellow-600', bg: 'bg-yellow-600/10', icon: '🍺' },
  { ticker: 'WEGE3', name: 'WEG', classe: 'Stocks', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: '⚡' },
  { ticker: 'RENT3', name: 'Localiza', classe: 'Stocks', color: 'text-green-400', bg: 'bg-green-400/10', icon: '🚗' },
  { ticker: 'SUZB3', name: 'Suzano', classe: 'Stocks', color: 'text-green-600', bg: 'bg-green-600/10', icon: '🌲' },
  { ticker: 'JBSS3', name: 'JBS', classe: 'Stocks', color: 'text-red-400', bg: 'bg-red-400/10', icon: '🥩' },
  { ticker: 'ELET3', name: 'Eletrobras ON', classe: 'Stocks', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: '⚡' },
  { ticker: 'ELET6', name: 'Eletrobras PNB', classe: 'Stocks', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: '⚡' },
  { ticker: 'EQTL3', name: 'Equatorial', classe: 'Stocks', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: '💡' },
  { ticker: 'RAIL3', name: 'Rumo', classe: 'Stocks', color: 'text-green-500', bg: 'bg-green-500/10', icon: '🚂' },
  { ticker: 'RDOR3', name: 'Rede D\'Or', classe: 'Stocks', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: '🏥' },
  { ticker: 'HAPV3', name: 'Hapvida', classe: 'Stocks', color: 'text-green-400', bg: 'bg-green-400/10', icon: '🏥' },
  { ticker: 'PRIO3', name: 'PRIO (PetroRio)', classe: 'Stocks', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: '🛢️' },
  { ticker: 'VBBR3', name: 'Vibra Energia', classe: 'Stocks', color: 'text-green-500', bg: 'bg-green-500/10', icon: '⛽' },
  { ticker: 'RADL3', name: 'Raia Drogasil', classe: 'Stocks', color: 'text-red-500', bg: 'bg-red-500/10', icon: '💊' },
  { ticker: 'MGLU3', name: 'Magazine Luiza', classe: 'Stocks', color: 'text-blue-600', bg: 'bg-blue-600/10', icon: '🛒' },
  { ticker: 'LREN3', name: 'Lojas Renner', classe: 'Stocks', color: 'text-red-400', bg: 'bg-red-400/10', icon: '👗' },
  { ticker: 'BBSE3', name: 'BB Seguridade', classe: 'Stocks', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: '🛡️' },
  { ticker: 'VIVT3', name: 'Telefônica Vivo', classe: 'Stocks', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: '📱' },
  { ticker: 'CSAN3', name: 'Cosan', classe: 'Stocks', color: 'text-green-500', bg: 'bg-green-500/10', icon: '🌾' },
  { ticker: 'SBSP3', name: 'Sabesp', classe: 'Stocks', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: '💧' },
  { ticker: 'TOTS3', name: 'Totvs', classe: 'Stocks', color: 'text-green-400', bg: 'bg-green-400/10', icon: '💻' },
  { ticker: 'ENEV3', name: 'Eneva', classe: 'Stocks', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: '⚡' },
  { ticker: 'HYPE3', name: 'Hypera', classe: 'Stocks', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: '💊' },
  { ticker: 'CMIG4', name: 'Cemig PN', classe: 'Stocks', color: 'text-green-500', bg: 'bg-green-500/10', icon: '⚡' },
  { ticker: 'TAEE11', name: 'Taesa', classe: 'Stocks', color: 'text-blue-300', bg: 'bg-blue-300/10', icon: '🔌' },
  { ticker: 'CPLE6', name: 'Copel PNB', classe: 'Stocks', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: '⚡' },
  { ticker: 'KLBN11', name: 'Klabin', classe: 'Stocks', color: 'text-green-500', bg: 'bg-green-500/10', icon: '📦' },
  { ticker: 'GGBR4', name: 'Gerdau PN', classe: 'Stocks', color: 'text-gray-400', bg: 'bg-gray-400/10', icon: '🔩' },
  { ticker: 'CSNA3', name: 'CSN', classe: 'Stocks', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: '🔩' },
  { ticker: 'GOAU4', name: 'Metalúrgica Gerdau', classe: 'Stocks', color: 'text-gray-500', bg: 'bg-gray-500/10', icon: '🏭' },
  { ticker: 'CYRE3', name: 'Cyrela', classe: 'Stocks', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: '🏗️' },
  { ticker: 'MRVE3', name: 'MRV', classe: 'Stocks', color: 'text-green-400', bg: 'bg-green-400/10', icon: '🏠' },
  { ticker: 'EMBR3', name: 'Embraer', classe: 'Stocks', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: '✈️' },
  { ticker: 'USIM5', name: 'Usiminas PNA', classe: 'Stocks', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: '🔩' },
  { ticker: 'BPAC11', name: 'BTG Pactual', classe: 'Stocks', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: '🏦' },
  { ticker: 'ITSA4', name: 'Itaúsa PN', classe: 'Stocks', color: 'text-orange-400', bg: 'bg-orange-400/10', icon: '🏦' },
  { ticker: 'SANB11', name: 'Santander', classe: 'Stocks', color: 'text-red-500', bg: 'bg-red-500/10', icon: '🏦' },
  { ticker: 'MRFG3', name: 'Marfrig', classe: 'Stocks', color: 'text-green-500', bg: 'bg-green-500/10', icon: '🥩' },
  { ticker: 'BRFS3', name: 'BRF', classe: 'Stocks', color: 'text-green-400', bg: 'bg-green-400/10', icon: '🍗' },
  { ticker: 'ASAI3', name: 'Assaí', classe: 'Stocks', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: '🛒' },
  { ticker: 'CRFB3', name: 'Carrefour BR', classe: 'Stocks', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: '🛒' },
  { ticker: 'COGN3', name: 'Cogna', classe: 'Stocks', color: 'text-red-400', bg: 'bg-red-400/10', icon: '📚' },
  { ticker: 'YDUQ3', name: 'Yduqs', classe: 'Stocks', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: '📚' },
  { ticker: 'LWSA3', name: 'Locaweb', classe: 'Stocks', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: '🌐' },
  { ticker: 'CASH3', name: 'Méliuz', classe: 'Stocks', color: 'text-pink-500', bg: 'bg-pink-500/10', icon: '💰' },
  { ticker: 'IRBR3', name: 'IRB Brasil', classe: 'Stocks', color: 'text-green-400', bg: 'bg-green-400/10', icon: '🛡️' },
  { ticker: 'AZUL4', name: 'Azul', classe: 'Stocks', color: 'text-blue-600', bg: 'bg-blue-600/10', icon: '✈️' },
  { ticker: 'GOLL4', name: 'Gol', classe: 'Stocks', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: '✈️' },
  { ticker: 'CVCB3', name: 'CVC Brasil', classe: 'Stocks', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: '🏖️' },
  // ============ AÇÕES INTERNACIONAIS / BDRs ============
  { ticker: 'AAPL', name: 'Apple', classe: 'Stocks', color: 'text-gray-300', bg: 'bg-gray-500/10', icon: '' },
  { ticker: 'MSFT', name: 'Microsoft', classe: 'Stocks', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: '⊞' },
  { ticker: 'GOOGL', name: 'Google', classe: 'Stocks', color: 'text-red-500', bg: 'bg-red-500/10', icon: 'G' },
  { ticker: 'AMZN', name: 'Amazon', classe: 'Stocks', color: 'text-orange-400', bg: 'bg-orange-400/10', icon: 'A' },
  { ticker: 'TSLA', name: 'Tesla', classe: 'Stocks', color: 'text-red-600', bg: 'bg-red-600/10', icon: 'T' },
  { ticker: 'META', name: 'Meta', classe: 'Stocks', color: 'text-blue-600', bg: 'bg-blue-600/10', icon: 'M' },
  { ticker: 'NVDA', name: 'NVIDIA', classe: 'Stocks', color: 'text-green-500', bg: 'bg-green-500/10', icon: '🟩' },
  { ticker: 'NU', name: 'Nubank', classe: 'Stocks', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: 'N' },
  { ticker: 'NFLX', name: 'Netflix', classe: 'Stocks', color: 'text-red-500', bg: 'bg-red-500/10', icon: 'N' },
  { ticker: 'DIS', name: 'Disney', classe: 'Stocks', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: '🏰' },
  { ticker: 'AMD', name: 'AMD', classe: 'Stocks', color: 'text-red-400', bg: 'bg-red-400/10', icon: 'A' },
  { ticker: 'INTC', name: 'Intel', classe: 'Stocks', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: 'I' },
]

interface AssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AssetModal({ isOpen, onClose, onSuccess }: AssetModalProps) {
  const [formData, setFormData] = useState({
    ticker: '',
    classe: 'Stocks' as 'Stocks' | 'Crypto',
    quantidade: '',
    preco_medio: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [showAllAssets, setShowAllAssets] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  if (!isOpen) return null

  const filteredAllAssets = ALL_ASSETS.filter(a =>
    a.classe === formData.classe &&
    (a.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleFetchPrice = async (tickerToFetch?: string, classToFetch?: string) => {
    const targetTicker = tickerToFetch || formData.ticker
    const targetClass = classToFetch || formData.classe

    if (!targetTicker) {
      setError('Digite o ticker primeiro')
      return
    }

    setFetchingPrice(true)
    setError('')

    try {
      const response = await axios.post('/api/cotacoes', {
        ticker: targetTicker.toUpperCase(),
        classe: targetClass
      })

      setFormData(prev => ({ ...prev, preco_medio: response.data.preco.toFixed(2) }))
    } catch (err) {
      console.error('Erro ao buscar cotação:', err)
      setError(`Não foi possível buscar o preço de ${targetTicker}.`)
    } finally {
      setFetchingPrice(false)
    }
  }

  const handleSelectPopular = (asset: typeof ALL_ASSETS[0]) => {
    setFormData(prev => ({
      ...prev,
      ticker: asset.ticker,
      classe: asset.classe as 'Stocks' | 'Crypto'
    }))
    setShowAllAssets(false)
    setSearchTerm('')
    // Auto-fetch price when an asset is clicked
    handleFetchPrice(asset.ticker, asset.classe)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.ticker.trim()) {
        setError('Selecione ou digite um ticker')
        setLoading(false)
        return
      }

      const quantidade = parseFloat(formData.quantidade)
      const preco_medio = parseFloat(formData.preco_medio)

      if (isNaN(quantidade) || quantidade <= 0) {
        setError('Quantidade inválida')
        setLoading(false)
        return
      }

      if (isNaN(preco_medio) || preco_medio <= 0) {
        setError('Preço médio inválido')
        setLoading(false)
        return
      }

      await createAsset({
        ticker: formData.ticker.toUpperCase(),
        classe: formData.classe,
        quantidade,
        preco_medio,
        preco_atual: preco_medio
      })

      // Reset form
      setFormData({
        ticker: '',
        classe: 'Stocks',
        quantidade: '',
        preco_medio: ''
      })

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Erro ao criar ativo:', err)
      setError('Erro ao salvar ativo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card-premium w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-xl font-bold text-white">
            {showAllAssets ? 'Selecionar Ativo' : 'Novo Ativo'}
          </h2>
          <button
            onClick={() => {
              if (showAllAssets) {
                setShowAllAssets(false)
                setSearchTerm('')
              } else {
                onClose()
              }
            }}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {showAllAssets ? (
          <div className="p-6 h-[500px] flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por nome ou ticker (Ex: ADA, Tesla)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-premium pl-10 w-full"
                autoFocus
              />
            </div>

            <div className="flex bg-dark-bg rounded-xl p-1 border border-dark-border mb-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, classe: 'Stocks' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.classe === 'Stocks' ? 'bg-primary/20 text-primary' : 'text-gray-500 hover:text-white'}`}
              >
                Ações & BDRs
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, classe: 'Crypto' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.classe === 'Crypto' ? 'bg-accent-purple/20 text-accent-purple' : 'text-gray-500 hover:text-white'}`}
              >
                Criptomoedas
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {filteredAllAssets.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">Nenhum ativo encontrado.</div>
              ) : (
                filteredAllAssets.map(asset => (
                  <button
                    key={asset.ticker}
                    onClick={() => handleSelectPopular(asset)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-dark-border bg-dark-bg hover:border-primary/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${asset.bg} ${asset.color} flex items-center justify-center text-lg font-bold`}>
                        {asset.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white group-hover:text-primary transition-colors">{asset.ticker}</div>
                        <div className="text-xs text-gray-400">{asset.name}</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3">
                <p className="text-sm text-accent-red">{error}</p>
              </div>
            )}

            {/* Classe */}
            <div>
              <label className="label-premium">Tipo de Ativo</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, classe: 'Stocks' })}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${formData.classe === 'Stocks'
                    ? 'bg-primary/20 border-2 border-primary text-primary'
                    : 'bg-dark-card border border-dark-border text-gray-400 hover:border-gray-600'
                    }`}
                >
                  Ações
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, classe: 'Crypto' })}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${formData.classe === 'Crypto'
                    ? 'bg-accent-purple/20 border-2 border-accent-purple text-accent-purple'
                    : 'bg-dark-card border border-dark-border text-gray-400 hover:border-gray-600'
                    }`}
                >
                  Crypto
                </button>
              </div>
            </div>

            {/* Popular Assets Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="label-premium flex items-center gap-2 mb-0">
                  <TrendingUp className="w-4 h-4 text-accent-green" />
                  Acesso Rápido
                </label>
                <button
                  type="button"
                  onClick={() => setShowAllAssets(true)}
                  className="text-xs text-primary hover:text-primary-light font-medium flex items-center gap-1"
                >
                  Ver matriz completa <Search className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {POPULAR_ASSETS.filter(a => a.classe === formData.classe).map((asset) => (
                  <button
                    key={asset.ticker}
                    type="button"
                    onClick={() => handleSelectPopular(asset)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${formData.ticker === asset.ticker
                      ? 'bg-primary/20 border-primary'
                      : 'bg-dark-bg border-dark-border hover:border-gray-600'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${asset.bg} ${asset.color} flex items-center justify-center text-lg font-bold mb-1`}>
                      {asset.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-300">{asset.ticker}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ticker */}
            <div>
              <label className="label-premium">
                Ticker {formData.classe === 'Stocks' ? '(Ex: PETR4, VALE3)' : '(Ex: BTC, ETH)'}
              </label>
              <input
                type="text"
                required
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                className="input-premium uppercase"
                placeholder={formData.classe === 'Stocks' ? 'PETR4' : 'BTC'}
              />
            </div>

            {/* Quantidade */}
            <div>
              <label className="label-premium">Quantidade</label>
              <input
                type="number"
                required
                step="0.00000001"
                min="0"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                className="input-premium number-font"
                placeholder="0"
              />
            </div>

            {/* Preço Médio */}
            <div className="relative">
              <label className="label-premium">Preço Médio Unitário (R$)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.preco_medio}
                  onChange={(e) => setFormData({ ...formData, preco_medio: e.target.value })}
                  className="input-premium number-font flex-1"
                  placeholder="0.00"
                />
                <button
                  type="button"
                  onClick={() => handleFetchPrice()}
                  disabled={fetchingPrice || !formData.ticker}
                  className="btn-secondary whitespace-nowrap bg-dark-card border-primary/30 hover:border-primary text-primary transition-all"
                >
                  {fetchingPrice ? (
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Buscar Preço Vivo'
                  )}
                </button>
              </div>

              {fetchingPrice && (
                <div className="absolute -top-12 right-0 bg-dark-card/80 backdrop-blur-md border border-primary/30 text-primary px-4 py-2 rounded-xl animate-fade-in flex items-center gap-2 shadow-[0_0_15px_rgba(var(--color-primary),0.2)]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Buscando mercado real...</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
