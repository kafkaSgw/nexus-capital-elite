'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const ROUTE_LABELS: Record<string, string> = {
  '': 'Dashboard',
  'investimentos': 'Investimentos',
  'holding': 'Holding',
  'executivo': 'Executivo',
  'analises': 'Análises',
  'academy': 'Academy',
  'calendario': 'Calendário',
  'cartoes': 'Cartões',
  'socios': 'Sócios',
  'perfil': 'Perfil',
  'whatsapp': 'WhatsApp',
}

export default function Breadcrumbs() {
  const pathname = usePathname()

  // Don't show breadcrumbs on root dashboard
  if (pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)

  const crumbs = [
    { label: 'Dashboard', href: '/' },
    ...segments.map((seg, i) => ({
      label: ROUTE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
      href: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ]

  return (
    <nav className="flex items-center gap-1 text-xs text-gray-500 mb-4 animate-fade-in">
      <Home className="w-3 h-3 text-gray-600" />
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={crumb.href} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 text-gray-700" />
            {isLast ? (
              <span className="text-gray-300 font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-primary transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
