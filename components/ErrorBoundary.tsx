'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
    children: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo)
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null })
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
                    <div className="max-w-md text-center">
                        <div className="w-16 h-16 rounded-2xl bg-accent-red/20 flex items-center justify-center mx-auto mb-5">
                            <AlertTriangle className="w-8 h-8 text-accent-red" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Algo deu errado</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Ocorreu um erro inesperado. Tente recarregar a página.
                        </p>
                        {this.state.error && (
                            <p className="text-xs text-gray-600 bg-dark-card rounded-lg p-3 mb-4 font-mono break-all">
                                {this.state.error.message}
                            </p>
                        )}
                        <button
                            onClick={this.handleReload}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white text-sm transition-all"
                            style={{
                                background: 'linear-gradient(135deg, #2563EB, #6366F1)',
                                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
                            }}
                        >
                            <RefreshCw className="w-4 h-4" />
                            Recarregar Página
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
