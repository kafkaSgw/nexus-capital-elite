'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, Brain, ChevronRight, Sparkles, Play, Pause, Volume2 } from 'lucide-react';
import { Flashcard } from '@/data/academyContent';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';

interface FlashcardQuizProps {
    cards: Flashcard[];
    onComplete: (gainedXp: number) => void;
    hideInfiniteButton?: boolean;
    moduleContent?: string;
    infiniteMode?: boolean; // NEW: se ativado, vira Endless Drilling
}

export default function FlashcardQuiz({ cards, onComplete, hideInfiniteButton = false, moduleContent, infiniteMode = false }: FlashcardQuizProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [earnedXp, setEarnedXp] = useState(0);
    const [activeCards, setActiveCards] = useState<Flashcard[]>(cards);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const { recordWrongAnswer, updateSrsCard, srsData } = useAcademyProgress();

    const currentCard = activeCards[currentIndex];
    // Simple check to prevent errors if cards array is empty
    if (!currentCard) return null;

    const handleSelect = (option: string) => {
        if (selectedAnswer !== null) return; // Prevent changing answer after selection

        setSelectedAnswer(option);
        const correct = option === currentCard.answer;
        setIsCorrect(correct);

        // --- NEW: SRS & Error tracking ---
        updateSrsCard(currentCard.id, correct);
        if (!correct) {
            recordWrongAnswer({
                question: currentCard.question,
                userAnswer: option,
                correctAnswer: currentCard.answer,
                subject: currentCard.subject || 'Geral',
                date: new Date().toISOString()
            });
        }

        if (correct) {
            setEarnedXp(prev => prev + 50); // MOCK: 50 XP per correct daily pill
        }
    };

    const handleNext = () => {
        if (currentIndex < activeCards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setIsPlaying(false);
        } else {
            onComplete(earnedXp);
        }
    };

    const generateMore = async () => {
        if (infiniteMode) {
            // Em Modo Infinito do Banco de Questões, priorizamos perguntas que precisam ser revisadas hoje (SRS)
            setIsGenerating(true);
            setTimeout(() => {
                const today = new Date().toISOString().split('T')[0];

                // Prioritize due cards
                const dueCards = cards.filter(c => {
                    const data = srsData[c.id];
                    return !data || data.nextReview <= today;
                });

                // Pick from due cards first. If none due, pick any random card to keep the drilling going
                const pool = dueCards.length > 0 ? dueCards : cards;
                const nextCard = pool[Math.floor(Math.random() * pool.length)];

                setActiveCards(prev => [...prev, nextCard]);
                setCurrentIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setIsCorrect(null);
                setIsPlaying(false);
                setIsGenerating(false);
            }, 600); // Simulando leve delay de "geração"
            return;
        }

        setIsGenerating(true);
        try {
            let newCard = null;

            if (moduleContent) {
                // Generate quiz based on the specific chapter content
                const res = await fetch('/api/academy/quiz-masterclass', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: moduleContent })
                });
                if (res.ok) {
                    const quizArray = await res.json();
                    if (Array.isArray(quizArray) && quizArray.length > 0) {
                        // Pick one random question from the array
                        newCard = quizArray[Math.floor(Math.random() * quizArray.length)];
                    }
                }
            } else {
                // Generic generation from full study material
                const res = await fetch('/api/academy/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'flashcard' })
                });
                if (res.ok) {
                    newCard = await res.json();
                }
            }

            if (newCard && newCard.question && newCard.options) {
                setActiveCards(prev => [...prev, newCard]);
                setCurrentIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setIsCorrect(null);
                setIsPlaying(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const difficultyColors = {
        'iniciante': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        'intermediario': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        'avancado': 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Brain className="h-6 w-6 text-amber-500" />
                    Pílula Diária {currentIndex + 1} {activeCards.length > cards.length ? '(Infinita)' : `/${activeCards.length}`}
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${difficultyColors[currentCard.difficulty]}`}>
                    {currentCard.difficulty}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentCard.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-slate-800/80 border border-slate-700 p-6 md:p-8 rounded-2xl shadow-xl"
                >
                    <p className="text-xl md:text-2xl font-medium text-white mb-8 leading-relaxed">
                        {currentCard.question}
                    </p>

                    <div className="space-y-3">
                        {currentCard.options.map((option, idx) => {
                            const isSelected = selectedAnswer === option;
                            const isActualAnswer = option === currentCard.answer;

                            let styleClass = "bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 cursor-pointer text-slate-200";

                            if (selectedAnswer !== null) {
                                if (isActualAnswer) {
                                    styleClass = "bg-emerald-500/20 border-emerald-500 text-emerald-100 cursor-default";
                                } else if (isSelected && !isCorrect) {
                                    styleClass = "bg-rose-500/20 border-rose-500 text-rose-100 cursor-default line-through opacity-70";
                                } else {
                                    styleClass = "bg-slate-800/50 border-slate-700 text-slate-500 cursor-default opacity-50";
                                }
                            }

                            return (
                                <motion.button
                                    key={idx}
                                    whileHover={selectedAnswer === null ? { scale: 1.01, x: 4 } : {}}
                                    whileTap={selectedAnswer === null ? { scale: 0.99 } : {}}
                                    onClick={() => handleSelect(option)}
                                    disabled={selectedAnswer !== null}
                                    className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${styleClass}`}
                                >
                                    <span className="font-medium">{option}</span>
                                    {selectedAnswer !== null && isActualAnswer && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                                    {selectedAnswer !== null && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-400" />}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Ensinamento (Teaching Focus) - Reveal after answer */}
                    <AnimatePresence>
                        {selectedAnswer !== null && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl relative">
                                    <Lightbulb className="absolute top-6 left-6 h-6 w-6 text-amber-500" />
                                    <div className="pl-10">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-amber-500 font-bold mb-2 md:mb-0">O Ensinamento</h4>
                                            <button
                                                onClick={() => setIsPlaying(!isPlaying)}
                                                className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border border-amber-500/30"
                                            >
                                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                {isPlaying ? 'Pausar Áudio' : 'Ouvir Pílula'}
                                                {isPlaying && <Volume2 className="h-4 w-4 ml-1 animate-pulse" />}
                                            </button>
                                        </div>
                                        <p className="text-slate-300 leading-relaxed mt-2 md:mt-0">
                                            {currentCard.teaching}
                                        </p>
                                    </div>
                                </div>

                                {/* AI Tutor Integration Button */}
                                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <button className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20">
                                        <Sparkles className="h-4 w-4" />
                                        Aprofundar com a IA Tutor
                                    </button>

                                    {currentIndex === activeCards.length - 1 ? (
                                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={onComplete.bind(null, earnedXp)}
                                                className="flex-1 sm:flex-none items-center justify-center gap-2 bg-slate-800 text-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors"
                                            >
                                                Sair ({earnedXp} XP)
                                            </button>
                                            {(!hideInfiniteButton) && (
                                                <button
                                                    onClick={generateMore}
                                                    disabled={isGenerating}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors disabled:opacity-50"
                                                >
                                                    {isGenerating ? (infiniteMode ? 'Buscando...' : 'Criando IA...') : (infiniteMode ? 'Próxima Pílula 🔁' : 'Gerar Nova Pílula Infinita ✨')}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleNext}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-white transition-colors"
                                        >
                                            Próxima Pílula
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
