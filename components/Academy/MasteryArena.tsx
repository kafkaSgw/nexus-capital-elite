'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, CheckCircle2, XCircle, ChevronRight, Zap, Target, Loader2, Trophy, ArrowLeft } from 'lucide-react';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';

interface Scenario {
    scenario: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

interface MasteryArenaProps {
    onExit: () => void;
}

export default function MasteryArena({ onExit }: MasteryArenaProps) {
    const { addXp } = useAcademyProgress();

    const [loading, setLoading] = useState(false);
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    // Arena session stats
    const [sessionScore, setSessionScore] = useState(0);
    const [sessionQuestions, setSessionQuestions] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);

    const fetchScenario = async () => {
        setLoading(true);
        setSelectedOption(null);
        setIsCorrect(null);
        setScenario(null);

        try {
            const res = await fetch('/api/academy/generate-scenario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: 'Mercados Financeiros Globais, Valuation, Macroeconomia ou Análise Estratégica' })
            });

            if (res.ok) {
                const data = await res.json();
                setScenario(data);
            } else {
                console.error("Failed to load scenario.");
            }
        } catch (e) {
            console.error("Error fetching scenario:", e);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch first scenario
    useEffect(() => {
        if (!scenario && !loading && sessionQuestions === 0) {
            fetchScenario();
        }
    }, []);

    const handleSelectOption = (option: string) => {
        if (selectedOption !== null || !scenario) return;

        setSelectedOption(option);
        const correct = option === scenario.correctAnswer;
        setIsCorrect(correct);

        setSessionQuestions(prev => prev + 1);

        if (correct) {
            const xpGained = 150 + (currentStreak * 50); // Streak bonus
            setSessionScore(prev => prev + xpGained);
            setCurrentStreak(prev => prev + 1);
            addXp(xpGained); // Persist immediately
        } else {
            setCurrentStreak(0);
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onExit}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                        <Sword className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-white">Arena de Maestria Infinita</h2>
                        <p className="text-slate-400">Responda casos reais gerados por IA. Quanto mais você acerta, maior sua pontuação.</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 mt-4 md:mt-0 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Score da Sessão</span>
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xl">
                            <Trophy className="h-5 w-5" />
                            {sessionScore} XP
                        </div>
                    </div>
                    <div className="w-px h-10 bg-slate-700"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Combo Atual</span>
                        <div className="flex items-center gap-2 text-orange-500 font-bold text-xl">
                            <Zap className="h-5 w-5" />
                            {currentStreak}x
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20 bg-slate-800/20 rounded-2xl border border-slate-700/30"
                        >
                            <Loader2 className="h-10 w-10 text-red-500 animate-spin mb-4" />
                            <p className="text-slate-300 font-medium">Os executivos de Wall Street estão preparando o desafio...</p>
                        </motion.div>
                    )}

                    {!loading && scenario && (
                        <motion.div
                            key="scenario"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl"></div>

                            {/* Question Title/Header */}
                            <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-widest text-sm mb-6">
                                <Target className="h-5 w-5" /> Cenário {sessionQuestions + 1}
                            </div>

                            <p className="text-lg md:text-xl font-medium text-slate-200 mb-10 leading-relaxed border-l-4 border-red-500 pl-6 py-2">
                                {scenario.scenario}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                {scenario.options.map((option, idx) => {
                                    const isSelected = selectedOption === option;
                                    const isActualAnswer = option === scenario.correctAnswer;

                                    let styleClass = "bg-slate-800 hover:bg-slate-700 border-slate-600 cursor-pointer text-slate-300";

                                    if (selectedOption !== null) {
                                        if (isActualAnswer) {
                                            styleClass = "bg-emerald-500/20 border-emerald-500 text-emerald-100 cursor-default ring-2 ring-emerald-500/50";
                                        } else if (isSelected && !isCorrect) {
                                            styleClass = "bg-rose-500/20 border-rose-500 text-rose-200 cursor-default opacity-60";
                                        } else {
                                            styleClass = "bg-slate-800/30 border-slate-800 text-slate-600 cursor-default opacity-40";
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectOption(option)}
                                            disabled={selectedOption !== null}
                                            className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-center min-h-[100px] ${styleClass}`}
                                        >
                                            <span className="font-semibold text-sm md:text-base pr-8">{option}</span>

                                            {selectedOption !== null && isActualAnswer && (
                                                <div className="absolute top-4 right-4 bg-emerald-500 rounded-full p-1">
                                                    <CheckCircle2 className="h-5 w-5 text-white" />
                                                </div>
                                            )}
                                            {selectedOption !== null && isSelected && !isCorrect && (
                                                <div className="absolute top-4 right-4 bg-rose-500 rounded-full p-1">
                                                    <XCircle className="h-5 w-5 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback Section */}
                            <AnimatePresence>
                                {selectedOption !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`p-6 rounded-2xl border mb-8 ${isCorrect ? 'bg-emerald-900/20 border-emerald-800' : 'bg-slate-800/50 border-slate-700'}`}>
                                            <h4 className={`font-black text-lg mb-3 ${isCorrect ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                {isCorrect ? 'Decisão Executiva Extraordinária!' : 'Análise Incompleta'}
                                            </h4>
                                            <p className="text-slate-300 leading-relaxed font-medium">
                                                {scenario.explanation}
                                            </p>
                                        </div>

                                        <button
                                            onClick={fetchScenario}
                                            className="w-full py-4 bg-white text-slate-900 font-bold text-lg rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-white/10"
                                        >
                                            Próximo Desafio Infinito <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
