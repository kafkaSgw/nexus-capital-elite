'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, TrendingUp, TrendingDown, AlertTriangle, ChevronRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { CaseStudy, CaseStudyChoice } from '@/data/academyContent';

interface CaseSimulatorProps {
    caseStudy: CaseStudy;
    onComplete: (gainedXp: number, impact: any) => void;
    onRequestAI: (context: any) => void;
}

export default function CaseSimulator({ caseStudy, onComplete, onRequestAI }: CaseSimulatorProps) {
    const [activeCase, setActiveCase] = useState<CaseStudy>(caseStudy);
    const [selectedChoice, setSelectedChoice] = useState<CaseStudyChoice | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [totalEarnedXp, setTotalEarnedXp] = useState(0);

    const handleSelect = (choice: CaseStudyChoice) => {
        setSelectedChoice(choice);
    };

    const calcCurrentXp = () => {
        if (!selectedChoice) return 0;
        const baseXP = 200;
        return Math.max(50, baseXP + (selectedChoice.impact.revenue * 2) + selectedChoice.impact.cashflow);
    };

    const handleComplete = () => {
        if (selectedChoice) {
            onComplete(totalEarnedXp + calcCurrentXp(), selectedChoice.impact);
        }
    };

    const generateMore = async () => {
        if (!selectedChoice) return;
        setTotalEarnedXp(prev => prev + calcCurrentXp());
        setIsGenerating(true);
        try {
            const res = await fetch('/api/academy/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'case_study' })
            });
            if (res.ok) {
                const newCase = await res.json();
                setActiveCase(newCase);
                setSelectedChoice(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">

            {/* HUD do Caso */}
            <div className="flex flex-wrap items-center justify-between bg-slate-800/80 border border-slate-700 p-4 rounded-xl mb-6 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                        <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">{activeCase.title} {isGenerating ? '(Gerando...)' : ''}</h2>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                            Indústria: {activeCase.industry}
                        </span>
                    </div>
                </div>

                <div className={`px-3 py-1 mt-2 sm:mt-0 rounded-full text-xs font-bold border uppercase tracking-wider
          ${activeCase.difficulty === 'avancado' ? 'text-rose-400 border-rose-400/30 bg-rose-400/10' :
                        activeCase.difficulty === 'intermediario' ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' :
                            'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'}`}
                >
                    Nível: {activeCase.difficulty}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Scenario Description */}
                <div className="lg:col-span-8">
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm h-full">
                        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            O Cenário
                        </h3>
                        <p className="text-lg text-slate-200 leading-relaxed font-medium">
                            {activeCase.scenario}
                        </p>
                    </div>
                </div>

                {/* AI Helper Trigger */}
                <div className="lg:col-span-4 flex flex-col justify-end">
                    <button
                        onClick={() => onRequestAI({
                            type: 'case_study',
                            title: activeCase.title,
                            content: activeCase.scenario
                        })}
                        className="w-full relative group overflow-hidden bg-indigo-500/10 border border-indigo-500/30 hover:border-indigo-400 transition-all rounded-2xl p-6 text-left"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <h4 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                            <Bot className="h-5 w-5" /> Consultar IA Tensor
                        </h4>
                        <p className="text-xs text-slate-400">
                            Precisa de ajuda para analisar os dados? Chame a inteligência artificial para debater as opções.
                        </p>
                    </button>
                </div>

            </div>

            {/* Decision Board */}
            <div className="mt-8 space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Qual a sua decisão como investidor?</h3>

                <div className="grid grid-cols-1 gap-4">
                    {activeCase.choices.map((choice) => {
                        const isSelected = selectedChoice?.id === choice.id;
                        const isDisabled = selectedChoice !== null && !isSelected;

                        return (
                            <motion.button
                                key={choice.id}
                                whileHover={selectedChoice === null ? { scale: 1.01 } : {}}
                                whileTap={selectedChoice === null ? { scale: 0.99 } : {}}
                                onClick={() => handleSelect(choice)}
                                disabled={selectedChoice !== null}
                                className={`text-left w-full p-6 rounded-2xl border transition-all duration-300
                  ${isSelected ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                                        isDisabled ? 'bg-slate-800/30 border-slate-800 text-slate-500 opacity-50' :
                                            'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-200'}`}
                            >
                                <div className="flex items-start justify-between">
                                    <span className="text-base md:text-lg font-medium pr-4">{choice.option}</span>
                                    {isSelected && <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />}
                                </div>

                                {/* Outcome Display (Revealed only if selected) */}
                                <AnimatePresence>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-6 border-t border-emerald-500/20">
                                                {/* Status Impact */}
                                                <div className="flex flex-wrap gap-4 mb-6">
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-slate-900/50 
                            ${choice.impact.revenue > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {choice.impact.revenue > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                        Receita {choice.impact.revenue > 0 ? '+' : ''}{choice.impact.revenue}%
                                                    </div>
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-slate-900/50 
                            ${choice.impact.cashflow > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {choice.impact.cashflow > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                        Caixa {choice.impact.cashflow > 0 ? '+' : ''}{choice.impact.cashflow}%
                                                    </div>
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-slate-900/50 
                            ${choice.impact.risk < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {choice.impact.risk < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                                                        Risco {choice.impact.risk > 0 ? '+' : ''}{choice.impact.risk}%
                                                    </div>
                                                </div>

                                                {/* Story Outcome */}
                                                <div className="mb-6 p-4 bg-slate-900/40 rounded-xl border border-slate-700/50">
                                                    <p className="text-slate-200 italic">"{choice.outcomeText}"</p>
                                                </div>

                                                {/* AI Explanation of the mechanism */}
                                                <div className="p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl relative">
                                                    <Bot className="absolute top-5 left-5 h-5 w-5 text-indigo-400" />
                                                    <div className="pl-8">
                                                        <h4 className="text-indigo-400 font-bold mb-2 text-sm">Análise do Mentor IA</h4>
                                                        <p className="text-slate-300 text-sm leading-relaxed">
                                                            {choice.aiExplanation}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                                                    <button
                                                        onClick={handleComplete}
                                                        className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                                                    >
                                                        Sair com {totalEarnedXp + calcCurrentXp()} XP
                                                    </button>
                                                    <button
                                                        onClick={generateMore}
                                                        disabled={isGenerating}
                                                        className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                                                    >
                                                        {isGenerating ? 'Criando IA...' : 'Resolver Novo Caso ✨'}
                                                        <ChevronRight className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}

// Inline definition needed since it's missing in imports above
function Bot(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
        </svg>
    )
}
