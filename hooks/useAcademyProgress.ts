'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDeviceId, fetchAcademyData, updateAcademyProfile, updatePaperTradingData, upsertSrsCardDb, insertWrongAnswerDb } from '@/lib/academyDb';

export interface WrongAnswer {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    subject: string;
    date: string;
}

export interface SrsCardData {
    interval: number; // days until next review
    easeFactor: number; // difficulty multiplier (starts at 2.5)
    nextReview: string; // ISO date string
    repetitions: number;
}

interface AcademyProgress {
    xp: number;
    streak: number;
    lastStudyDate: string;
    completedChapters: string[];
    badges: string[];
    paperTradingBalance: number;
    paperTradingPositions: { assetId: string; quantity: number; averagePrice: number }[];
    wrongAnswers: WrongAnswer[];
    lastStudiedChapterId: string;
    lastStudiedSubjectId: string;
    srsData: Record<string, SrsCardData>;
}

const STORAGE_KEY = 'nexus_academy_progress';

const defaultProgress: AcademyProgress = {
    xp: 0,
    streak: 0,
    lastStudyDate: '',
    completedChapters: [],
    badges: [],
    paperTradingBalance: 100000,
    paperTradingPositions: [],
    wrongAnswers: [],
    lastStudiedChapterId: '',
    lastStudiedSubjectId: '',
    srsData: {},
};

function loadProgress(): AcademyProgress {
    if (typeof window === 'undefined') return defaultProgress;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return { ...defaultProgress, ...parsed };
        }
    } catch (e) {
        console.error('[useAcademyProgress] Failed to load:', e);
    }
    return defaultProgress;
}

function saveProgress(progress: AcademyProgress) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        console.error('[useAcademyProgress] Failed to save:', e);
    }
}

export function useAcademyProgress() {
    const [progress, setProgress] = useState<AcademyProgress>(defaultProgress);
    const [loaded, setLoaded] = useState(false);

    // Load from localStorage on mount (client-only)
    useEffect(() => {
        let isSubscribed = true;

        const initLoad = async () => {
            const saved = loadProgress();

            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            if (saved.lastStudyDate === today) {
                // keep streak
            } else if (saved.lastStudyDate === yesterday) {
                // keep streak
            } else if (saved.lastStudyDate && saved.lastStudyDate !== today && saved.lastStudyDate !== yesterday) {
                saved.streak = 0;
            }

            setProgress(saved);
            setLoaded(true);

            // Fetch from Supabase
            const userId = getDeviceId();
            if (userId && isSubscribed) {
                try {
                    const dbData = await fetchAcademyData(userId);
                    if (dbData.profile) {
                        const merged: AcademyProgress = {
                            ...saved,
                            xp: dbData.profile.xp,
                            streak: dbData.profile.streak,
                            lastStudyDate: dbData.profile.last_study_date || saved.lastStudyDate,
                            completedChapters: dbData.profile.completed_chapters || [],
                            badges: dbData.profile.badges || [],
                            lastStudiedChapterId: dbData.profile.last_studied_chapter_id || '',
                            lastStudiedSubjectId: dbData.profile.last_studied_subject_id || '',
                        };

                        if (dbData.paperTrading) {
                            merged.paperTradingBalance = dbData.paperTrading.balance;
                            merged.paperTradingPositions = typeof dbData.paperTrading.positions === 'string'
                                ? JSON.parse(dbData.paperTrading.positions)
                                : dbData.paperTrading.positions;
                        }

                        if (dbData.srsRows && dbData.srsRows.length > 0) {
                            const newSrs: Record<string, SrsCardData> = {};
                            dbData.srsRows.forEach((r: any) => {
                                newSrs[r.card_id] = {
                                    interval: r.interval,
                                    easeFactor: r.ease_factor,
                                    nextReview: r.next_review,
                                    repetitions: r.repetitions
                                };
                            });
                            merged.srsData = newSrs;
                        }

                        if (dbData.wrongAnswers && dbData.wrongAnswers.length > 0) {
                            merged.wrongAnswers = dbData.wrongAnswers.map((r: any) => ({
                                question: r.question,
                                userAnswer: r.user_answer,
                                correctAnswer: r.correct_answer,
                                subject: r.subject,
                                date: r.date
                            }));
                        }

                        if (isSubscribed) {
                            setProgress(merged);
                            saveProgress(merged);
                        }
                    } else {
                        // If no profile, push local data to create one
                        updateAcademyProfile(userId, {
                            xp: saved.xp, streak: saved.streak, last_study_date: saved.lastStudyDate,
                            completed_chapters: saved.completedChapters, badges: saved.badges,
                            last_studied_chapter_id: saved.lastStudiedChapterId,
                            last_studied_subject_id: saved.lastStudiedSubjectId
                        });
                        updatePaperTradingData(userId, saved.paperTradingBalance, saved.paperTradingPositions);
                    }
                } catch (e) {
                    console.error('Supabase Sync error', e);
                }
            }
        };

        initLoad();
        return () => { isSubscribed = false; };
    }, []);

    const addXp = useCallback((amount: number) => {
        setProgress(prev => {
            const today = new Date().toISOString().split('T')[0];
            const isNewDay = prev.lastStudyDate !== today;

            const updated: AcademyProgress = {
                ...prev,
                xp: prev.xp + amount,
                streak: isNewDay ? prev.streak + 1 : prev.streak,
                lastStudyDate: today,
            };
            saveProgress(updated);

            const userId = getDeviceId();
            if (userId) {
                updateAcademyProfile(userId, { xp: updated.xp, streak: updated.streak, last_study_date: updated.lastStudyDate });
            }

            return updated;
        });
    }, []);

    const completeChapter = useCallback((moduleId: string) => {
        setProgress(prev => {
            if (prev.completedChapters.includes(moduleId)) return prev;
            const updated: AcademyProgress = {
                ...prev,
                completedChapters: [...prev.completedChapters, moduleId],
            };
            saveProgress(updated);

            const userId = getDeviceId();
            if (userId) {
                updateAcademyProfile(userId, { completed_chapters: updated.completedChapters });
            }

            return updated;
        });
    }, []);

    const isChapterCompleted = useCallback((moduleId: string) => {
        return progress.completedChapters.includes(moduleId);
    }, [progress.completedChapters]);

    const earnBadge = useCallback((badgeId: string) => {
        setProgress(prev => {
            if (prev.badges.includes(badgeId)) return prev;
            const updated = { ...prev, badges: [...prev.badges, badgeId] };
            saveProgress(updated);

            const userId = getDeviceId();
            if (userId) {
                updateAcademyProfile(userId, { badges: updated.badges });
            }

            return updated;
        });
    }, []);

    const executeTrade = useCallback((assetId: string, quantity: number, price: number, isBuy: boolean) => {
        setProgress(prev => {
            const cost = quantity * price;
            if (isBuy && prev.paperTradingBalance < cost) return prev; // Not enough balance

            let newBalance = isBuy ? prev.paperTradingBalance - cost : prev.paperTradingBalance + cost;
            let newPositions = [...prev.paperTradingPositions];
            const existingPosIndex = newPositions.findIndex(p => p.assetId === assetId);

            if (isBuy) {
                if (existingPosIndex >= 0) {
                    const existing = newPositions[existingPosIndex];
                    const totalValue = (existing.quantity * existing.averagePrice) + cost;
                    const newQuantity = existing.quantity + quantity;
                    newPositions[existingPosIndex] = {
                        ...existing,
                        quantity: newQuantity,
                        averagePrice: totalValue / newQuantity
                    };
                } else {
                    newPositions.push({ assetId, quantity, averagePrice: price });
                }
            } else {
                // Sell
                if (existingPosIndex >= 0) {
                    const existing = newPositions[existingPosIndex];
                    if (existing.quantity < quantity) return prev; // Not enough quantity to sell

                    const newQuantity = existing.quantity - quantity;
                    if (newQuantity === 0) {
                        newPositions.splice(existingPosIndex, 1);
                    } else {
                        newPositions[existingPosIndex] = { ...existing, quantity: newQuantity };
                    }
                } else {
                    return prev; // Nothing to sell
                }
            }

            const updated = { ...prev, paperTradingBalance: newBalance, paperTradingPositions: newPositions };
            saveProgress(updated);

            const userId = getDeviceId();
            if (userId) {
                updatePaperTradingData(userId, updated.paperTradingBalance, updated.paperTradingPositions);
            }

            return updated;
        });
    }, []);

    const recordWrongAnswer = useCallback((answer: WrongAnswer) => {
        setProgress(prev => {
            const updated = { ...prev, wrongAnswers: [...prev.wrongAnswers, answer].slice(-100) }; // keep last 100
            saveProgress(updated);

            const userId = getDeviceId();
            if (userId) {
                insertWrongAnswerDb(userId, answer);
            }

            return updated;
        });
    }, []);

    const clearWrongAnswers = useCallback((subject?: string) => {
        setProgress(prev => {
            const updated = {
                ...prev,
                wrongAnswers: subject ? prev.wrongAnswers.filter(w => w.subject !== subject) : [],
            };
            saveProgress(updated);
            return updated;
        });
    }, []);

    const setLastStudied = useCallback((chapterId: string, subjectId: string) => {
        setProgress(prev => {
            const updated = { ...prev, lastStudiedChapterId: chapterId, lastStudiedSubjectId: subjectId };
            saveProgress(updated);

            const userId = getDeviceId();
            if (userId) {
                updateAcademyProfile(userId, { last_studied_chapter_id: chapterId, last_studied_subject_id: subjectId });
            }

            return updated;
        });
    }, []);

    const updateSrsCard = useCallback((cardId: string, correct: boolean) => {
        setProgress(prev => {
            const existing = prev.srsData[cardId] || { interval: 1, easeFactor: 2.5, nextReview: '', repetitions: 0 };
            let { interval, easeFactor, repetitions } = existing;

            if (correct) {
                repetitions += 1;
                if (repetitions === 1) interval = 1;
                else if (repetitions === 2) interval = 3;
                else interval = Math.round(interval * easeFactor);
                easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02));
            } else {
                repetitions = 0;
                interval = 1;
                easeFactor = Math.max(1.3, easeFactor - 0.2);
            }

            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + interval);

            const updated = {
                ...prev,
                srsData: {
                    ...prev.srsData,
                    [cardId]: { interval, easeFactor, nextReview: nextDate.toISOString().split('T')[0], repetitions },
                },
            };
            saveProgress(updated);

            const userId = getDeviceId();
            if (userId) {
                upsertSrsCardDb(userId, cardId, updated.srsData[cardId]);
            }

            return updated;
        });
    }, []);

    const getWrongAnswersBySubject = useCallback((subject: string) => {
        return progress.wrongAnswers.filter(w => w.subject === subject);
    }, [progress.wrongAnswers]);

    const currentLevel = Math.floor(progress.xp / 500) + 1;

    return {
        xp: progress.xp,
        streak: progress.streak,
        level: currentLevel,
        completedChapters: progress.completedChapters,
        badges: progress.badges,
        paperTradingBalance: progress.paperTradingBalance,
        paperTradingPositions: progress.paperTradingPositions,
        wrongAnswers: progress.wrongAnswers,
        lastStudiedChapterId: progress.lastStudiedChapterId,
        lastStudiedSubjectId: progress.lastStudiedSubjectId,
        srsData: progress.srsData,
        loaded,
        addXp,
        completeChapter,
        isChapterCompleted,
        earnBadge,
        executeTrade,
        recordWrongAnswer,
        clearWrongAnswers,
        setLastStudied,
        updateSrsCard,
        getWrongAnswersBySubject,
    };
}
