'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookA, Search, Filter, BookOpen, Quote, ChevronRight, Hash, X } from 'lucide-react';
import { dictionaryTerms, DictionaryTerm } from '@/data/academyContent';

export default function NexusDictionary() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('Todas');
    const [selectedTerm, setSelectedTerm] = useState<DictionaryTerm | null>(null);

    const categories = ['Todas', ...Array.from(new Set(dictionaryTerms.map(t => t.category)))];

    const filteredTerms = useMemo(() => {
        return dictionaryTerms.filter(term => {
            const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                term.definition.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'Todas' || term.category === activeCategory;
            return matchesSearch && matchesCategory;
        }).sort((a, b) => a.term.localeCompare(b.term));
    }, [searchTerm, activeCategory]);

    // Group alphabetically
    const groupedTerms = useMemo(() => {
        const groups: Record<string, DictionaryTerm[]> = {};
        filteredTerms.forEach(term => {
            const firstLetter = term.term.charAt(0).toUpperCase();
            if (!groups[firstLetter]) groups[firstLetter] = [];
            groups[firstLetter].push(term);
        });
        return groups;
    }, [filteredTerms]);

    const handleTermClick = (term: DictionaryTerm) => {
        setSelectedTerm(term);
    };

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-700/50">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
                        <BookA className="h-6 w-6 text-violet-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-white">Dicionário Nexus</h2>
                        <p className="text-slate-400">Compreenda o vocabulário dos grandes investidores.</p>
                    </div>
                </div>

                <div className="flex bg-slate-800/80 border border-slate-700 rounded-xl p-1 overflow-x-auto flex-nowrap w-full md:w-auto hide-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 font-medium text-sm rounded-lg whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-8 flex-col md:flex-row">

                {/* Lateral Esquerda - Lista */}
                <div className={`w-full md:w-1/3 flex-col bg-slate-800/30 border border-slate-700/50 rounded-2xl shrink-0 ${selectedTerm ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar termos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-[60vh] p-4 space-y-6 custom-scrollbar">
                        {Object.keys(groupedTerms).sort().length === 0 ? (
                            <div className="text-center text-slate-500 py-10">
                                Nenhum termo encontrado.
                            </div>
                        ) : (
                            Object.keys(groupedTerms).sort().map(letter => (
                                <div key={letter}>
                                    <div className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10 px-2 py-1 flex items-center gap-2 text-violet-400 font-black mb-2 rounded-md">
                                        {letter}
                                    </div>
                                    <div className="space-y-1">
                                        {groupedTerms[letter].map(term => (
                                            <button
                                                key={term.id}
                                                onClick={() => handleTermClick(term)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center group ${selectedTerm?.id === term.id ? 'bg-violet-500/20 text-violet-200 font-bold border border-violet-500/30' : 'text-slate-300 hover:bg-slate-700/50 border border-transparent hover:border-slate-700'}`}
                                            >
                                                <span>{term.term}</span>
                                                <ChevronRight className={`h-4 w-4 opacity-0 transition-opacity ${selectedTerm?.id === term.id ? 'opacity-100 text-violet-400' : 'group-hover:opacity-100 text-slate-500'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Área Principal - Detalhe do Termo */}
                {selectedTerm ? (
                    <div className="flex-1 min-w-0 bg-slate-900 border border-slate-700/80 rounded-2xl flex flex-col relative shadow-2xl">
                        {/* Botão de Fechar no Mobile */}
                        <button
                            className="md:hidden absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 z-20"
                            onClick={() => setSelectedTerm(null)}
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="inline-block px-3 py-1 bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-lg mb-6 border border-slate-700">
                                {selectedTerm.category}
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
                                {selectedTerm.term}
                            </h2>

                            <div className="prose prose-invert max-w-none">
                                <div className="text-xl text-slate-300 leading-relaxed font-medium mb-10 pl-6 border-l-4 border-violet-500">
                                    {selectedTerm.definition}
                                </div>

                                {selectedTerm.example && (
                                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 mb-10 relative">
                                        <Quote className="absolute top-4 left-4 h-8 w-8 text-slate-700 opacity-50" />
                                        <h4 className="flex items-center gap-2 text-violet-400 font-bold mb-3 pl-10">
                                            <BookOpen className="h-4 w-4" /> Exemplo Prático
                                        </h4>
                                        <p className="text-slate-300 pl-10 text-lg">
                                            {selectedTerm.example}
                                        </p>
                                    </div>
                                )}

                                {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                                            <Hash className="h-4 w-4" /> Termos Relacionados
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTerm.relatedTerms.map(rt => {
                                                const relatedTermData = dictionaryTerms.find(t => t.term === rt || t.term.includes(rt));
                                                return (
                                                    <button
                                                        key={rt}
                                                        onClick={() => relatedTermData && setSelectedTerm(relatedTermData)}
                                                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${relatedTermData ? 'bg-slate-800 border-slate-700 text-violet-300 hover:border-violet-500 hover:bg-slate-800' : 'bg-slate-800/50 border-slate-700/50 text-slate-500 cursor-not-allowed'}`}
                                                        disabled={!relatedTermData}
                                                    >
                                                        {rt}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center bg-slate-900/50 border border-slate-800 rounded-2xl border-dashed">
                        <div className="text-center max-w-sm">
                            <BookA className="h-16 w-16 text-slate-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Explore o Dicionário</h3>
                            <p className="text-slate-400 text-sm">Selecione um termo na lista ao lado ou use a busca para encontrar o jargão financeiro que você deseja entender.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
