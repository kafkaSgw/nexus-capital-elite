import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import AppShell from '@/components/AppShell'
import { SoundProvider } from '@/components/useSoundFX'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import { I18nProvider } from '@/lib/i18n'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080E1A',
}

export const metadata: Metadata = {
  title: 'Nexus Capital Elite — Gestão Financeira Premium',
  description: 'Sistema completo de gestão financeira pessoal e controle de investimentos com inteligência artificial',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152' },
      { url: '/icons/icon-192x192.png', sizes: '192x192' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nexus Capital',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`antialiased ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SoundProvider>
            <AuthProvider>
              <I18nProvider>
                <AppShell>{children}</AppShell>
              </I18nProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: 'rgba(17, 24, 39, 0.95)',
                    color: '#E2E8F0',
                    border: '1px solid rgba(31, 41, 55, 0.8)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03)',
                    fontSize: '14px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#111827',
                    },
                    style: {
                      borderColor: 'rgba(16, 185, 129, 0.2)',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#111827',
                    },
                    style: {
                      borderColor: 'rgba(239, 68, 68, 0.2)',
                    },
                  },
                }}
              />
            </AuthProvider>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
