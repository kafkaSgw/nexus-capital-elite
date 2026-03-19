'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import SplashScreen from '@/components/SplashScreen'
import PageTransition from '@/components/PageTransition'
import ErrorBoundary from '@/components/ErrorBoundary'
import BottomNavBar from '@/components/BottomNavBar'
import Breadcrumbs from '@/components/Breadcrumbs'

const AIChat = dynamic(() => import('@/components/AIChat'), { ssr: false })
const VoiceCopilot = dynamic(() => import('@/components/VoiceCopilot'), { ssr: false })
const InteractiveShowcase = dynamic(() => import('@/components/InteractiveShowcase'), { ssr: false })
const NeuralBackground = dynamic(() => import('@/components/NeuralBackground'), { ssr: false })
const PWAInstall = dynamic(() => import('@/components/PWAInstall'), { ssr: false })

const PUBLIC_ROUTES = ['/login', '/register', '/reset-password']

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const pathname = usePathname()
    const [mobileMenuRequested, setMobileMenuRequested] = useState(false)

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

    // Show loading spinner during auth check
    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Image src="/logo.png?v=tech" alt="Nexus Capital" width={64} height={64} className="w-16 h-16 rounded-xl animate-pulse" />
                    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            </div>
        )
    }

    // Public routes (login, register) — render without header/nav
    if (isPublicRoute) {
        return <>{children}</>
    }

    // Not authenticated and not on public route — auth provider handles redirect
    if (!user) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    // Authenticated — render full app
    return (
        <ErrorBoundary>
            <SplashScreen>
                <NeuralBackground />
                <Header externalMenuOpen={mobileMenuRequested} onExternalMenuHandled={() => setMobileMenuRequested(false)} />
                <main className="min-h-screen relative z-10">
                    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <Breadcrumbs />
                        <PageTransition>
                            {children}
                        </PageTransition>
                    </div>
                </main>
                <BottomNavBar onMenuOpen={() => setMobileMenuRequested(true)} />
                <AIChat />
                <VoiceCopilot />
                <InteractiveShowcase />
                <PWAInstall />
            </SplashScreen>
        </ErrorBoundary>
    )
}
