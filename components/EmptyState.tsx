'use client'

import { Wallet, BarChart3, Building2, GraduationCap, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  type: 'transactions' | 'investments' | 'companies' | 'academy' | 'assets' | 'generic'
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

const configs = {
  transactions: {
    icon: BarChart3,
    title: 'Nenhuma transação registrada',
    description: 'Comece a registrar suas receitas e despesas para ter uma visão completa das suas finanças.',
    actionLabel: 'Adicionar Transação',
    gradient: 'from-primary/20 to-accent-indigo/20',
    iconColor: 'text-primary-lighter',
    borderColor: 'border-primary/10',
  },
  investments: {
    icon: TrendingUp,
    title: 'Sua carteira está vazia',
    description: 'Adicione seus primeiros ativos e acompanhe o desempenho dos seus investimentos em tempo real.',
    actionLabel: 'Adicionar Ativo',
    gradient: 'from-accent-green/20 to-accent-cyan/20',
    iconColor: 'text-accent-green',
    borderColor: 'border-accent-green/10',
  },
  companies: {
    icon: Building2,
    title: 'Nenhuma empresa cadastrada',
    description: 'Cadastre suas empresas para ter uma visão consolidada da holding e gerar relatórios executivos.',
    actionLabel: 'Adicionar Empresa',
    gradient: 'from-accent-purple/20 to-accent-pink/20',
    iconColor: 'text-accent-purple',
    borderColor: 'border-accent-purple/10',
  },
  academy: {
    icon: GraduationCap,
    title: 'Comece a aprender',
    description: 'A Academy Nexus oferece cursos sobre finanças, investimentos e gestão empresarial.',
    actionLabel: 'Ir para Academy',
    gradient: 'from-accent-yellow/20 to-accent-orange/20',
    iconColor: 'text-accent-yellow',
    borderColor: 'border-accent-yellow/10',
  },
  assets: {
    icon: Wallet,
    title: 'Nenhum ativo encontrado',
    description: 'Adicione ações, FIIs, criptomoedas e outros ativos para acompanhar sua carteira.',
    actionLabel: 'Adicionar Ativo',
    gradient: 'from-accent-indigo/20 to-primary/20',
    iconColor: 'text-accent-indigo',
    borderColor: 'border-accent-indigo/10',
  },
  generic: {
    icon: Plus,
    title: 'Nada por aqui ainda',
    description: 'Não há dados para exibir no momento. Comece adicionando novos itens.',
    actionLabel: 'Começar',
    gradient: 'from-gray-500/20 to-gray-600/20',
    iconColor: 'text-gray-400',
    borderColor: 'border-gray-500/10',
  },
}

export default function EmptyState({ type, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  const config = configs[type]
  const Icon = config.icon
  const displayTitle = title || config.title
  const displayDescription = description || config.description
  const displayAction = actionLabel || config.actionLabel

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 sm:py-16 px-6 text-center"
    >
      {/* Animated icon */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center border ${config.borderColor} mb-6 shadow-lg`}
      >
        <Icon className={`w-10 h-10 ${config.iconColor}`} />
      </motion.div>

      {/* Decorative dots */}
      <div className="flex items-center gap-1.5 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-pulse" />
        <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: '200ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-pulse" style={{ animationDelay: '400ms' }} />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">{displayTitle}</h3>
      <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">{displayDescription}</p>

      {actionHref ? (
        <Link
          href={actionHref}
          className="btn-primary flex items-center gap-2 text-sm px-6 py-3 group"
        >
          {displayAction}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ) : onAction ? (
        <button
          onClick={onAction}
          className="btn-primary flex items-center gap-2 text-sm px-6 py-3 group"
        >
          <Plus className="w-4 h-4" />
          {displayAction}
        </button>
      ) : null}
    </motion.div>
  )
}
