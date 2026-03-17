'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
    signUp: (email: string, password: string, name: string) => Promise<{ data: any, error: AuthError | null }>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PUBLIC_ROUTES = ['/login', '/register', '/reset-password']

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // MOCK USER: Bypass Supabase Auth per user request
        const mockUser = { id: 'nexus-guest-123', email: 'convidado@nexuscapital.com', user_metadata: { full_name: 'Convidado Elite' } } as unknown as User
        const mockSession = { user: mockUser, access_token: 'mock-token', refresh_token: 'mock-refresh' } as unknown as Session

        // Delay slightly to simulate loading so UI doesn't blink weirdly
        const timer = setTimeout(() => {
            setUser(mockUser)
            setSession(mockSession)
            setLoading(false)

            // Auto-redirect from public routes to dashboard if accessing them directly
            if (PUBLIC_ROUTES.includes(pathname)) {
                router.push('/')
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [pathname, router])

    const signIn = async (email: string, password: string) => {
        // Always succeed
        router.push('/')
        return { error: null }
    }

    const signUp = async (email: string, password: string, name: string) => {
        // Always succeed
        router.push('/')
        return { data: { session: true }, error: null }
    }

    const signOut = async () => {
        // Do nothing since we are bypassing auth, or navigate to login
        router.push('/login')
    }

    const resetPassword = async (email: string) => {
        return { error: null }
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, resetPassword }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
