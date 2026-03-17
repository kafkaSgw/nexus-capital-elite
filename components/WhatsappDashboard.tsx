"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RefreshCcw, ArrowUpCircle, ArrowDownCircle, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
    id: string;
    created_at: string;
    whatsapp_number: string;
    amount: number;
    category: string;
    project_company: string;
    transaction_type: string;
    original_message: string;
}

export function WhatsappDashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTransactions();

        // Configura realtime para atualizar quando uma nova mensagem chegar
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'whatsapp_transactions',
                },
                (payload: any) => {
                    console.log('Nova transação via WhatsApp recebida!', payload);
                    setTransactions((current) => [payload.new as Transaction, ...current]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('whatsapp_transactions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar transações:', error);
        } else {
            setTransactions(data || []);
        }
        setLoading(false);
    };

    const filteredTransactions = transactions.filter(t =>
        t.original_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.project_company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalEntradas = transactions
        .filter(t => t.transaction_type === 'Entrada')
        .reduce((acc: number, curr: Transaction) => acc + Number(curr.amount), 0);

    const totalSaidas = transactions
        .filter(t => t.transaction_type === 'Saída')
        .reduce((acc: number, curr: Transaction) => acc + Number(curr.amount), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <span className="text-green-500 text-4xl">📱</span> WhatsApp Engine
                    </h2>
                    <p className="text-zinc-400">
                        Fluxo de caixa alimentado via IA pelo seu celular em tempo real.
                    </p>
                </div>

                <button
                    onClick={fetchTransactions}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-md bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
                >
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-zinc-400">Total Receitas</h3>
                        <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{formatCurrency(totalEntradas)}</div>
                        <p className="text-xs text-zinc-500 mt-1">Registrado via WhatsApp</p>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-zinc-400">Total Despesas</h3>
                        <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{formatCurrency(totalSaidas)}</div>
                        <p className="text-xs text-zinc-500 mt-1">Registrado via WhatsApp</p>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hidden lg:block">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-zinc-400">Saldo Consolidado</h3>
                    </div>
                    <div>
                        <div className={`text-2xl font-bold ${totalEntradas - totalSaidas >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatCurrency(totalEntradas - totalSaidas)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Últimas Mensagens</h3>
                            <p className="text-sm text-zinc-400">
                                Histórico de todas as notas enviadas e processadas pela IA.
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                            <Search className="h-4 w-4 text-zinc-500" />
                            <input
                                placeholder="Buscar na mensagem original..."
                                value={searchTerm}
                                onChange={(e: any) => setSearchTerm(e.target.value)}
                                className="w-full md:w-[250px] bg-transparent border-0 focus:outline-none focus:ring-0 text-white placeholder:text-zinc-600 outline-none text-sm h-6"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="w-full overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-400 bg-zinc-950/80 border-b border-zinc-800">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Data e Hora</th>
                                    <th className="px-6 py-3 font-medium">Empresa/Projeto</th>
                                    <th className="px-6 py-3 font-medium">Categoria</th>
                                    <th className="px-6 py-3 font-medium">Mensagem Original</th>
                                    <th className="px-6 py-3 font-medium text-right">Valor Extraído</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                            Carregando banco de dados...
                                        </td>
                                    </tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                            Nenhuma transação encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                                                {new Date(tx.created_at).toLocaleString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800/50 px-2.5 py-0.5 text-xs font-semibold text-zinc-300 transition-colors">
                                                    {tx.project_company}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-300">
                                                {tx.category}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-400 max-w-xs truncate italic">
                                                "{tx.original_message}"
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-medium ${tx.transaction_type === 'Entrada' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {tx.transaction_type === 'Entrada' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
