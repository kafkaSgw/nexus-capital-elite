import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Cpu, Network, Zap, Binary, Activity } from 'lucide-react'

export default function AICoreVisualizer() {
    const [logs, setLogs] = useState<string[]>([])

    const aiMessages = [
        "Analisando padrões de consumo...",
        "Correlacionando ativos globais...",
        "Otimizando modelo de regressão...",
        "Calculando projeções de fluxo de caixa...",
        "Identificando oportunidades de economia...",
        "Buscando anomalias financeiras...",
        "Sintetizando recomendações personalizadas...",
        "Treinando rede neural profunda...",
        "Acessando banco de dados de mercado...",
        "Executando simulações de Monte Carlo..."
    ]

    useEffect(() => {
        // Adicionar logs dinâmicos
        const logInterval = setInterval(() => {
            setLogs(prev => {
                const nextLog = `[${new Date().toISOString().substring(11, 19)}] SYS: ${aiMessages[Math.floor(Math.random() * aiMessages.length)]}`
                const updatedLogs = [...prev, nextLog]
                if (updatedLogs.length > 5) {
                    updatedLogs.shift()
                }
                return updatedLogs
            })
        }, 2500)

        return () => clearInterval(logInterval)
    }, [])

    return (
        <div className="card-premium relative overflow-hidden h-[300px] flex group cursor-pointer mt-8">
            {/* Background animado e escaneamento */}
            <div className="absolute inset-0 bg-dark-card/60 backdrop-blur-xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-30 group-hover:opacity-60 transition-opacity duration-1000" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/40 blur-[2px] animate-scan" style={{ boxShadow: '0 0 15px 2px rgba(99, 102, 241, 0.5)' }} />

            {/* Esquerda: O Núcleo */}
            <div className="relative w-1/3 border-r border-white/[0.05] p-6 flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Orb pulsante */}
                <div className="relative w-28 h-28 flex items-center justify-center mt-2">
                    {/* Anéis externos */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-dashed border-primary/40"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 rounded-full border border-accent-purple/30"
                    />

                    {/* Brilho interno */}
                    <div className="absolute inset-4 rounded-full bg-primary/20 blur-xl animate-pulse-slow" />

                    {/* Ícone */}
                    <div className="relative bg-gradient-to-br from-primary to-accent-purple p-4 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] transition-all duration-500 scale-100 group-hover:scale-110">
                        <Brain className="w-8 h-8 text-white relative z-10" />
                    </div>
                </div>

                <div className="mt-8 text-center z-10">
                    <h3 className="text-white font-bold text-sm tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary-lighter to-accent-purple">Nexus Engine</h3>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <div className="w-1.5 h-1.5 bg-accent-green rounded-full shadow-[0_0_8px_#10B981] animate-pulse" />
                        <span className="text-[10px] text-accent-green font-mono uppercase tracking-widest">Ativo</span>
                    </div>
                </div>
            </div>

            {/* Direita: Terminal e Dados */}
            <div className="relative w-2/3 p-6 flex flex-col z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Cpu className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-400 font-mono">PROCESSANDO DADOS...</span>
                    </div>
                    <div className="flex gap-2">
                        <Network className="w-4 h-4 text-primary-lighter/60" />
                        <Binary className="w-4 h-4 text-primary-lighter/60" />
                        <Activity className="w-4 h-4 text-primary-lighter/60" />
                    </div>
                </div>

                {/* Console de Logs */}
                <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 font-mono text-[11px] flex flex-col justify-end overflow-hidden custom-scrollbar relative">
                    <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/60 to-transparent z-10" />
                    <div className="space-y-2 relative z-0">
                        {logs.map((log, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: i === logs.length - 1 ? 1 : Math.max(0.2, 1 - (logs.length - 1 - i) * 0.25), x: 0 }}
                                className={i === logs.length - 1 ? "text-primary-lighter" : "text-gray-500"}
                            >
                                {log}
                            </motion.div>
                        ))}
                        {!logs.length && <div className="text-primary-lighter animate-pulse">Inicializando rotinas neurais...</div>}

                        {/* Cursor piscando na última linha simulada */}
                        <div className="flex items-center gap-2 text-primary-lighter mt-2 opacity-50">
                            <span>{`> `}</span>
                            <span className="w-1.5 h-3 bg-primary animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Métricas Inferiores */}
                <div className="grid grid-cols-3 gap-4 mt-4 shrink-0">
                    <div className="bg-white/[0.02] border border-white/[0.03] rounded-lg p-2 flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Carga Neural</span>
                        <span className="text-white font-mono text-xs">{(Math.random() * 20 + 70).toFixed(1)}%</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.03] rounded-lg p-2 flex flex-col items-center group-hover:bg-primary/5 transition-colors">
                        <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Padrões</span>
                        <span className="text-primary-lighter font-mono text-xs flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            1,342
                        </span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.03] rounded-lg p-2 flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Latência</span>
                        <span className="text-white font-mono text-xs">12ms</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
