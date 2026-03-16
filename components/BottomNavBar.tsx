'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wallet, PieChart, GraduationCap, Menu } from 'lucide-react'
import { motion } from 'framer-motion'

const TABS = [
    { href: '/', label: 'Home', icon: LayoutDashboard },
    { href: '/investimentos', label: 'Invest', icon: Wallet },
    { href: '/analises', label: 'Análises', icon: PieChart },
    { href: '/academy', label: 'Academy', icon: GraduationCap },
]

interface BottomNavBarProps {
    onMenuOpen: () => void
}

export default function BottomNavBar({ onMenuOpen }: BottomNavBarProps) {
    const pathname = usePathname()

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
            style={{
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
        >
            {/* Glass background */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'rgba(5, 7, 11, 0.85)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                }}
            />

            <div className="relative flex items-center justify-around px-2 h-16">
                {TABS.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-2xl transition-colors relative"
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    className="absolute -top-0.5 w-8 h-1 rounded-full bg-gradient-to-r from-primary to-accent-cyan"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}

                            <Icon
                                className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary-lighter' : 'text-gray-500'
                                    }`}
                            />
                            <span
                                className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500'
                                    }`}
                            >
                                {label}
                            </span>
                        </Link>
                    )
                })}

                {/* Menu button */}
                <button
                    onClick={onMenuOpen}
                    className="flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-2xl transition-colors"
                >
                    <Menu className="w-5 h-5 text-gray-500 transition-colors duration-200" />
                    <span className="text-[10px] font-medium text-gray-500">Menu</span>
                </button>
            </div>
        </nav>
    )
}
