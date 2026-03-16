'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Lang = 'pt-BR' | 'en'

const translations: Record<Lang, Record<string, string>> = {
    'pt-BR': {
        'nav.dashboard': 'Dashboard',
        'nav.whatsapp': 'WhatsApp',
        'nav.holding': 'Holding',
        'nav.executive': 'Executivo',
        'nav.analysis': 'Análises',
        'nav.investments': 'Investimentos',
        'nav.partners': 'Sócios',
        'nav.academy': 'Academy',
        'nav.calendar': 'Calendário',
        'nav.cards': 'Cartões',
        'dashboard.title': 'Dashboard',
        'dashboard.subtitle': 'Visão geral da sua saúde financeira',
        'dashboard.totalWealth': 'Patrimônio Total',
        'dashboard.investments': 'Investimentos',
        'dashboard.income': 'Total Receitas',
        'dashboard.expenses': 'Total Despesas',
        'dashboard.newTransaction': 'Nova Transação',
        'dashboard.transactions': 'Transações do Período',
        'dashboard.export': 'Exportação',
        'dashboard.downloadReports': 'Baixar relatórios',
        'dashboard.financialSummary': 'Resumo Financeiro',
        'dashboard.quickView': 'Visão rápida',
        'dashboard.balance': 'Saldo em Conta',
        'dashboard.investmentProfit': 'Lucro Investimentos',
        'dashboard.assetCount': 'Nº de Ativos',
        'dashboard.transactions30d': 'Transações (30d)',
        'dashboard.profitMargin': 'Margem de Lucro',
        'common.search': 'Buscar',
        'common.loading': 'Carregando...',
        'common.save': 'Salvar',
        'common.cancel': 'Cancelar',
        'common.delete': 'Excluir',
        'common.edit': 'Editar',
        'common.add': 'Adicionar',
        'common.close': 'Fechar',
        'common.vs_last_month': 'vs mês ant.',
        'common.today': 'Hoje',
    },
    'en': {
        'nav.dashboard': 'Dashboard',
        'nav.whatsapp': 'WhatsApp',
        'nav.holding': 'Holding',
        'nav.executive': 'Executive',
        'nav.analysis': 'Analytics',
        'nav.investments': 'Investments',
        'nav.partners': 'Partners',
        'nav.academy': 'Academy',
        'nav.calendar': 'Calendar',
        'nav.cards': 'Cards',
        'dashboard.title': 'Dashboard',
        'dashboard.subtitle': 'Overview of your financial health',
        'dashboard.totalWealth': 'Total Wealth',
        'dashboard.investments': 'Investments',
        'dashboard.income': 'Total Income',
        'dashboard.expenses': 'Total Expenses',
        'dashboard.newTransaction': 'New Transaction',
        'dashboard.transactions': 'Period Transactions',
        'dashboard.export': 'Export',
        'dashboard.downloadReports': 'Download reports',
        'dashboard.financialSummary': 'Financial Summary',
        'dashboard.quickView': 'Quick view',
        'dashboard.balance': 'Account Balance',
        'dashboard.investmentProfit': 'Investment Profit',
        'dashboard.assetCount': 'Number of Assets',
        'dashboard.transactions30d': 'Transactions (30d)',
        'dashboard.profitMargin': 'Profit Margin',
        'common.search': 'Search',
        'common.loading': 'Loading...',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.add': 'Add',
        'common.close': 'Close',
        'common.vs_last_month': 'vs last month',
        'common.today': 'Today',
    },
}

interface I18nContextType {
    lang: Lang
    setLang: (lang: Lang) => void
    t: (key: string) => string
}

const I18nContext = createContext<I18nContextType>({
    lang: 'pt-BR',
    setLang: () => { },
    t: (key: string) => key,
})

export function I18nProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>('pt-BR')

    useEffect(() => {
        const saved = localStorage.getItem('nexus_lang') as Lang | null
        if (saved && translations[saved]) setLangState(saved)
    }, [])

    const setLang = (newLang: Lang) => {
        setLangState(newLang)
        localStorage.setItem('nexus_lang', newLang)
    }

    const t = (key: string): string => {
        return translations[lang]?.[key] || translations['pt-BR']?.[key] || key
    }

    return (
        <I18nContext.Provider value={{ lang, setLang, t }}>
            {children}
        </I18nContext.Provider>
    )
}

export function useTranslation() {
    return useContext(I18nContext)
}

export default I18nContext
