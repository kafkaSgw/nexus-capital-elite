'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, AlertTriangle, TrendingUp, CheckCircle2, Clock, Flame, Target } from 'lucide-react';
import { subjects, mockModules, LessonModule } from '@/data/academyContent';

const getModulesForSubject = (subjectId: string) => mockModules.filter(m => m.subjectId === subjectId);

interface StudyHomeProps {
    completedChapters: string[];
    wrongAnswers: { question: string; subject: string }[];
    lastStudiedChapterId: string;
    lastStudiedSubjectId: string;
    xp: number;
    level: number;
    streak: number;
    onGoToChapter: (subjectId: string, module: LessonModule) => void;
    onGoToErrors: () => void;
    onGoToExam: () => void;
}

export default function StudyHome({
    completedChapters, wrongAnswers, lastStudiedChapterId, lastStudiedSubjectId,
    xp, level, streak, onGoToChapter, onGoToErrors, onGoToExam
}: StudyHomeProps) {

    const subjectProgress = useMemo(() => {
        return subjects.map(subject => {
            const modules = getModulesForSubject(subject.id);
            const completed = modules.filter((m: LessonModule) => completedChapters.includes(m.id)).length;
            const total = modules.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return { ...subject, completed, total, pct, modules };
        });
    }, [completedChapters]);

    const lastSubject = subjects.find(s => s.id === lastStudiedSubjectId);
    const lastChapterModules = lastStudiedSubjectId ? getModulesForSubject(lastStudiedSubjectId) : [];
    const lastChapter = lastChapterModules.find((m: LessonModule) => m.id === lastStudiedChapterId);

    // Suggest next chapter: first incomplete chapter of last studied subject, or first incomplete globally
    const suggestedNext = useMemo(() => {
        const targetSubjects = lastStudiedSubjectId
            ? [subjects.find(s => s.id === lastStudiedSubjectId)!, ...subjects.filter(s => s.id !== lastStudiedSubjectId)]
            : subjects;
        for (const subject of targetSubjects) {
            if (!subject) continue;
            const mods = getModulesForSubject(subject.id);
            const next = mods.find((m: LessonModule) => !completedChapters.includes(m.id));
            if (next) return { subject, module: next };
        }
        return null;
    }, [completedChapters, lastStudiedSubjectId]);

    const errorCount = wrongAnswers.length;
    const totalChapters = subjects.reduce((acc, s) => acc + getModulesForSubject(s.id).length, 0);
    const totalCompleted = completedChapters.length;
    const globalPct = totalChapters > 0 ? Math.round((totalCompleted / totalChapters) * 100) : 0;

    return (
        <div className="space-y-8">
            {/* Continue Studying Card */}
            {lastChapter && lastSubject && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">
                        <Clock className="h-4 w-4" /> Continue de onde parou
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{lastChapter.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{lastSubject.name}</p>
                    <button
                        onClick={() => onGoToChapter(lastSubject.id, lastChapter)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 text-sm"
                    >
                        Continuar <ArrowRight className="h-4 w-4" />
                    </button>
                </motion.div>
            )}

            {/* Quick Actions Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {suggestedNext && (
                    <motion.button
                        whileHover={{ y: -2 }}
                        onClick={() => onGoToChapter(suggestedNext.subject.id, suggestedNext.module)}
                        className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-left hover:border-emerald-400 transition-all"
                    >
                        <Target className="h-5 w-5 text-emerald-400 mb-2" />
                        <p className="text-xs text-emerald-400 font-bold uppercase">Próximo Capítulo</p>
                        <p className="text-sm text-white font-semibold truncate mt-1">{suggestedNext.module.title}</p>
                    </motion.button>
                )}
                {errorCount > 0 && (
                    <motion.button
                        whileHover={{ y: -2 }}
                        onClick={onGoToErrors}
                        className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-left hover:border-red-400 transition-all"
                    >
                        <AlertTriangle className="h-5 w-5 text-red-400 mb-2" />
                        <p className="text-xs text-red-400 font-bold uppercase">Erros para Revisar</p>
                        <p className="text-2xl text-white font-black mt-1">{errorCount}</p>
                    </motion.button>
                )}
                <motion.button
                    whileHover={{ y: -2 }}
                    onClick={onGoToExam}
                    className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-left hover:border-amber-400 transition-all"
                >
                    <Flame className="h-5 w-5 text-amber-400 mb-2" />
                    <p className="text-xs text-amber-400 font-bold uppercase">Simulado</p>
                    <p className="text-sm text-white font-semibold mt-1">Testar Conhecimento</p>
                </motion.button>
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                    <TrendingUp className="h-5 w-5 text-purple-400 mb-2" />
                    <p className="text-xs text-purple-400 font-bold uppercase">Progresso Global</p>
                    <p className="text-2xl text-white font-black mt-1">{globalPct}%</p>
                </div>
            </div>

            {/* Subject Progress Bars */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-400" /> Domínio por Matéria
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjectProgress.map((sp) => {
                        const colors: Record<string, string> = {
                            'com-empresarial': 'from-pink-500 to-rose-500',
                            'fund-admin': 'from-amber-500 to-orange-500',
                            'mat-aplicada': 'from-emerald-500 to-green-500',
                            'teoria-economica': 'from-blue-500 to-indigo-500',
                        };
                        const bgColors: Record<string, string> = {
                            'com-empresarial': 'bg-pink-500/10 border-pink-500/30',
                            'fund-admin': 'bg-amber-500/10 border-amber-500/30',
                            'mat-aplicada': 'bg-emerald-500/10 border-emerald-500/30',
                            'teoria-economica': 'bg-blue-500/10 border-blue-500/30',
                        };
                        return (
                            <motion.div
                                key={sp.id}
                                whileHover={{ scale: 1.01 }}
                                className={`border rounded-xl p-4 ${bgColors[sp.id] || 'bg-slate-800/40 border-slate-700/50'}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-white">{sp.name}</span>
                                    <span className="text-xs text-slate-400">{sp.completed}/{sp.total}</span>
                                </div>
                                <div className="h-2.5 bg-slate-900/80 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${sp.pct}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className={`h-full rounded-full bg-gradient-to-r ${colors[sp.id] || 'from-slate-500 to-slate-400'}`}
                                    />
                                </div>
                                {sp.pct === 100 && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400 font-bold">
                                        <CheckCircle2 className="h-3 w-3" /> Domínio Completo!
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
