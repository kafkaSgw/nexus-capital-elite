'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, Pause, RotateCcw, Coffee, Brain, X } from 'lucide-react';

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export default function PomodoroTimer() {
    const [isOpen, setIsOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'work' | 'break'>('work');
    const [sessionsCompleted, setSessionsCompleted] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            // Timer finished
            if (mode === 'work') {
                setSessionsCompleted(prev => prev + 1);
                setMode('break');
                setTimeLeft(BREAK_TIME);
                new Audio('/notification.mp3').play().catch(() => { }); // Optional sound
            } else {
                setMode('work');
                setTimeLeft(WORK_TIME);
                setIsActive(false);
                new Audio('/notification.mp3').play().catch(() => { });
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, mode]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setMode('work');
        setTimeLeft(WORK_TIME);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = mode === 'work'
        ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100
        : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

    const modalContent = (
        <div className="fixed bottom-6 left-6 z-40">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="bg-slate-900 border border-slate-700/50 shadow-2xl shadow-black/50 rounded-2xl p-5 w-72 mb-4"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                {mode === 'work' ? <Brain className="h-4 w-4 text-emerald-400" /> : <Coffee className="h-4 w-4 text-amber-400" />}
                                {mode === 'work' ? 'Modo Foco' : 'Descanso'}
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="relative flex justify-center items-center py-6">
                            {/* Circular Progress Ring */}
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle
                                    cx="64" cy="64" r="60"
                                    stroke="currentColor" strokeWidth="6" fill="transparent"
                                    className="text-slate-800"
                                />
                                <circle
                                    cx="64" cy="64" r="60"
                                    stroke="currentColor" strokeWidth="6" fill="transparent"
                                    strokeDasharray={60 * 2 * Math.PI}
                                    strokeDashoffset={60 * 2 * Math.PI - (progress / 100) * (60 * 2 * Math.PI)}
                                    className={`transition-all duration-1000 ${mode === 'work' ? 'text-emerald-500' : 'text-amber-500'}`}
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-mono font-bold text-white tracking-widest">{formatTime(timeLeft)}</span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-3 mt-4">
                            <button
                                onClick={toggleTimer}
                                className={`p-3 rounded-full flex items-center justify-center transition-colors ${isActive
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                    }`}
                            >
                                {isActive ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                            </button>
                            <button
                                onClick={resetTimer}
                                className="p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                                <RotateCcw className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-500 font-medium">
                            <span>Ciclos Concluídos:</span>
                            <span className="text-emerald-400">{sessionsCompleted} 🔥</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setIsOpen(true)}
                        className={`group flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg border transition-all hover:scale-105 ${isActive
                            ? (mode === 'work' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400')
                            : 'bg-slate-800/80 border-slate-700 text-slate-300'
                            }`}
                    >
                        {mode === 'work' ? <Brain className={`h-5 w-5 ${isActive && 'animate-pulse'}`} /> : <Coffee className="h-5 w-5 animate-pulse" />}
                        <span className="font-mono font-bold">
                            {formatTime(timeLeft)}
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );

    if (typeof document === 'undefined') return null;
    return createPortal(modalContent, document.body);
}
