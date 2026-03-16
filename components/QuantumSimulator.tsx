'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Infinity as InfinityIcon } from 'lucide-react'

export default function QuantumSimulator() {
    const [aporte, setAporte] = useState(1500)
    const [taxa, setTaxa] = useState(1.1)
    const [anos, setAnos] = useState(10)

    const [resultado, setResultado] = useState(0)

    // Calc juros compostos
    useEffect(() => {
        // FV = PMT * (((1 + i)^n - 1) / i)
        const taxaMes = taxa / 100
        const meses = anos * 12
        const FV = aporte * (((Math.pow(1 + taxaMes, meses)) - 1) / taxaMes)
        setResultado(FV)
    }, [aporte, taxa, anos])

    return (
        <div className="card-premium relative overflow-hidden h-[300px] flex flex-col group border-accent-pink/20 hover:border-accent-pink/40 transition-colors">
            <div className="absolute inset-0 bg-dark-card/80 backdrop-blur-3xl z-0" />

            {/* Grade Futurista Fundo */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(244,114,182,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(244,114,182,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-50 z-0" />

            {/* Onda animada Fundo */}
            <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-accent-pink/10 to-transparent z-0 pointer-events-none"
            />

            {/* Header */}
            <div className="relative z-10 p-4 border-b border-white/[0.04] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <InfinityIcon className="w-5 h-5 text-accent-pink animate-[spin_10s_linear_infinite]" />
                    <h3 className="text-sm font-bold text-accent-pink uppercase tracking-widest font-mono">Simulador Quântico</h3>
                </div>
            </div>

            <div className="relative z-10 flex-1 p-5 flex flex-col gap-6 w-full">
                {/* Sliders */}
                <div className="space-y-4 flex-1">
                    {/* Aporte */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-gray-400 font-mono uppercase">Aporte Mesal (Δ)</span>
                            <span className="text-xs font-bold text-white font-mono">R$ {aporte.toLocaleString('pt-BR')}</span>
                        </div>
                        <input
                            type="range"
                            min="100"
                            max="10000"
                            step="100"
                            value={aporte}
                            onChange={(e) => setAporte(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-pink"
                        />
                    </div>

                    {/* Taxa */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-gray-400 font-mono uppercase">Yield (%)</span>
                            <span className="text-xs font-bold text-white font-mono">{taxa.toFixed(2)}% a.m</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="3"
                            step="0.1"
                            value={taxa}
                            onChange={(e) => setTaxa(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-pink"
                        />
                    </div>

                    {/* Tempo */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-gray-400 font-mono uppercase">Horizonte Temporal</span>
                            <span className="text-xs font-bold text-white font-mono">{anos} Anos</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="35"
                            step="1"
                            value={anos}
                            onChange={(e) => setAnos(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-pink"
                        />
                    </div>
                </div>

                {/* Display de Resultado */}
                <div className="p-3 bg-black/40 border border-accent-pink/20 rounded-xl relative overflow-hidden shrink-0 mt-auto shadow-[0_0_15px_rgba(244,114,182,0.15)]">
                    <div className="absolute top-0 right-0 w-8 h-8 flex items-start justify-end p-1">
                        <span className="w-1.5 h-1.5 bg-accent-pink shadow-[0_0_5px_#F472B6] animate-pulse"></span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono block mb-1">Projeção de Capital Acumulado</span>
                    <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-accent-pink tracking-tighter shadow-lg number-font">
                        R$ {resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </div>
        </div>
    )
}
