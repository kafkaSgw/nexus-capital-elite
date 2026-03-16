'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, CheckCircle2, XCircle, Trophy, BarChart3, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { mockFlashcards, Flashcard, subjects } from '@/data/academyContent';
import { mockModules } from '@/data/academyContent';

interface ExamModeProps {
    onComplete: (result: ExamResult) => void;
    onRecordWrongAnswer: (answer: { question: string; userAnswer: string; correctAnswer: string; subject: string; date: string }) => void;
    onAddXp: (xp: number) => void;
}

export interface ExamResult {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    subjectScores: Record<string, { correct: number; total: number }>;
    timeTaken: number;
    answers: { question: string; userAnswer: string; correctAnswer: string; correct: boolean; subject: string }[];
}

export default function ExamMode({ onComplete, onRecordWrongAnswer, onAddXp }: ExamModeProps) {
    const EXAM_DURATION = 60 * 60; // 60 minutes in seconds
    const QUESTION_COUNT = 20;

    const examQuestions = useMemo(() => {
        // Shuffle and pick QUESTION_COUNT questions
        const shuffled = [...mockFlashcards].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(QUESTION_COUNT, shuffled.length));
    }, []);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answers, setAnswers] = useState<{ question: string; userAnswer: string; correctAnswer: string; correct: boolean; subject: string }[]>([]);
    const [timeRemaining, setTimeRemaining] = useState(EXAM_DURATION);
    const [examFinished, setExamFinished] = useState(false);
    const [showReview, setShowReview] = useState(false);

    // Timer
    useEffect(() => {
        if (examFinished) return;
        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    finishExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [examFinished]);

    const finishExam = useCallback(() => {
        setExamFinished(true);
        const correctCount = answers.filter(a => a.correct).length;
        const score = Math.round((correctCount / examQuestions.length) * 100);

        // Subject breakdown
        const subjectScores: Record<string, { correct: number; total: number }> = {};
        answers.forEach(a => {
            if (!subjectScores[a.subject]) subjectScores[a.subject] = { correct: 0, total: 0 };
            subjectScores[a.subject].total++;
            if (a.correct) subjectScores[a.subject].correct++;
        });

        // Record wrong answers
        answers.filter(a => !a.correct).forEach(a => {
            onRecordWrongAnswer({
                question: a.question,
                userAnswer: a.userAnswer,
                correctAnswer: a.correctAnswer,
                subject: a.subject,
                date: new Date().toISOString(),
            });
        });

        const xpEarned = Math.round(score * 2);
        onAddXp(xpEarned);

        const result: ExamResult = {
            totalQuestions: examQuestions.length,
            correctAnswers: correctCount,
            score,
            subjectScores,
            timeTaken: EXAM_DURATION - timeRemaining,
            answers,
        };
        onComplete(result);
    }, [answers, examQuestions, timeRemaining, onComplete, onRecordWrongAnswer, onAddXp, EXAM_DURATION]);

    const handleAnswer = (option: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(option);
        const current = examQuestions[currentIndex];
        const isCorrect = option === current.answer;

        setAnswers(prev => [...prev, {
            question: current.question,
            userAnswer: option,
            correctAnswer: current.answer,
            correct: isCorrect,
            subject: (current as any).subject || 'Geral',
        }]);
    };

    const handleNext = () => {
        if (currentIndex >= examQuestions.length - 1) {
            finishExam();
        } else {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const currentQuestion = examQuestions[currentIndex];
    const timeWarning = timeRemaining < 300; // less than 5 min

    // Score card when finished
    if (examFinished) {
        const correctCount = answers.filter(a => a.correct).length;
        const score = Math.round((correctCount / answers.length) * 100);
        const subjectScores: Record<string, { correct: number; total: number }> = {};
        answers.forEach(a => {
            if (!subjectScores[a.subject]) subjectScores[a.subject] = { correct: 0, total: 0 };
            subjectScores[a.subject].total++;
            if (a.correct) subjectScores[a.subject].correct++;
        });

        return (
            <div className="max-w-3xl mx-auto space-y-8">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-3xl p-8 text-center"
                >
                    <Trophy className={`h-16 w-16 mx-auto mb-4 ${score >= 70 ? 'text-amber-400' : score >= 50 ? 'text-blue-400' : 'text-slate-400'}`} />
                    <h2 className="text-3xl font-black text-white mb-2">Resultado do Simulado</h2>
                    <div className={`text-6xl font-black mb-2 ${score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {score}%
                    </div>
                    <p className="text-slate-400 mb-6">
                        {correctCount}/{answers.length} acertos em {formatTime(EXAM_DURATION - timeRemaining)}
                    </p>
                    <p className="text-lg font-bold text-white mb-1">
                        {score >= 90 ? '🏆 Excelente! Especialista.' : score >= 70 ? '✅ Bom trabalho! Continue.' : score >= 50 ? '⚠️ Razoável. Revise os erros.' : '❌ Precisa estudar mais. Use o Caderno de Erros.'}
                    </p>
                </motion.div>

                {/* Subject Breakdown */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-400" /> Desempenho por Matéria
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(subjectScores).map(([subject, data]) => {
                            const pct = Math.round((data.correct / data.total) * 100);
                            return (
                                <div key={subject}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white font-semibold">{subject}</span>
                                        <span className="text-slate-400">{data.correct}/{data.total} ({pct}%)</span>
                                    </div>
                                    <div className="h-2 bg-slate-900/80 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Review Answers */}
                <button
                    onClick={() => setShowReview(!showReview)}
                    className="w-full bg-slate-800 border border-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-all"
                >
                    {showReview ? 'Esconder' : 'Ver'} Gabarito Comentado
                </button>

                <AnimatePresence>
                    {showReview && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                            {answers.map((a, i) => (
                                <div key={i} className={`border rounded-xl p-4 ${a.correct ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                    <div className="flex items-start gap-2">
                                        {a.correct ? <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" /> : <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />}
                                        <div>
                                            <p className="text-white font-semibold text-sm mb-1">{i + 1}. {a.question}</p>
                                            {!a.correct && (
                                                <>
                                                    <p className="text-red-400 text-xs">Sua resposta: {a.userAnswer}</p>
                                                    <p className="text-emerald-400 text-xs">Correta: {a.correctAnswer}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Timer + Progress Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400 font-bold">Questão {currentIndex + 1}/{examQuestions.length}</span>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${timeWarning ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-white'}`}>
                    <Clock className="h-4 w-4" /> {formatTime(timeRemaining)}
                </div>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full mb-8 overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    animate={{ width: `${((currentIndex + 1) / examQuestions.length) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8"
                >
                    {currentQuestion && (currentQuestion as any).subject && (
                        <span className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-3 block">{(currentQuestion as any).subject}</span>
                    )}
                    <h3 className="text-xl font-bold text-white mb-6">{currentQuestion.question}</h3>
                    <div className="space-y-3">
                        {currentQuestion.options.map((option) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrect = option === currentQuestion.answer;
                            const showResult = selectedAnswer !== null;

                            let cls = 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500';
                            if (showResult && isCorrect) cls = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300';
                            else if (showResult && isSelected && !isCorrect) cls = 'bg-red-500/10 border-red-500/50 text-red-300';

                            return (
                                <button
                                    key={option}
                                    onClick={() => handleAnswer(option)}
                                    disabled={showResult}
                                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all text-sm font-medium ${cls}`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>

                    {selectedAnswer && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex justify-end">
                            <button
                                onClick={handleNext}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 text-sm"
                            >
                                {currentIndex >= examQuestions.length - 1 ? 'Finalizar Prova' : 'Próxima'} <ArrowRight className="h-4 w-4" />
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
