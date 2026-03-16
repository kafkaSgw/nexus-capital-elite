'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, Target, ChevronLeft, ChevronRight, BrainCircuit, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { mockFlashcards, subjects, Flashcard } from '@/data/academyContent';

interface QuestionLibraryProps {
    onPractice?: (subjectId?: string) => void;
}

const ITEMS_PER_PAGE = 10;

export default function QuestionLibrary({ onPractice }: QuestionLibraryProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

    // Filtragem avançada
    const filteredCards = useMemo(() => {
        return mockFlashcards.filter((card) => {
            const matchesSearch = card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.teaching.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSubject = selectedSubject === 'all' || card.subject === selectedSubject;
            const matchesDifficulty = selectedDifficulty === 'all' || card.difficulty === selectedDifficulty;

            return matchesSearch && matchesSubject && matchesDifficulty;
        });
    }, [searchTerm, selectedSubject, selectedDifficulty]);

    // Paginação
    const totalPages = Math.max(1, Math.ceil(filteredCards.length / ITEMS_PER_PAGE));
    const paginatedCards = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCards.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCards, currentPage]);

    // Reseta a página quando os filtros mudam
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedSubject, selectedDifficulty]);

    return (
        <div className="w-full">
            {/* ─── HEADER ─── */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-rose-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-white">Banco Central de Questões</h2>
                        <p className="text-slate-400">Acesse, filtre e estude todos os flashcards e conceitos do material.</p>
                    </div>
                </div>

                <div className="mt-4 md:mt-0 flex items-center gap-4">
                    <div className="px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Questões Totais</span>
                        <div className="text-xl font-bold text-rose-400">{mockFlashcards.length}</div>
                    </div>
                    {onPractice && (
                        <button
                            onClick={() => onPractice(selectedSubject !== 'all' ? selectedSubject : undefined)}
                            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-600/20 hover:scale-105"
                        >
                            <Play className="h-5 w-5" />
                            Modo Infinito
                        </button>
                    )}
                </div>
            </div>

            {/* ─── CONTROLES DE FILTRO ─── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
                {/* Search */}
                <div className="md:col-span-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por palavras-chave na pergunta ou explicação..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-rose-500 transition-colors"
                    />
                </div>

                {/* Subject Filter */}
                <div className="md:col-span-3 relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white appearance-none focus:outline-none focus:border-rose-500 transition-colors"
                    >
                        <option value="all">Todas as Matérias</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                {/* Difficulty Filter */}
                <div className="md:col-span-3 relative">
                    <BrainCircuit className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white appearance-none focus:outline-none focus:border-rose-500 transition-colors"
                    >
                        <option value="all">Todas as Dificuldades</option>
                        <option value="iniciante">Iniciante</option>
                        <option value="intermediario">Intermediário</option>
                        <option value="avancado">Avançado</option>
                    </select>
                </div>
            </div>

            {/* ─── LISTA DE QUESTÕES ─── */}
            <div className="space-y-4 mb-8">
                <AnimatePresence mode="popLayout">
                    {paginatedCards.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center"
                        >
                            <Target className="h-12 w-12 text-slate-500 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold text-white mb-2">Nenhuma questão encontrada</h3>
                            <p className="text-slate-400">Tente ajustar seus filtros ou termos de busca.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedSubject('all'); setSelectedDifficulty('all'); }}
                                className="mt-6 text-rose-400 hover:text-rose-300 font-bold text-sm"
                            >
                                Limpar Filtros
                            </button>
                        </motion.div>
                    ) : (
                        paginatedCards.map((card, idx) => {
                            const isExpanded = expandedCardId === card.id;
                            const subject = subjects.find(s => s.id === card.subject);

                            return (
                                <motion.div
                                    key={card.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className={`bg-slate-800/40 border rounded-2xl overflow-hidden transition-all ${isExpanded ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-slate-700/50 hover:border-slate-600'}`}
                                >
                                    {/* Card Header (Always visible) */}
                                    <div
                                        onClick={() => setExpandedCardId(isExpanded ? null : card.id)}
                                        className="p-5 cursor-pointer flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {subject && (
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-900 border ${subject.borderColor} ${subject.color}`}>
                                                        {subject.name}
                                                    </span>
                                                )}
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${card.difficulty === 'iniciante' ? 'text-emerald-400' :
                                                    card.difficulty === 'intermediario' ? 'text-amber-400' : 'text-red-400'
                                                    }`}>
                                                    {card.difficulty}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white leading-snug pr-4">
                                                {card.question}
                                            </h3>
                                        </div>
                                        <div className="shrink-0">
                                            <button className="text-sm font-bold text-rose-400 hover:text-white transition-colors bg-rose-500/10 px-4 py-2 rounded-lg">
                                                {isExpanded ? 'Ocultar Resposta' : 'Ver Resposta'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-slate-700/50 bg-slate-900/50"
                                            >
                                                <div className="p-5 space-y-6">
                                                    {/* Options */}
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Alternativas</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {card.options.map((opt, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`p-3 rounded-lg border text-sm font-medium ${opt === card.answer
                                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                                        : 'bg-slate-800 border-slate-700 text-slate-300'
                                                                        }`}
                                                                >
                                                                    {opt === card.answer && <CheckCircle2 className="inline h-4 w-4 mr-2 -mt-0.5" />}
                                                                    {opt}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Teaching Explanation */}
                                                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                                        <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <Sparkles className="h-4 w-4" /> Explicação do Professor
                                                        </h4>
                                                        <p className="text-slate-300 leading-relaxed text-sm">
                                                            {card.teaching}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* ─── PAGINAÇÃO ─── */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-bold text-slate-400">
                        Página <span className="text-white">{currentPage}</span> de {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
