'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, FileText, Building2, TrendingUp, LayoutDashboard, PieChart, Presentation, Wallet, ArrowRight, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface SearchResult {
    id: string
    type: 'transaction' | 'company' | 'asset' | 'page'
    title: string
    subtitle: string
    icon: any
    href?: string
    color: string
}

const PAGES = [
    { id: 'page-dashboard', title: 'Dashboard', subtitle: 'Visão geral do sistema', href: '/', icon: LayoutDashboard, color: 'text-primary' },
    { id: 'page-holding', title: 'Holding', subtitle: 'Gestão de empresas', href: '/holding', icon: Building2, color: 'text-accent-green' },
    { id: 'page-executivo', title: 'Executivo', subtitle: 'Painel executivo', href: '/executivo', icon: Presentation, color: 'text-accent-purple' },
    { id: 'page-analises', title: 'Análises', subtitle: 'Relatórios e gráficos', href: '/analises', icon: PieChart, color: 'text-accent-yellow' },
    { id: 'page-investimentos', title: 'Investimentos', subtitle: 'Carteira de ativos', href: '/investimentos', icon: Wallet, color: 'text-accent-orange' },
    { id: 'page-socios', title: 'Sócios', subtitle: 'Gestão societária e projetos', href: '/socios', icon: Users, color: 'text-accent-blue' },
]

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // Ctrl+K shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(true)
            }
            if (e.key === 'Escape') {
                setIsOpen(false)
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
            setQuery('')
            setResults([])
            setSelectedIndex(0)
        }
    }, [isOpen])

    // Search logic
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults(PAGES.map(p => ({ ...p, type: 'page' as const })))
            return
        }

        setLoading(true)
        const q = searchQuery.toLowerCase()
        const allResults: SearchResult[] = []

        // Search pages
        PAGES.forEach(page => {
            if (page.title.toLowerCase().includes(q) || page.subtitle.toLowerCase().includes(q)) {
                allResults.push({ ...page, type: 'page' })
            }
        })

        try {
            // Search transactions
            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .or(`description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
                .order('created_at', { ascending: false })
                .limit(5)

            if (transactions) {
                transactions.forEach(t => {
                    allResults.push({
                        id: `tx-${t.id}`,
                        type: 'transaction',
                        title: t.description,
                        subtitle: `${t.type === 'income' ? 'Receita' : 'Despesa'} • ${formatCurrency(Math.abs(t.amount))} • ${t.category}`,
                        icon: FileText,
                        color: t.type === 'income' ? 'text-accent-green' : 'text-accent-red',
                        href: '/'
                    })
                })
            }

            // Search companies
            const { data: companies } = await supabase
                .from('companies')
                .select('*')
                .ilike('name', `%${searchQuery}%`)
                .limit(5)

            if (companies) {
                companies.forEach(c => {
                    allResults.push({
                        id: `co-${c.id}`,
                        type: 'company',
                        title: c.name,
                        subtitle: c.description || 'Empresa do portfólio',
                        icon: Building2,
                        color: 'text-primary',
                        href: '/holding'
                    })
                })
            }

            // Search assets
            const { data: assets } = await supabase
                .from('assets')
                .select('*')
                .ilike('ticker', `%${searchQuery}%`)
                .limit(5)

            if (assets) {
                assets.forEach(a => {
                    const variation = ((a.preco_atual - a.preco_medio) / a.preco_medio) * 100
                    allResults.push({
                        id: `asset-${a.id}`,
                        type: 'asset',
                        title: a.ticker,
                        subtitle: `${a.classe} • ${formatCurrency(a.preco_atual)} • ${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%`,
                        icon: TrendingUp,
                        color: variation >= 0 ? 'text-accent-green' : 'text-accent-red',
                        href: '/investimentos'
                    })
                })
            }
        } catch (err) {
            console.error('Search error:', err)
        }

        setResults(allResults)
        setSelectedIndex(0)
        setLoading(false)
    }, [])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => performSearch(query), 200)
        return () => clearTimeout(timer)
    }, [query, performSearch])

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex])
        }
    }

    const handleSelect = (result: SearchResult) => {
        if (result.href) {
            router.push(result.href)
        }
        setIsOpen(false)
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'transaction': return 'Transação'
            case 'company': return 'Empresa'
            case 'asset': return 'Ativo'
            case 'page': return 'Página'
            default: return type
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[80] animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

            <div className="relative max-w-2xl mx-auto mt-[15vh] px-4">
                <div className="bg-dark-card border border-dark-border rounded-2xl shadow-corporate-lg overflow-hidden animate-slide-up">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-dark-border">
                        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Buscar transações, empresas, ativos, páginas..."
                            className="flex-1 bg-transparent text-white placeholder-gray-500 text-lg outline-none"
                        />
                        <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-dark-bg rounded border border-dark-border">
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div className="max-h-[50vh] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : results.length === 0 && query ? (
                            <div className="text-center py-12">
                                <Search className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400">Nenhum resultado para &quot;{query}&quot;</p>
                            </div>
                        ) : (
                            <div className="py-2">
                                {results.map((result, index) => {
                                    const Icon = result.icon
                                    return (
                                        <button
                                            key={result.id}
                                            onClick={() => handleSelect(result)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${index === selectedIndex ? 'bg-primary/10' : 'hover:bg-dark-hover'
                                                }`}
                                        >
                                            <div className={`w-9 h-9 rounded-lg bg-dark-bg flex items-center justify-center flex-shrink-0`}>
                                                <Icon className={`w-4 h-4 ${result.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white truncate">{result.title}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium flex-shrink-0">
                                                        {getTypeLabel(result.type)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400 truncate">{result.subtitle}</p>
                                            </div>
                                            <ArrowRight className={`w-4 h-4 flex-shrink-0 transition-opacity ${index === selectedIndex ? 'opacity-100 text-primary' : 'opacity-0'
                                                }`} />
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-5 py-3 border-t border-dark-border text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-dark-bg rounded border border-dark-border">↑↓</kbd> navegar</span>
                            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-dark-bg rounded border border-dark-border">Enter</kbd> abrir</span>
                        </div>
                        <span>{results.length} resultado{results.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
