'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, RefreshCcw, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { WrongAnswer } from '@/hooks/useAcademyProgress';

interface ErrorReviewProps {
    wrongAnswers: WrongAnswer[];
    onClearErrors: (subject?: string) => void;
    onPractice: (subject: string) => void;
}

export default function ErrorReview({ wrongAnswers, onClearErrors, onPractice }: ErrorReviewProps) {
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

    const groupedBySubject = useMemo(() => {
        const groups: Record<string, WrongAnswer[]> = {};
        wrongAnswers.forEach(w => {
            if (!groups[w.subject]) groups[w.subject] = [];
            groups[w.subject].push(w);
        });
        return groups;
    }, [wrongAnswers]);

    const subjectKeys = Object.keys(groupedBySubject).sort();

    if (wrongAnswers.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Nenhum erro registrado!</h2>
                <p className="text-slate-400">Continue estudando e suas respostas erradas aparecerão aqui para revisão.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-red-400" /> Caderno de Erros
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">{wrongAnswers.length} erros registrados em {subjectKeys.length} matéria(s)</p>
                </div>
                <button
                    onClick={() => onClearErrors()}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-bold px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all"
                >
                    <Trash2 className="h-3 w-3" /> Limpar Tudo
                </button>
            </div>

            {subjectKeys.map(subject => {
                const errors = groupedBySubject[subject];
                const isExpanded = expandedSubject === subject;

                return (
                    <motion.div
                        key={subject}
                        layout
                        className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden"
                    >
                        <button
                            onClick={() => setExpandedSubject(isExpanded ? null : subject)}
                            className="w-full flex items-center justify-between p-5 hover:bg-slate-800/60 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                                    <XCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-bold">{subject}</p>
                                    <p className="text-xs text-slate-400">{errors.length} erro(s)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onPractice(subject); }}
                                    className="bg-amber-500/20 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1"
                                >
                                    <RefreshCcw className="h-3 w-3" /> Praticar
                                </button>
                                {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                            </div>
                        </button>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-5 pb-5 space-y-3">
                                        {errors.map((err, i) => (
                                            <div key={i} className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                                                <p className="text-white text-sm font-semibold mb-2">{err.question}</p>
                                                <div className="flex gap-4 text-xs">
                                                    <span className="text-red-400">Respondeu: {err.userAnswer}</span>
                                                    <span className="text-emerald-400">Correta: {err.correctAnswer}</span>
                                                </div>
                                                <p className="text-slate-500 text-xs mt-1">{new Date(err.date).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
}
