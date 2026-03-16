'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, BookOpen, Sigma, TrendingUp } from 'lucide-react';
import { formulaSheet, FormulaEntry } from '@/data/academyContent';

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
    'Funções': { icon: <Sigma className="h-4 w-4" />, color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30' },
    'Limites': { icon: <TrendingUp className="h-4 w-4" />, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/30' },
    'Derivadas': { icon: <Calculator className="h-4 w-4" />, color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/30' },
    'Otimização': { icon: <BookOpen className="h-4 w-4" />, color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/30' },
};

export default function FormulaSheet() {
    const [activeCategory, setActiveCategory] = useState<string>('Todas');
    const categories = ['Todas', 'Funções', 'Limites', 'Derivadas', 'Otimização'];

    const filtered = activeCategory === 'Todas'
        ? formulaSheet
        : formulaSheet.filter(f => f.category === activeCategory);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Fórmulas Rápidas</h2>
                    <p className="text-slate-400 text-sm">Consulta instantânea de Matemática Aplicada</p>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === cat
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Formula Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((formula, i) => {
                    const config = categoryConfig[formula.category] || categoryConfig['Funções'];
                    return (
                        <motion.div
                            key={formula.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`border rounded-2xl p-5 relative overflow-hidden ${config.bgColor}`}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className={config.color}>{config.icon}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{formula.category}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{formula.title}</h3>
                            <div className="bg-slate-900/80 rounded-xl px-4 py-3 mb-3 font-mono text-lg text-center">
                                <span className="text-emerald-300 font-bold">{formula.formula}</span>
                            </div>
                            <p className="text-slate-300 text-sm mb-2">{formula.description}</p>
                            {formula.example && (
                                <div className="bg-slate-900/40 rounded-lg px-3 py-2 text-xs text-slate-400 border border-slate-700/50">
                                    💡 <span className="text-slate-300">{formula.example}</span>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
