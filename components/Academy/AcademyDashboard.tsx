'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Target, BrainCircuit, GraduationCap, Flame, Trophy, ArrowLeft, ChevronRight, MessageSquareText, Building2, Calculator, TrendingUp, CheckCircle2, Zap, Loader2, Star, Map, LineChart, Newspaper, Sword, BookA, AlertTriangle, Scale, ClipboardList, Sparkles, Home } from 'lucide-react';
import { mockFlashcards, mockModules, mockCaseStudies, subjects, Subject, LessonModule, Flashcard, badges as mockBadges, dailyBriefingMock } from '@/data/academyContent';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';

import FlashcardQuiz from './FlashcardQuiz';
import CaseSimulator from './CaseSimulator';
import AITutor from './AITutor';
import ModulePlayer from './ModulePlayer';
import LearningPaths from './LearningPaths';
import PaperTrading from './PaperTrading';
import QuestionLibrary from './QuestionLibrary';
import NexusDictionary from './NexusDictionary';
import StudyHome from './StudyHome';
import ExamMode from './ExamMode';
import ErrorReview from './ErrorReview';
import FormulaSheet from './FormulaSheet';
import ConceptComparator from './ConceptComparator';
import PomodoroTimer from './PomodoroTimer';
import Leaderboard from './Leaderboard';

type PillarType = 'pilulas' | 'masterclass' | 'simulador' | 'trilhas' | 'paper_trading' | 'questoes' | 'dicionario' | 'erros' | 'simulado' | 'formulas' | 'comparador' | 'leaderboard' | null;
type SubView = 'subjects' | 'chapters' | 'module' | 'revision' | 'subjectCase';

export default function AcademyDashboard() {
    const [activePillar, setActivePillar] = useState<PillarType>(null);
    const [tutorContext, setTutorContext] = useState<any>(null);
    const [libraryPracticeSubject, setLibraryPracticeSubject] = useState<string | null | undefined>(undefined);

    // Masterclass sub-navigation
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedModule, setSelectedModule] = useState<LessonModule | null>(null);
    const [subView, setSubView] = useState<SubView>('subjects');

    // Revision quiz state
    const [revisionCards, setRevisionCards] = useState<Flashcard[] | null>(null);
    const [isGeneratingRevision, setIsGeneratingRevision] = useState(false);

    // Subject case state
    const [subjectCase, setSubjectCase] = useState<any>(null);
    const [isGeneratingCase, setIsGeneratingCase] = useState(false);

    // Persistent progress from localStorage
    const { xp, streak, level, completedChapters, badges, loaded, addXp, completeChapter, isChapterCompleted, wrongAnswers, lastStudiedChapterId, lastStudiedSubjectId, recordWrongAnswer, clearWrongAnswers, setLastStudied } = useAcademyProgress();

    // Achievement celebration (inline, no external dep)
    const [celebration, setCelebration] = useState<string | null>(null);
    const [prevLevel, setPrevLevel] = useState(level);
    useEffect(() => {
        if (prevLevel > 0 && level > prevLevel) {
            setCelebration(`🎉 Level UP! Você agora é Nível ${level}!`);
            setTimeout(() => setCelebration(null), 4000);
        }
        setPrevLevel(level);
    }, [level, prevLevel]);

    const bgGradient = "bg-gradient-to-br from-slate-900 via-slate-900 to-[#12100E]";

    const iconMap: Record<string, React.ElementType> = {
        MessageSquareText,
        Building2,
        Calculator,
        TrendingUp,
    };

    const getSubjectIcon = (iconName: string, className: string) => {
        const IconComponent = iconMap[iconName];
        return IconComponent ? <IconComponent className={className} /> : null;
    };

    const getModulesForSubject = (subjectId: string) => {
        return mockModules.filter(m => m.subjectId === subjectId);
    };

    const getSubjectCompletionCount = (subjectId: string) => {
        const chapters = getModulesForSubject(subjectId);
        return chapters.filter(c => isChapterCompleted(c.id)).length;
    };

    // Generate revision quiz for a subject
    const handleRevisionQuiz = async (subject: Subject) => {
        setIsGeneratingRevision(true);
        try {
            const chapters = getModulesForSubject(subject.id);
            const allContent = chapters.map(c => c.content).join('\n\n---\n\n');

            const res = await fetch('/api/academy/quiz-masterclass', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: allContent })
            });

            if (res.ok) {
                const cards = await res.json();
                if (Array.isArray(cards) && cards.length > 0) {
                    setRevisionCards(cards);
                    setSubView('revision');
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingRevision(false);
        }
    };

    // Generate case study for a specific subject
    const handleSubjectCase = async (subject: Subject) => {
        setIsGeneratingCase(true);
        try {
            const chapters = getModulesForSubject(subject.id);
            const allContent = chapters.map(c => c.content).join('\n\n---\n\n');

            const res = await fetch('/api/academy/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'case', subjectContent: allContent })
            });

            if (res.ok) {
                const caseData = await res.json();
                if (caseData && caseData.scenario) {
                    setSubjectCase(caseData);
                    setSubView('subjectCase');
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingCase(false);
        }
    };

    const resetMasterclass = () => {
        setSelectedModule(null);
        setSelectedSubject(null);
        setSubView('subjects');
        setRevisionCards(null);
        setSubjectCase(null);
    };

    if (!loaded) {
        return (
            <div className={`min-h-screen ${bgGradient} flex items-center justify-center`}>
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${bgGradient} text-slate-200 selection:bg-amber-500/30 font-sans`}>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-4">
                            <GraduationCap className="h-10 w-10 text-amber-500" />
                            Nexus Academy
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Sua jornada de conhecimento. Domine os conceitos e aplique na prática.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-800/50 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50">
                        <div className="flex flex-col items-center px-4 border-r border-slate-700">
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Seu Nível</span>
                            <div className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                <span className="text-xl font-bold text-white">Lvl {level}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center px-4 border-r border-slate-700">
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">XP Total</span>
                            <span className="text-xl font-bold text-emerald-400">{xp}</span>
                        </div>
                        <div className="flex flex-col items-center px-4 border-r border-slate-700">
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Ofensiva</span>
                            <div className="flex items-center gap-2 text-orange-500">
                                <Flame className="h-5 w-5" />
                                <span className="text-xl font-bold">{streak} d</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center px-4 border-r border-slate-700">
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Capítulos</span>
                            <span className="text-xl font-bold text-blue-400">{completedChapters.length}/{mockModules.length}</span>
                        </div>
                        <div className="flex flex-col items-center px-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setActivePillar('questoes'); resetMasterclass(); }}>
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Badges</span>
                            <div className="flex items-center gap-1 h-7">
                                {badges.length > 0 ? (
                                    badges.slice(0, 3).map(b => {
                                        const badgeData = mockBadges.find(mb => mb.id === b);
                                        return badgeData ? <Star key={b} className={`h-5 w-5 ${badgeData.color}`} /> : <Star key={b} className="h-5 w-5 text-slate-500" />;
                                    })
                                ) : (
                                    <span className="text-sm text-slate-600 font-bold">Nenhuma</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Briefing Banner */}
                {dailyBriefingMock && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border border-violet-500/30 rounded-2xl p-6 relative overflow-hidden"
                    >
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl"></div>
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                <Newspaper className="h-6 w-6 text-violet-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold text-white">Market Briefing</h3>
                                    <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Hoje</span>
                                </div>
                                <h4 className="text-lg font-semibold text-violet-200 mb-1">{dailyBriefingMock.headline}</h4>
                                <p className="text-slate-300 text-sm mb-2">{dailyBriefingMock.summary}</p>
                                <p className="text-emerald-400 text-xs font-bold leading-relaxed bg-emerald-900/20 px-3 py-1.5 rounded inline-block">
                                    Impacto: {dailyBriefingMock.impact}
                                </p>
                            </div>
                            {dailyBriefingMock.relatedSubjectId && (
                                <button
                                    onClick={() => {
                                        const subj = subjects.find(s => s.id === dailyBriefingMock.relatedSubjectId);
                                        if (subj) {
                                            setSelectedSubject(subj);
                                            setSubView('chapters');
                                            setActivePillar('masterclass');
                                        }
                                    }}
                                    className="whitespace-nowrap flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-violet-500/20"
                                >
                                    Estudar Tópico
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ─── NAVIGATION TAB BAR ─── */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                        {[
                            { key: null, label: 'Início', icon: <Home className="h-4 w-4" />, activeClass: 'bg-slate-700/50 border-slate-600/50 text-white shadow-lg' },
                            { key: 'leaderboard' as PillarType, label: 'Ranking', icon: <Trophy className="h-4 w-4" />, activeClass: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-lg shadow-yellow-500/10' },
                            { key: 'masterclass' as PillarType, label: 'Masterclasses', icon: <BookOpen className="h-4 w-4" />, activeClass: 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-lg shadow-blue-500/10' },
                            { key: 'pilulas' as PillarType, label: 'Pílulas', icon: <Target className="h-4 w-4" />, activeClass: 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/10' },
                            { key: 'simulador' as PillarType, label: 'Casos', icon: <BrainCircuit className="h-4 w-4" />, activeClass: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10' },
                            { key: 'simulado' as PillarType, label: 'Simulado', icon: <ClipboardList className="h-4 w-4" />, activeClass: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-500/10' },
                            { key: 'trilhas' as PillarType, label: 'Jornadas', icon: <Map className="h-4 w-4" />, activeClass: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10' },
                            { key: 'erros' as PillarType, label: `Erros${wrongAnswers.length > 0 ? ` (${wrongAnswers.length})` : ''}`, icon: <AlertTriangle className="h-4 w-4" />, activeClass: 'bg-red-500/20 border-red-500/50 text-red-400 shadow-lg shadow-red-500/10' },
                            { key: 'formulas' as PillarType, label: 'Fórmulas', icon: <Calculator className="h-4 w-4" />, activeClass: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10' },
                            { key: 'comparador' as PillarType, label: 'Comparador', icon: <Scale className="h-4 w-4" />, activeClass: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10' },
                            { key: 'questoes' as PillarType, label: 'Banco', icon: <Target className="h-4 w-4" />, activeClass: 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-lg shadow-rose-500/10' },
                            { key: 'dicionario' as PillarType, label: 'Dicionário', icon: <BookA className="h-4 w-4" />, activeClass: 'bg-violet-500/20 border-violet-500/50 text-violet-400 shadow-lg shadow-violet-500/10' },
                            { key: 'paper_trading' as PillarType, label: 'Mercado Sim.', icon: <LineChart className="h-4 w-4" />, activeClass: 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-lg shadow-orange-500/10' },
                        ].map((tab) => {
                            const isActive = activePillar === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => { setActivePillar(isActive ? null : tab.key); resetMasterclass(); }}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200 border shrink-0
                                        ${isActive
                                            ? tab.activeClass
                                            : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-500'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Study Home when nothing is selected */}
                    {!activePillar && (
                        <div className="mt-6">
                            <StudyHome
                                completedChapters={completedChapters}
                                wrongAnswers={wrongAnswers}
                                lastStudiedChapterId={lastStudiedChapterId}
                                lastStudiedSubjectId={lastStudiedSubjectId}
                                xp={xp}
                                level={level}
                                streak={streak}
                                onGoToChapter={(subjectId, mod) => {
                                    const subject = subjects.find(s => s.id === subjectId);
                                    if (subject) {
                                        setActivePillar('masterclass');
                                        setSelectedSubject(subject);
                                        setSelectedModule(mod);
                                        setSubView('module');
                                    }
                                }}
                                onGoToErrors={() => { setActivePillar('erros'); resetMasterclass(); }}
                                onGoToExam={() => { setActivePillar('simulado'); resetMasterclass(); }}
                            />
                        </div>
                    )}
                </div>

                {/* Dynamic Content Area */}
                <AnimatePresence mode="wait">
                    {activePillar && (
                        <motion.div
                            key={activePillar + subView + (selectedSubject?.id || '') + (selectedModule?.id || '')}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-4 pt-6 border-t border-slate-700/50"
                        >
                            {/* ─── PÍLULAS ─── */}
                            {activePillar === 'pilulas' && (
                                <FlashcardQuiz
                                    cards={mockFlashcards}
                                    onComplete={(earnedXp) => {
                                        addXp(earnedXp);
                                        setActivePillar(null);
                                    }}
                                />
                            )}

                            {/* ─── MASTERCLASS: LISTA DE MATÉRIAS ─── */}
                            {activePillar === 'masterclass' && subView === 'subjects' && (
                                <div>
                                    <div className="flex items-center gap-3 mb-8">
                                        <BookOpen className="h-7 w-7 text-blue-400" />
                                        <h2 className="text-3xl font-extrabold text-white">Suas Matérias</h2>
                                    </div>
                                    <p className="text-slate-400 mb-8 text-lg">Escolha uma matéria para estudar. Cada uma contém capítulos que você pode ler e depois testar seus conhecimentos com quizzes ilimitados.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {subjects.map((subject) => {
                                            const chapters = getModulesForSubject(subject.id);
                                            const completed = getSubjectCompletionCount(subject.id);
                                            const allDone = completed === chapters.length;
                                            return (
                                                <motion.div
                                                    key={subject.id}
                                                    whileHover={{ y: -4, scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    onClick={() => { setSelectedSubject(subject); setSubView('chapters'); }}
                                                    className={`cursor-pointer rounded-2xl p-6 border ${subject.borderColor} ${subject.bgColor} hover:shadow-lg transition-all duration-300 group`}
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className={`w-12 h-12 rounded-xl ${subject.bgColor} border ${subject.borderColor} flex items-center justify-center`}>
                                                            {getSubjectIcon(subject.icon, `h-6 w-6 ${subject.color}`)}
                                                        </div>
                                                        <span className={`text-xs font-bold uppercase tracking-widest ${subject.color}`}>
                                                            {completed}/{chapters.length} concluídos
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white mb-2">
                                                        {subject.name}
                                                    </h3>

                                                    {/* Progress bar */}
                                                    <div className="w-full bg-slate-700/50 rounded-full h-2 mb-3 mt-3">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-500 ${allDone ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${chapters.length > 0 ? (completed / chapters.length) * 100 : 0}%` }}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-slate-500">{chapters.reduce((s, c) => s + c.xpReward, 0)} XP total</span>
                                                        {allDone && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                                                        <ChevronRight className={`h-5 w-5 ${subject.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ─── CAPÍTULOS DE UMA MATÉRIA ─── */}
                            {activePillar === 'masterclass' && subView === 'chapters' && selectedSubject && (
                                <div>
                                    <button
                                        onClick={() => { setSelectedSubject(null); setSubView('subjects'); }}
                                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                                    >
                                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                        Voltar para Matérias
                                    </button>

                                    <div className={`${selectedSubject.bgColor} border ${selectedSubject.borderColor} rounded-2xl p-6 md:p-8 mb-8`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-xl ${selectedSubject.bgColor} border ${selectedSubject.borderColor} flex items-center justify-center`}>
                                                {getSubjectIcon(selectedSubject.icon, `h-7 w-7 ${selectedSubject.color}`)}
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-3xl font-extrabold text-white">{selectedSubject.name}</h2>
                                                <p className="text-slate-400 mt-1">Leia cada capítulo e faça quizzes ilimitados ao final.</p>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex flex-wrap gap-3 mt-6">
                                            <button
                                                onClick={() => handleRevisionQuiz(selectedSubject)}
                                                disabled={isGeneratingRevision}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
                                                    ${isGeneratingRevision ? 'opacity-50' : 'hover:scale-105'}
                                                    bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30`}
                                            >
                                                {isGeneratingRevision ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                                {isGeneratingRevision ? 'Gerando...' : 'Revisão Relâmpago'}
                                            </button>
                                            <button
                                                onClick={() => handleSubjectCase(selectedSubject)}
                                                disabled={isGeneratingCase}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
                                                    ${isGeneratingCase ? 'opacity-50' : 'hover:scale-105'}
                                                    bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30`}
                                            >
                                                {isGeneratingCase ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                                                {isGeneratingCase ? 'Gerando...' : 'Caso da Matéria'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {getModulesForSubject(selectedSubject.id).map((mod, idx) => {
                                            const done = isChapterCompleted(mod.id);
                                            return (
                                                <motion.div
                                                    key={mod.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.08 }}
                                                    whileHover={{ x: 8 }}
                                                    onClick={() => { setSelectedModule(mod); setSubView('module'); }}
                                                    className={`cursor-pointer border rounded-xl p-5 flex items-center justify-between gap-4 group transition-all
                                                        ${done
                                                            ? 'bg-emerald-900/10 border-emerald-600/30 hover:border-emerald-500'
                                                            : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-500'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm
                                                            ${done
                                                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                                                                : `${selectedSubject.bgColor} border ${selectedSubject.borderColor} ${selectedSubject.color}`}`}>
                                                            {done ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                                                        </div>
                                                        <div>
                                                            <h3 className={`font-bold text-lg transition-colors ${done ? 'text-emerald-300' : 'text-white group-hover:text-blue-300'}`}>
                                                                {mod.title}
                                                            </h3>
                                                            <p className="text-slate-500 text-sm">{mod.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        {done && <span className="text-xs text-emerald-400 font-bold">Concluído</span>}
                                                        <span className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded-full">+{mod.xpReward} XP</span>
                                                        <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" />
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ─── LEITOR DO MÓDULO ─── */}
                            {activePillar === 'masterclass' && subView === 'module' && selectedModule && (
                                <div>
                                    <button
                                        onClick={() => { setSelectedModule(null); setSubView('chapters'); }}
                                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                                    >
                                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                        Voltar para Capítulos
                                    </button>
                                    <ModulePlayer
                                        module={selectedModule}
                                        onComplete={(earnedXp: number) => {
                                            addXp(earnedXp);
                                            completeChapter(selectedModule.id);
                                            setSelectedModule(null);
                                            setSubView('chapters');
                                        }}
                                        onRequestAI={setTutorContext}
                                    />
                                </div>
                            )}

                            {/* ─── REVISÃO RELÂMPAGO ─── */}
                            {activePillar === 'masterclass' && subView === 'revision' && revisionCards && selectedSubject && (
                                <div>
                                    <button
                                        onClick={() => { setSubView('chapters'); setRevisionCards(null); }}
                                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                                    >
                                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                        Voltar para {selectedSubject.name}
                                    </button>
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-extrabold text-amber-400 flex items-center gap-3">
                                            <Zap className="h-6 w-6" />
                                            Revisão Relâmpago — {selectedSubject.name}
                                        </h2>
                                        <p className="text-slate-400 mt-2">Perguntas misturadas de todos os capítulos desta matéria. Teste o que você aprendeu!</p>
                                    </div>
                                    <FlashcardQuiz
                                        cards={revisionCards}
                                        onComplete={(earnedXp) => {
                                            addXp(earnedXp);
                                            setSubView('chapters');
                                            setRevisionCards(null);
                                        }}
                                        moduleContent={getModulesForSubject(selectedSubject.id).map(c => c.content).join('\n\n')}
                                    />
                                </div>
                            )}

                            {/* ─── CASO DA MATÉRIA ─── */}
                            {activePillar === 'masterclass' && subView === 'subjectCase' && subjectCase && selectedSubject && (
                                <div>
                                    <button
                                        onClick={() => { setSubView('chapters'); setSubjectCase(null); }}
                                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                                    >
                                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                        Voltar para {selectedSubject.name}
                                    </button>
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-extrabold text-emerald-400 flex items-center gap-3">
                                            <BrainCircuit className="h-6 w-6" />
                                            Caso Prático — {selectedSubject.name}
                                        </h2>
                                        <p className="text-slate-400 mt-2">Um cenário baseado no conteúdo desta matéria. Tome decisões e veja o resultado.</p>
                                    </div>
                                    <CaseSimulator
                                        caseStudy={subjectCase}
                                        onRequestAI={setTutorContext}
                                        onComplete={(earnedXp) => {
                                            addXp(earnedXp);
                                            setSubView('chapters');
                                            setSubjectCase(null);
                                        }}
                                    />
                                </div>
                            )}

                            {/* ─── SIMULADOR GERAL ─── */}
                            {activePillar === 'simulador' && (
                                <CaseSimulator
                                    caseStudy={mockCaseStudies[0]}
                                    onRequestAI={setTutorContext}
                                    onComplete={(earnedXp) => {
                                        addXp(earnedXp);
                                        setActivePillar(null);
                                    }}
                                />
                            )}

                            {/* ─── BANCO DE QUESTÕES ─── */}
                            {activePillar === 'questoes' && (
                                libraryPracticeSubject !== undefined ? (
                                    <div className="pt-4">
                                        <button
                                            onClick={() => setLibraryPracticeSubject(undefined)}
                                            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            <ArrowLeft className="h-4 w-4" /> Voltar ao Banco
                                        </button>
                                        <FlashcardQuiz
                                            cards={libraryPracticeSubject === null ? mockFlashcards : mockFlashcards.filter(c => c.subject === libraryPracticeSubject)}
                                            onComplete={(xp) => {
                                                addXp(xp);
                                                setLibraryPracticeSubject(undefined);
                                            }}
                                            infiniteMode={true}
                                        />
                                    </div>
                                ) : (
                                    <QuestionLibrary onPractice={(subj) => setLibraryPracticeSubject(subj || null)} />
                                )
                            )}

                            {/* ─── DICIONÁRIO NEXUS ─── */}
                            {activePillar === 'dicionario' && (
                                <NexusDictionary />
                            )}

                            {/* ─── CADERNO DE ERROS ─── */}
                            {activePillar === 'erros' && (
                                <ErrorReview
                                    wrongAnswers={wrongAnswers}
                                    onClearErrors={clearWrongAnswers}
                                    onPractice={(subject) => {
                                        setActivePillar('pilulas');
                                    }}
                                />
                            )}

                            {/* ─── TRILHAS / JORNADAS ─── */}
                            {activePillar === 'trilhas' && (
                                <LearningPaths
                                    onStartModule={(mod) => {
                                        const subj = subjects.find(s => s.id === mod.subjectId);
                                        if (subj) {
                                            setSelectedSubject(subj);
                                            setSelectedModule(mod);
                                            setActivePillar('masterclass');
                                            setSubView('module');
                                        }
                                    }}
                                />
                            )}

                            {/* ─── PAPER TRADING ─── */}
                            {activePillar === 'paper_trading' && (
                                <PaperTrading />
                            )}

                            {/* ─── SIMULADO / MODO PROVA ─── */}
                            {activePillar === 'simulado' && (
                                <ExamMode
                                    onComplete={() => {
                                        // Exam is self-contained, re-render handles it
                                    }}
                                    onRecordWrongAnswer={recordWrongAnswer}
                                    onAddXp={addXp}
                                />
                            )}

                            {/* ─── FÓRMULAS RÁPIDAS ─── */}
                            {activePillar === 'formulas' && (
                                <FormulaSheet />
                            )}

                            {/* ─── COMPARADOR DE CONCEITOS ─── */}
                            {activePillar === 'comparador' && (
                                <ConceptComparator />
                            )}

                            {/* ─── LEADERBOARD / RANKING ─── */}
                            {activePillar === 'leaderboard' && (
                                <Leaderboard />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

            </main >

            {/* Celebration Toast */}
            <AnimatePresence>
                {celebration && (
                    <motion.div
                        initial={{ opacity: 0, y: -60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -60 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-amber-500/30 text-lg"
                    >
                        <Sparkles className="inline h-5 w-5 mr-2" />
                        {celebration}
                    </motion.div>
                )}
            </AnimatePresence>

            <PomodoroTimer />

            <AITutor
                isOpen={tutorContext !== null}
                onClose={() => setTutorContext(null)}
                contextData={tutorContext}
            />
        </div >
    );
}
