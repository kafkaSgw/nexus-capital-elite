'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, CheckCircle2, Circle, Lock, ArrowRight, Play, Star } from 'lucide-react';
import { learningPaths, mockModules, subjects, badges, LessonModule } from '@/data/academyContent';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';

interface LearningPathsProps {
    onStartModule: (module: LessonModule) => void;
}

export default function LearningPaths({ onStartModule }: LearningPathsProps) {
    const { completedChapters, isChapterCompleted } = useAcademyProgress();
    const [selectedPath, setSelectedPath] = useState(learningPaths[0]);

    const getModuleDetails = (modId: string) => {
        return mockModules.find(m => m.id === modId);
    };

    const getPathProgress = (pathId: string) => {
        const path = learningPaths.find(p => p.id === pathId);
        if (!path) return 0;
        const completed = path.modules.filter(mId => isChapterCompleted(mId)).length;
        return (completed / path.modules.length) * 100;
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                    <Map className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-white">Jornadas Recomendas</h2>
                    <p className="text-slate-400">Trilhas guiadas passo-a-passo para atingir seus objetivos.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Lista de Trilhas (Esquerda) */}
                <div className="w-full lg:w-1/3 space-y-4">
                    {learningPaths.map(path => {
                        const prog = getPathProgress(path.id);
                        const isSelected = selectedPath.id === path.id;
                        return (
                            <div
                                key={path.id}
                                onClick={() => setSelectedPath(path)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-indigo-900/20 border-indigo-500/50 scale-105' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'}`}
                            >
                                <h3 className="font-bold text-lg text-white mb-1">{path.title}</h3>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 mt-3">
                                    <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${prog}%` }}></div>
                                </div>
                                <span className="text-xs text-slate-400">{Math.round(prog)}% Concluído</span>
                            </div>
                        );
                    })}
                </div>

                {/* Detalhe da Trilha Selecionada (Direita) */}
                <div className="w-full lg:w-2/3 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedPath.title}</h2>
                    <p className="text-slate-400 mb-6">{selectedPath.description}</p>

                    {selectedPath.rewardBadgeId && (
                        <div className="flex items-center gap-3 mb-8 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg inline-flex">
                            <Star className="h-5 w-5 text-amber-500" />
                            <span className="text-sm font-semibold text-amber-400">
                                Recompensa: Badge "{badges.find(b => b.id === selectedPath.rewardBadgeId)?.name}"
                            </span>
                        </div>
                    )}

                    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                        {selectedPath.modules.map((modId, idx) => {
                            const mod = getModuleDetails(modId);
                            const isDone = isChapterCompleted(modId);

                            // A module is unlocked if it's the first one, or the previous one is done
                            let isUnlocked = false;
                            if (idx === 0) isUnlocked = true;
                            else {
                                const prevModId = selectedPath.modules[idx - 1];
                                if (isChapterCompleted(prevModId)) isUnlocked = true;
                            }

                            if (!mod) return null;
                            const subject = subjects.find(s => s.id === mod.subjectId);

                            return (
                                <div key={modId} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-800 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow transition-all ${isDone ? 'bg-emerald-500 text-white' : isUnlocked ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-slate-500'}`}>
                                        {isDone ? <CheckCircle2 className="h-5 w-5" /> : isUnlocked ? <Play className="h-4 w-4 ml-0.5" /> : <Lock className="h-4 w-4" />}
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-xs font-bold uppercase ${subject?.color}`}>{subject?.name}</span>
                                        </div>
                                        <h3 className="font-bold text-white mb-1">{mod.title}</h3>
                                        {isUnlocked && !isDone && (
                                            <button onClick={() => onStartModule(mod)} className="mt-3 flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                                Iniciar <ArrowRight className="h-4 w-4" />
                                            </button>
                                        )}
                                        {isDone && <span className="mt-2 block text-xs font-bold text-emerald-500">Concluído</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
