'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Building2, TrendingUp, ShieldCheck } from 'lucide-react'

export default function HeroBackground() {
    return (
        <div className="card-premium relative overflow-hidden h-[300px] flex flex-col group border-primary/20 hover:border-primary/40 transition-colors cursor-crosshair">

            {/* Imagem de Fundo c/ Efeito Zoom no Hover */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div
                    className="absolute inset-0 bg-[url('/nexus-city.png')] bg-cover bg-center bg-no-repeat transition-transform duration-[2000ms] ease-out group-hover:scale-110 opacity-70"
                />
                {/* Camada de Escurecimento e Gradiente do Tema */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-black/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-dark-card/90 via-dark-card/30 to-transparent z-10" />
            </div>

            {/* Conteúdo Overlay */}
            <div className="relative z-20 flex flex-col h-full p-6 justify-between">

                {/* Topo - Badges Cyber */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse shadow-[0_0_8px_#10B981]" />
                        <span className="text-[10px] font-bold text-gray-300 font-mono tracking-wider uppercase">Nexus Central Server</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
                        <ShieldCheck className="w-3 h-3 text-primary-lighter" />
                        <span className="text-[10px] font-bold text-primary-lighter font-mono tracking-wider uppercase">Criptografia Ativa</span>
                    </div>
                </div>

                {/* Centro - Mensagem / Slogan */}
                <div className="max-w-md mt-auto mb-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-lighter to-accent-purple tracking-tighter mb-2">
                            BEM-VINDO AO FUTURO DO SEU PATRIMÔNIO.
                        </h2>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">
                            Você está no topo da mega-metrópole financeira. O Nexus isola o ruído do mercado e foca no que importa: <span className="text-white font-bold">Acúmulo de Capital Atemporal.</span>
                        </p>
                    </motion.div>
                </div>

                {/* Rodapé - Status Simulado */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-mono uppercase mb-0.5">Operações de Rede</span>
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-accent-purple" />
                            <span className="text-sm font-bold text-white font-mono">1.482 T/s</span>
                        </div>
                    </div>

                    <div className="h-6 w-px bg-white/10" />

                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-mono uppercase mb-0.5">Fluxo de Riqueza Global</span>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-accent-green" />
                            <span className="text-sm font-bold text-accent-green font-mono">Alta Constante</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Frame Decorativo Hover */}
            <div className="absolute inset-0 border border-white/0 group-hover:border-primary/30 transition-colors duration-700 z-30 pointer-events-none" />
        </div>
    )
}
