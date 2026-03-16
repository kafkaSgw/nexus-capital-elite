'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, ArrowUpRight, ArrowDownRight, DollarSign, Briefcase, Activity, AlertCircle } from 'lucide-react';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';

// Mock live market data
const mockMarketAssets = [
    { id: 'BTC', name: 'Bitcoin', price: 65420.50, change: 2.5, type: 'Cripto' },
    { id: 'ETH', name: 'Ethereum', price: 3450.20, change: -1.2, type: 'Cripto' },
    { id: 'AAPL', name: 'Apple Inc.', price: 175.40, change: 0.8, type: 'Ação Internacional' },
    { id: 'PETR4', name: 'Petrobras', price: 38.50, change: 1.5, type: 'Ação Nacional' },
    { id: 'IVVB11', name: 'S&P 500 ETF', price: 280.90, change: 0.4, type: 'ETF' },
];

export default function PaperTrading() {
    const { paperTradingBalance, paperTradingPositions, executeTrade } = useAcademyProgress();
    const [selectedAsset, setSelectedAsset] = useState(mockMarketAssets[0]);
    const [quantity, setQuantity] = useState<number | ''>('');
    const [action, setAction] = useState<'buy' | 'sell'>('buy');
    const [error, setError] = useState('');

    const currentPosition = paperTradingPositions.find(p => p.assetId === selectedAsset.id);
    const cost = (typeof quantity === 'number' ? quantity : 0) * selectedAsset.price;

    const handleTrade = () => {
        setError('');
        if (!quantity || quantity <= 0) {
            setError('Digite uma quantidade válida.');
            return;
        }

        if (action === 'buy' && cost > paperTradingBalance) {
            setError('Saldo insuficiente para esta compra.');
            return;
        }

        if (action === 'sell' && (!currentPosition || currentPosition.quantity < quantity)) {
            setError('Você não possui esta quantidade para vender.');
            return;
        }

        executeTrade(selectedAsset.id, quantity, selectedAsset.price, action === 'buy');
        setQuantity('');
    };

    // Calcular patrimônio total (Saldo + valor das posições)
    const totalEquity = paperTradingBalance + paperTradingPositions.reduce((acc, pos) => {
        const asset = mockMarketAssets.find(A => A.id === pos.assetId);
        return acc + (pos.quantity * (asset?.price || 0));
    }, 0);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(val);
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                    <LineChart className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-white">Mercado Simulado</h2>
                    <p className="text-slate-400">Pratique suas estratégias de investimento em tempo real e sem risco.</p>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2 text-slate-400 font-bold uppercase text-xs tracking-widest">
                        <DollarSign className="h-4 w-4" /> Caixa Disponível
                    </div>
                    <div className="text-4xl font-extrabold text-white">{formatCurrency(paperTradingBalance)}</div>
                </div>
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2 text-slate-400 font-bold uppercase text-xs tracking-widest">
                        <Briefcase className="h-4 w-4" /> Patrimônio Total
                    </div>
                    <div className="text-4xl font-extrabold text-emerald-400">{formatCurrency(totalEquity)}</div>
                    {totalEquity > 100000 && (
                        <span className="text-emerald-500 text-sm font-bold mt-1 flex items-center">
                            <ArrowUpRight className="h-4 w-4" /> +{formatCurrency(totalEquity - 100000)} de lucro
                        </span>
                    )}
                    {totalEquity < 100000 && (
                        <span className="text-red-500 text-sm font-bold mt-1 flex items-center">
                            <ArrowDownRight className="h-4 w-4" /> -{formatCurrency(100000 - totalEquity)} de perda
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Ativos do Mercado (Esquerda) */}
                <div className="lg:col-span-2 bg-slate-800/20 border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-orange-400" /> Cotações ao Vivo
                    </h3>
                    <div className="space-y-2">
                        {mockMarketAssets.map(asset => {
                            const isSelected = selectedAsset.id === asset.id;
                            const isPositive = asset.change >= 0;
                            return (
                                <div
                                    key={asset.id}
                                    onClick={() => setSelectedAsset(asset)}
                                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all ${isSelected ? 'bg-orange-500/10 border-orange-500/40 scale-[1.01]' : 'bg-slate-800/50 border-slate-700/30 hover:bg-slate-700/50'}`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white">{asset.id}</span>
                                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{asset.type}</span>
                                        </div>
                                        <div className="text-sm text-slate-400">{asset.name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono text-white font-bold">{formatCurrency(asset.price)}</div>
                                        <div className={`text-xs font-bold flex items-center justify-end ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                            {Math.abs(asset.change)}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Minhas Posições */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-blue-400" /> Minha Carteira
                        </h3>
                        {paperTradingPositions.length === 0 ? (
                            <p className="text-slate-400 text-sm">Você ainda não possui nenhum ativo na carteira simulada. Faça sua primeira compra!</p>
                        ) : (
                            <div className="space-y-2">
                                {paperTradingPositions.map(pos => {
                                    const assetData = mockMarketAssets.find(a => a.id === pos.assetId);
                                    if (!assetData) return null;
                                    const currentValue = pos.quantity * assetData.price;
                                    const investedValue = pos.quantity * pos.averagePrice;
                                    const pnl = currentValue - investedValue;
                                    const pnlPercent = (pnl / investedValue) * 100;
                                    const isProfit = pnl >= 0;

                                    return (
                                        <div key={pos.assetId} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                                            <div>
                                                <div className="font-bold text-white">{pos.assetId}</div>
                                                <div className="text-xs text-slate-400">{pos.quantity} qtd • Médio: {formatCurrency(pos.averagePrice)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-white">{formatCurrency(currentValue)}</div>
                                                <div className={`text-xs font-bold flex items-center justify-end ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {isProfit ? '+' : ''}{formatCurrency(pnl)} ({pnlPercent.toFixed(2)}%)
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Painel de Trading (Direita) */}
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 h-fit sticky top-24">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl text-white">Negociar {selectedAsset.id}</h3>
                        <div className="text-orange-400 font-mono font-bold">{formatCurrency(selectedAsset.price)}</div>
                    </div>

                    <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
                        <button
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${action === 'buy' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setAction('buy')}
                        >
                            Comprar
                        </button>
                        <button
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${action === 'sell' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setAction('sell')}
                        >
                            Vender
                        </button>
                    </div>

                    {action === 'sell' && currentPosition && (
                        <div className="text-xs text-slate-400 mb-4 px-2">
                            Disponível para venda: <span className="text-white font-bold">{currentPosition.quantity}</span>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Quantidade</label>
                        <input
                            type="number"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 transition-colors"
                            placeholder="Ex: 2.5"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                        />
                    </div>

                    <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-700/50">
                        <span className="text-slate-400 text-sm font-bold">Total:</span>
                        <span className="text-2xl font-black text-white">{formatCurrency(cost)}</span>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 p-3 rounded-lg mb-4">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleTrade}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-transform hover:scale-[1.02] shadow-lg ${action === 'buy' ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20' : 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'}`}
                    >
                        {action === 'buy' ? 'Confirmar Compra' : 'Confirmar Venda'}
                    </button>
                </div>
            </div>
        </div>
    );
}
