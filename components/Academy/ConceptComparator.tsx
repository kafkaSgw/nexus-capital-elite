'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, ArrowLeftRight, Lightbulb, Filter } from 'lucide-react';
import { conceptComparisons, ConceptComparison } from '@/data/academyContent';

export default function ConceptComparator() {
    const [activeSubject, setActiveSubject] = useState<string>('Todas');
    const allSubjects = ['Todas', ...Array.from(new Set(conceptComparisons.map(c => c.subject)))];

    const filtered = activeSubject === 'Todas'
        ? conceptComparisons
        : conceptComparisons.filter(c => c.subject === activeSubject);

    const subjectColors: Record<string, string> = {
        'Administração': 'border-amber-500/30',
        'Teoria Econômica': 'border-blue-500/30',
        'Comunicação Empresarial': 'border-pink-500/30',
        'Matemática Aplicada': 'border-emerald-500/30',
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                    <Scale className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Comparador de Conceitos</h2>
                    <p className="text-slate-400 text-sm">Entenda as diferenças entre conceitos similares</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                {allSubjects.map(sub => (
                    <button
                        key={sub}
                        onClick={() => setActiveSubject(sub)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSubject === sub
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        {sub}
                    </button>
                ))}
            </div>

            {/* Comparison Cards */}
            <div className="space-y-6">
                {filtered.map((cmp, i) => (
                    <motion.div
                        key={cmp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`bg-slate-800/30 border rounded-2xl overflow-hidden ${subjectColors[cmp.subject] || 'border-slate-700/50'}`}
                    >
                        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cmp.subject}</span>
                            <ArrowLeftRight className="h-4 w-4 text-indigo-400" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700/50">
                            {/* Concept A */}
                            <div className="p-6">
                                <h3 className="text-xl font-black text-blue-400 mb-2">{cmp.conceptA.name}</h3>
                                <p className="text-slate-300 text-sm mb-4">{cmp.conceptA.description}</p>
                                <ul className="space-y-1.5">
                                    {cmp.conceptA.keyPoints.map((kp, j) => (
                                        <li key={j} className="text-xs text-slate-400 flex items-start gap-2">
                                            <span className="text-blue-400 mt-0.5">•</span> {kp}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Concept B */}
                            <div className="p-6">
                                <h3 className="text-xl font-black text-amber-400 mb-2">{cmp.conceptB.name}</h3>
                                <p className="text-slate-300 text-sm mb-4">{cmp.conceptB.description}</p>
                                <ul className="space-y-1.5">
                                    {cmp.conceptB.keyPoints.map((kp, j) => (
                                        <li key={j} className="text-xs text-slate-400 flex items-start gap-2">
                                            <span className="text-amber-400 mt-0.5">•</span> {kp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Verdict */}
                        <div className="px-6 py-4 bg-indigo-500/5 border-t border-slate-700/50 flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-indigo-300 font-medium">{cmp.verdict}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
