'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
}

interface AITutorProps {
    isOpen: boolean;
    onClose: () => void;
    contextData: {
        type: 'flashcard' | 'module' | 'case_study';
        title: string;
        content: string;
        userQuestion?: string;
    } | null;
}

export default function AITutor({ isOpen, onClose, contextData }: AITutorProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize context when opened
    useEffect(() => {
        if (isOpen && contextData && messages.length === 0) {
            let initialMsg = '';
            if (contextData.type === 'flashcard') {
                initialMsg = `Olá! Que ótimo ver você focado nos estudos hoje. Vi que estamos olhando para: **${contextData.title}**. Como você começou agora, eu explico os termos difíceis. O que ficou confuso na explicação "${contextData.content}"?`;
            } else if (contextData.type === 'case_study') {
                initialMsg = `Bem-vindo ao Simulador! Aqui é um ambiente seguro para testarmos ideias. No caso "${contextData.title}", qual parte do cenário você quer que eu traduza de "economês" para português claro antes de você tomar a decisão?`;
            } else {
                initialMsg = `Olá! Como posso te ajudar a entender melhor esse módulo hoje? Não se preocupe se algo parecer complexo, vamos um passo de cada vez.`;
            }

            setMessages([
                { id: '1', role: 'ai', content: initialMsg }
            ]);
        }
    }, [isOpen, contextData, messages.length]);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        if (messagesEndRef.current && messagesEndRef.current.parentElement) {
            const parent = messagesEndRef.current.parentElement;
            parent.scrollTo({ top: parent.scrollHeight, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now().toString(), role: 'user' as const, content: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // MOCK AI RESPONSE - Integrar com a API real (api/chat ou api/wiki-path)
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: `Esta é uma resposta simulada da IA Nexus para a sua pergunta no contexto de ${contextData?.type}. A integração real conectará com o motor do sistema para fornecer análises profundas sobre o seu questionamento.`
            }]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed bottom-6 right-6 w-full max-w-sm sm:max-w-md z-[100] bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[500px]"
            >
                {/* Header Tutor */}
                <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-200" />
                        <div>
                            <h3 className="font-bold text-sm">Nexus IA Tutor</h3>
                            <p className="text-xs text-indigo-200 opacity-80">
                                Contexto: {contextData?.title || 'Geral'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-indigo-500 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4 text-indigo-400" />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed
                  ${msg.role === 'user'
                                        ? 'bg-slate-700 text-slate-200 rounded-tr-sm'
                                        : 'bg-indigo-500/10 border border-indigo-500/20 text-slate-300 rounded-tl-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0">
                                    <User className="h-4 w-4 text-slate-400" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center shrink-0">
                                <Bot className="h-4 w-4 text-indigo-400" />
                            </div>
                            <div className="bg-indigo-500/10 border border-indigo-500/20 text-slate-300 rounded-2xl p-4 rounded-tl-sm flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Dúvidas sobre este assunto?"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white p-2 rounded-xl transition-all flex items-center justify-center w-10 h-10"
                    >
                        <Send className="h-4 w-4 ml-0.5" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );

    if (typeof document === 'undefined') return null;
    return createPortal(modalContent, document.body);
}
