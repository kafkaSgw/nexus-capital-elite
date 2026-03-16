'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, BrainCircuit, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { LessonModule, Flashcard } from '@/data/academyContent';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import FlashcardQuiz from './FlashcardQuiz';

interface ModulePlayerProps {
    module: LessonModule;
    onComplete: (gainedXp: number) => void;
    onRequestAI: (context: any) => void;
}

export default function ModulePlayer({ module, onComplete, onRequestAI }: ModulePlayerProps) {
    const [quizCards, setQuizCards] = useState<Flashcard[] | null>(null);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [isZenMode, setIsZenMode] = useState(false);

    const { setLastStudied } = useAcademyProgress();

    React.useEffect(() => {
        if (module) {
            setLastStudied(module.subjectId, module.id);
        }
    }, [module, setLastStudied]);

    const handleGenerateQuiz = async () => {
        setIsGeneratingQuiz(true);
        try {
            const res = await fetch('/api/academy/quiz-masterclass', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: module.content })
            });
            if (res.ok) {
                const quiz = await res.json();
                setQuizCards(quiz);
            } else {
                // If it fails, fallback to standard completion
                onComplete(module.xpReward);
            }
        } catch (error) {
            console.error(error);
            onComplete(module.xpReward); // fallback
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    // A simple markdown-ish parser to render headers and bold text since the content is a string
    const renderContent = (content: string) => {
        return content.split('\n').map((line, idx) => {
            let parsedLine = line.trim();

            if (!parsedLine) return <br key={idx} />;

            // Header H2
            if (parsedLine.startsWith('## ')) {
                return <h2 key={idx} className="text-2xl font-bold text-blue-400 mt-6 mb-4">{parsedLine.replace('## ', '')}</h2>;
            }

            // Bold text `**text**` to <strong>
            const boldRegex = /\*\*(.*?)\*\*/g;
            const parts = [];
            let lastIndex = 0;
            let match;

            while ((match = boldRegex.exec(parsedLine)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(parsedLine.substring(lastIndex, match.index));
                }
                parts.push(<strong key={match.index} className="text-white bg-blue-900/30 px-1 rounded">{match[1]}</strong>);
                lastIndex = match.index + match[0].length;
            }
            if (lastIndex < parsedLine.length) {
                parts.push(parsedLine.substring(lastIndex));
            }

            // Check if it's a list item
            if (parsedLine.startsWith('- ') || /^\d+\./.test(parsedLine)) {
                return <div key={idx} className="ml-4 mb-2 text-slate-300 flex"><span className="mr-2">•</span> <div>{parts.length > 0 ? parts : parsedLine}</div></div>;
            }

            return <p key={idx} className="mb-4 text-slate-300 leading-relaxed text-lg">{parts.length > 0 ? parts : parsedLine}</p>;
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto">

            {/* Header do Módulo */}
            <div className="bg-blue-600/10 border border-blue-500/30 p-6 md:p-8 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-500/20 p-3 rounded-xl">
                        <BookOpen className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                        <span className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-1 block">Área de Leitura e Masterclass</span>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white">{module.title}</h1>
                        <p className="text-slate-400 mt-2">{module.description}</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsZenMode(!isZenMode)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700 whitespace-nowrap"
                >
                    {isZenMode ? (
                        <><Minimize2 className="h-4 w-4" /> Sair do Modo Zen</>
                    ) : (
                        <><Maximize2 className="h-4 w-4" /> Modo Zen</>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 transition-all duration-300">
                {/* Main Content Reading Area */}
                <div className={`transition-all duration-300 ${isZenMode ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/40 border border-slate-700/50 p-6 md:p-10 rounded-3xl"
                    >
                        {quizCards ? (
                            <div className="mt-4">
                                <h2 className="text-2xl font-bold mb-6 text-emerald-400">Teste de Fixação - IA</h2>
                                <p className="text-slate-400 mb-8">Nossa Inteligência Artificial criou estas perguntas com base no texto que você acabou de ler. Vamos ver o que você reteve.</p>
                                <FlashcardQuiz
                                    cards={quizCards}
                                    onComplete={(quizXp) => {
                                        onComplete(module.xpReward + quizXp);
                                    }}
                                    hideInfiniteButton={false}
                                    moduleContent={module.content}
                                />
                            </div>
                        ) : (
                            <>
                                {renderContent(module.content)}

                                <div className="mt-12 pt-8 border-t border-slate-700/50 flex justify-end">
                                    <button
                                        onClick={handleGenerateQuiz}
                                        disabled={isGeneratingQuiz}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isGeneratingQuiz ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                        {isGeneratingQuiz ? 'IA Processando Teste...' : 'Concluir e Testar Conhecimentos'}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Sidebar IA (Hidden in Zen Mode) */}
                <AnimatePresence>
                    {!isZenMode && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="lg:col-span-4"
                        >
                            <div className="sticky top-24">
                                <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-2xl">
                                    <h3 className="text-indigo-400 font-bold mb-3 flex items-center gap-2">
                                        <BrainCircuit className="h-5 w-5" />
                                        Precisa de Ajuda?
                                    </h3>
                                    <p className="text-sm text-slate-400 mb-6">
                                        Sempre que encontrar um termo confuso sobre <strong>{module.title}</strong> durante a leitura, chame o Tutor de IA. Ele irá adaptar a explicação para o seu nível de experiência atual.
                                    </p>
                                    <button
                                        onClick={() => onRequestAI({ type: 'module', title: module.title, content: module.content })}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        Falar com Tutor de IA
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
