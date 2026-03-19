'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Wallet, LayoutDashboard, PieChart, Building2, Presentation, Search, Users, Volume2, VolumeX, GraduationCap, Menu, X, LogOut, FileDown, MoreHorizontal, CalendarDays, CreditCard, Settings, Gem, ShieldAlert } from 'lucide-react'
import NotificationCenter from './NotificationCenter'
import GlobalSearch from './GlobalSearch'
import XPSystem from './XPSystem'
import { ThemeToggle } from './ThemeToggle'
import { useSoundFX } from './useSoundFX'
import { useAuth } from './AuthProvider'
import ExportData from './ExportData'
import LanguageSwitcher from './LanguageSwitcher'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/whatsapp', label: 'WhatsApp', icon: Wallet },
  { href: '/holding', label: 'Holding', icon: Building2 },
  { href: '/executivo', label: 'Executivo', icon: Presentation },
  { href: '/analises', label: 'Análises', icon: PieChart },
  { href: '/investimentos', label: 'Investimentos', icon: Wallet },
  { href: '/ativos-alternativos', label: 'Alternativos', icon: Gem },
  { href: '/analise-risco', label: 'Risco', icon: ShieldAlert },
  { href: '/socios', label: 'Sócios', icon: Users },
  { href: '/academy', label: 'Academy', icon: GraduationCap },
  { href: '/calendario', label: 'Calendário', icon: CalendarDays },
  { href: '/cartoes', label: 'Cartões', icon: CreditCard },
]

export default function Header({ externalMenuOpen, onExternalMenuHandled }: { externalMenuOpen?: boolean; onExternalMenuHandled?: () => void }) {
  const pathname = usePathname()
  const { muted, toggleMute } = useSoundFX()
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  // Sync external menu open request from BottomNavBar
  useEffect(() => {
    if (externalMenuOpen) {
      setMobileMenuOpen(true)
      onExternalMenuHandled?.()
    }
  }, [externalMenuOpen, onExternalMenuHandled])

  return (
    <>
      <header className="sticky top-0 z-50 glass-effect">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3 group">
              <div className="relative shrink-0 w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-all duration-300">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Image
                  src="/logo.png?v=tech"
                  alt="Nexus Capital"
                  width={40}
                  height={40}
                  className="object-contain relative z-10"
                  style={{ mixBlendMode: 'lighten' }}
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold gradient-text tracking-tight">
                  NEXUS CAPITAL
                </h1>
                <p className="text-[9px] sm:text-[10px] text-corporate-silver/60 -mt-0.5 uppercase tracking-[0.2em] font-medium whitespace-nowrap hidden sm:block">
                  Holding & Investimentos
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.slice(0, 4).map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl transition-all duration-300 group ${isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {/* Active background */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-primary/5 rounded-xl border border-primary/20" />
                    )}

                    {/* Hover background */}
                    {!isActive && (
                      <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.04] transition-all duration-300" />
                    )}

                    <Icon className={`relative z-10 w-4 h-4 transition-all duration-300 ${isActive
                      ? 'text-primary-lighter'
                      : 'text-gray-500 group-hover:text-gray-300'
                      }`} />
                    <span className={`relative z-10 text-sm font-medium transition-all duration-300 ${isActive ? 'text-white' : 'group-hover:text-gray-200'
                      }`}>
                      {label}
                    </span>

                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
                    )}
                  </Link>
                )
              })}

              {/* More Dropdown */}
              {NAV_LINKS.length > 4 && (
                <div className="relative group flex items-center ml-1">
                  <button className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 text-gray-400 hover:text-white hover:bg-white/[0.04]" title="Mais opções">
                    <MoreHorizontal className="w-5 h-5 transition-all duration-300 group-hover:text-gray-200" />
                  </button>

                  {/* Dropdown Content */}
                  <div className="absolute top-full right-0 mt-2 w-48 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {NAV_LINKS.slice(4).map(({ href, label, icon: Icon }) => {
                      const isActive = pathname === href
                      return (
                        <Link
                          key={href}
                          href={href}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? 'text-white bg-primary/10' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                            }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-primary-lighter' : 'text-gray-500'}`} />
                          {label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Search + Notifications */}
              <div className="ml-3 pl-3 border-[0.5px] border-white/[0.06] flex items-center gap-2">

                <button
                  onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all duration-300"
                >
                  <Search className="w-4 h-4" />
                  <kbd className="hidden sm:inline text-[10px] px-2 py-0.5 bg-white/[0.04] rounded-md border border-white/[0.06] text-gray-500 font-mono">
                    ⌘K
                  </kbd>
                </button>

                <NotificationCenter />

                {/* Profile & Settings */}
                <div className="relative group flex items-center gap-1">
                  <Link
                    href="/perfil"
                    className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all duration-300"
                    title="Configurações"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                  <button className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 text-primary hover:text-white hover:shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-all duration-300 border border-primary/20">
                    <span className="text-sm font-bold">{user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </button>

                  {/* Dropdown Content */}
                  <div className="absolute top-full right-0 mt-2 w-56 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">

                    <div className="px-4 py-2 pb-3 mb-2 border-b border-zinc-800">
                      <p className="text-sm font-medium text-white truncate">{user?.user_metadata?.full_name || 'Usuário'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <div className="px-4 flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Ações e Config.</span>
                    </div>

                    <button
                      onClick={() => setExportOpen(true)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <FileDown className="w-4 h-4" />
                      Exportar Dados
                    </button>
                    <button
                      onClick={toggleMute}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors text-left"
                    >
                      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      {muted ? 'Ativar sons' : 'Silenciar'}
                    </button>

                    <div className="h-[1px] bg-zinc-800 my-1" />

                    <div className="px-4 py-1.5 flex items-center justify-between text-sm text-gray-400">
                      <span>Tema</span>
                      <ThemeToggle />
                    </div>

                    <div className="px-4 py-1.5 flex items-center justify-between text-sm text-gray-400">
                      <span>Idioma</span>
                      <LanguageSwitcher />
                    </div>

                    <div className="h-[1px] bg-zinc-800 my-1 mt-2" />

                    <Link
                      href="/perfil"
                      className="flex items-center justify-center w-full mt-1 px-4 py-2 text-sm text-primary hover:text-primary-lighter transition-colors"
                    >
                      Gerenciar Perfil Completo
                    </Link>
                  </div>
                </div>
              </div>
            </nav>

            {/* Mobile Header Actions */}
            <div className="flex lg:hidden items-center gap-1">
              <NotificationCenter />

              <button
                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div >
      </header >

      {/* ===== Mobile Drawer Menu ===== */}
      <AnimatePresence>
        {
          mobileMenuOpen && (
            <>
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Drawer panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 z-[70] w-[280px] sm:w-[320px] lg:hidden"
                style={{
                  background: 'rgba(10, 16, 30, 0.98)',
                  backdropFilter: 'blur(24px)',
                  borderLeft: '1px solid rgba(51, 65, 85, 0.4)',
                }}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.06]">
                  <span className="text-sm font-semibold text-white tracking-wide">Menu</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
                    aria-label="Fechar menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col py-3 px-3 gap-0.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px - 140px)' }}>
                  {NAV_LINKS.map(({ href, label, icon: Icon }, index) => {
                    const isActive = pathname === href
                    return (
                      <motion.div
                        key={href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <Link
                          href={href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${isActive
                            ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-white border border-primary/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                            }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? 'text-primary-lighter' : 'text-gray-500'}`} />
                          {label}
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.06] p-4 space-y-3" style={{ background: 'rgba(10, 16, 30, 0.98)' }}>
                  {/* Controls Row */}
                  <div className="flex items-center justify-center gap-2">
                    <ThemeToggle />
                    <LanguageSwitcher />

                    <button
                      onClick={toggleMute}
                      className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
                      title={muted ? 'Ativar sons' : 'Silenciar'}
                    >
                      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setExportOpen(true)
                      }}
                      className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 hover:text-accent-green hover:bg-accent-green/10 transition-all"
                      title="Exportar dados"
                    >
                      <FileDown className="w-5 h-5" />
                    </button>

                    <Link
                      href="/perfil"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 text-primary hover:text-white hover:shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-all border border-primary/20"
                      title="Perfil e Configurações"
                    >
                      <span className="text-sm font-bold">{user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}</span>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut()
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da conta
                  </button>
                </div>
              </motion.div>
            </>
          )
        }
      </AnimatePresence >

      {/* Export Modal */}
      < ExportData isOpen={exportOpen} onClose={() => setExportOpen(false)
      } />
      < GlobalSearch />
    </>
  )
}
