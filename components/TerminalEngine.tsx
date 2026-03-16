'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Terminal, ShieldAlert, Cpu } from 'lucide-react'

export default function TerminalEngine() {
    const [logs, setLogs] = useState<{ id: number; text: string; type: 'info' | 'warn' | 'success' | 'cmd' }[]>([])
    const [inputValue, setInputValue] = useState('')
    const logEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Initial Boot Sequence
        const bootSequence = [
            { t: 'NEXUS OS v12.4.1 Inicializando...', delay: 500, type: 'info' as const },
            { t: 'Autenticando módulos neurais [██████████] 100%', delay: 1000, type: 'success' as const },
            { t: 'Buscando anomalias no fluxo de caixa: 0 encontradas.', delay: 2000, type: 'info' as const },
            { t: 'Digite /scan, /prever ou /help para comandos.', delay: 2500, type: 'warn' as const }
        ]

        let currentDelay = 0
        bootSequence.forEach((item, index) => {
            currentDelay += item.delay
            setTimeout(() => {
                setLogs(prev => [...prev, { id: Date.now() + index, text: item.t, type: item.type }])
            }, currentDelay)
        })
    }, [])

    useEffect(() => {
        if (logEndRef.current && logEndRef.current.parentElement) {
            const container = logEndRef.current.parentElement;
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }
    }, [logs])

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim()) return

        const cmd = inputValue.trim().toLowerCase()

        // Echo command
        setLogs(prev => [...prev, { id: Date.now(), text: `> ${inputValue}`, type: 'cmd' }])

        // Parse command
        setTimeout(() => {
            switch (cmd) {
                case '/scan':
                    setLogs(prev => [...prev,
                    { id: Date.now() + 1, text: '[SCAN] Analisando 30 dias de histórico...', type: 'info' },
                    { id: Date.now() + 2, text: '[ALERTA] Despesas com Serviços Assinatura (SaaS) aumentaram 15%.', type: 'warn' }
                    ])
                    break;
                case '/prever':
                    setLogs(prev => [...prev,
                    { id: Date.now() + 1, text: '[MODELO] Executando regressão linear na Taxa de Poupança...', type: 'info' },
                    { id: Date.now() + 2, text: '[RESULTADO] Projeção patrimonial: R$ 125,430 estimados até Dezembro.', type: 'success' }
                    ])
                    break;
                case '/help':
                    setLogs(prev => [...prev,
                    { id: Date.now() + 1, text: 'Comandos disponíveis:', type: 'info' },
                    { id: Date.now() + 2, text: '  /scan   - Busca padrões anormais de gasto', type: 'info' },
                    { id: Date.now() + 3, text: '  /prever - Projeção de IA para fim do ano', type: 'info' },
                    { id: Date.now() + 4, text: '  /deep   - [Acesso Negado. Requer Nível 3]', type: 'warn' },
                    ])
                    break;
                case '/deep':
                    setLogs(prev => [...prev, { id: Date.now(), text: 'Acesso Restrito: Nível de Clearance Insuficiente.', type: 'warn' }])
                    break;
                default:
                    setLogs(prev => [...prev, { id: Date.now(), text: `Comando não reconhecido: ${cmd}. Digite /help.`, type: 'info' }])
            }
        }, 600)

        setInputValue('')
    }

    return (
        <div className="card-premium relative overflow-hidden h-[300px] flex flex-col group border-primary/20 hover:border-primary/40 transition-colors">
            <div className="absolute inset-0 bg-dark-card/80 backdrop-blur-3xl z-0" />

            {/* Glitch Overlay Effect */}
            <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/black-scales.png')] opacity-[0.03] pointer-events-none z-0" />

            {/* Header */}
            <div className="relative z-10 p-4 border-b border-primary/20 bg-primary/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-primary-lighter animate-pulse" />
                    <h3 className="text-sm font-bold text-primary-lighter uppercase tracking-[0.2em] font-mono">Terminal Nexus</h3>
                </div>
                <div className="flex gap-2">
                    <Cpu className="w-4 h-4 text-primary-lighter/50" />
                    <ShieldAlert className="w-4 h-4 text-accent-red/50" />
                </div>
            </div>

            {/* Logs Area */}
            <div className="relative z-10 flex-1 p-4 font-mono text-[11px] sm:text-xs overflow-y-auto custom-scrollbar flex flex-col gap-1.5 scroll-smooth">
                {logs.map((log) => (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`
              ${log.type === 'info' ? 'text-gray-400' : ''}
              ${log.type === 'warn' ? 'text-accent-yellow drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''}
              ${log.type === 'success' ? 'text-accent-green drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}
              ${log.type === 'cmd' ? 'text-white font-bold' : ''}
            `}
                    >
                        {log.text}
                    </motion.div>
                ))}
                <div ref={logEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative z-10 p-3 border-t border-primary/20 bg-black/40 shrink-0">
                <form onSubmit={handleCommand} className="flex items-center gap-2">
                    <span className="text-primary-lighter font-mono font-bold animate-pulse">{'>'}</span>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Aguardando comando neural..."
                        className="flex-1 bg-transparent border-none text-white font-mono text-xs focus:outline-none focus:ring-0 placeholder-gray-600"
                        autoComplete="off"
                        spellCheck="false"
                    />
                </form>
            </div>
        </div>
    )
}
