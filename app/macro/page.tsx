'use client'

import { useState, useEffect } from 'react'
import { Activity, Zap } from 'lucide-react'

export default function MacroTerminal() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const indices = [
    { name: 'S&P 500', value: '5,123.41', change: '+0.85%', up: true },
    { name: 'NASDAQ', value: '16,234.12', change: '+1.12%', up: true },
    { name: 'IBOVESPA', value: '128,432', change: '-0.45%', up: false },
    { name: 'DXY', value: '104.21', change: '+0.15%', up: true },
    { name: 'VIX', value: '13.45', change: '-2.30%', up: false },
    { name: 'BRENT', value: '$83.42', change: '+1.20%', up: true },
    { name: 'GOLD', value: '$2,154', change: '+0.50%', up: true },
    { name: 'BTC/USD', value: '$68,432', change: '+3.40%', up: true },
  ]

  const yieldCurve = [
    { year: '1M', rate: 10.40 },
    { year: '6M', rate: 10.25 },
    { year: '1Y', rate: 9.85 },
    { year: '2Y', rate: 9.60 },
    { year: '5Y', rate: 10.15 },
    { year: '10Y', rate: 10.45 },
  ]

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-[#050505] px-2 sm:px-4 py-4 font-mono animate-fade-in text-[#00ff00] rounded-xl shadow-[0_0_50px_rgba(0,255,0,0.05)] border border-[#00ff00]/20">
      {/* Terminal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#00ff00]/30 pb-3 mb-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#00ff00] text-black px-2 py-0.5 font-bold text-sm tracking-widest uppercase">
            Nexus Terminal
          </div>
          <span className="text-xs text-[#00ff00]/70 hidden sm:inline">MACRO DESK / G7 VIEW / EQTY_FX</span>
        </div>
        <div className="flex items-center gap-4 mt-3 sm:mt-0 text-xs">
          <span className="flex items-center gap-2"><Zap className="w-3 h-3 animate-pulse" /> LIVE</span>
          <span>{time.toLocaleTimeString('en-US', { hour12: false })} UTC-3</span>
          <span className="text-[#00ff00]/50 border border-[#00ff00]/30 px-2 py-0.5 rounded">MSG: 0 ERR</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Real-time Ticker Tape (Left Column) */}
        <div className="lg:col-span-1 border border-[#00ff00]/30 bg-[#0a0a0a] p-3 h-fit">
          <h2 className="text-xs font-bold border-b border-[#00ff00]/30 pb-2 mb-3 tracking-widest text-[#00ff00]/70">GLOBAL INDICES</h2>
          <div className="space-y-3">
            {indices.map((idx) => (
              <div key={idx.name} className="flex items-center justify-between group cursor-crosshair hover:bg-[#00ff00]/10 p-1 transition-colors">
                <span className="text-sm font-bold">{idx.name}</span>
                <div className="text-right flex items-center gap-3">
                  <span className="text-sm">{idx.value}</span>
                  <span className={`text-xs w-16 text-right px-1 font-bold ${idx.up ? 'bg-[#00ff00]/20 text-[#00ff00]' : 'bg-red-500/20 text-red-500'}`}>
                    {idx.up ? '▲' : '▼'} {idx.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[#00ff00]/30 flex items-center gap-2 text-xs text-[#00ff00]/50">
             <Activity className="w-3 h-3" /> Data feed active via API_WSS
          </div>
        </div>

        {/* Main Chart Area (Center) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
           {/* Chart 1: Yield Curve */}
           <div className="border border-[#00ff00]/30 bg-[#0a0a0a] p-4 h-64 relative flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-bold tracking-widest text-[#00ff00]/70">BRAZIL DI YIELD CURVE (B3 FUTURES)</h2>
                <span className="text-[10px] bg-[#00ff00]/20 text-[#00ff00] px-2 py-0.5 font-bold uppercase animate-pulse">Inverted Shape Detected</span>
              </div>
              <div className="flex-1 flex items-end justify-between gap-2 px-4 pb-6 mt-4 relative">
                 {/* Visual Grid Lines */}
                 <div className="absolute inset-x-0 bottom-6 border-b border-[#00ff00]/20" />
                 <div className="absolute inset-x-0 bottom-[40%] border-b border-[#00ff00]/10 border-dashed" />
                 <div className="absolute inset-x-0 bottom-[80%] border-b border-[#00ff00]/10 border-dashed" />
                 
                 {yieldCurve.map((point, i) => {
                    const height = (point.rate - 8) / 3 * 100 // Visual scaling mock
                    return (
                      <div key={point.year} className="flex flex-col items-center justify-end h-full z-10 w-full group">
                         <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-[#050505] px-1 border border-[#00ff00]/50">{point.rate}%</span>
                         <div className="w-full max-w-[30px] bg-[#00ff00]/40 border border-[#00ff00] hover:bg-[#00ff00] hover:shadow-[0_0_15px_#00ff00] transition-all" style={{ height: `${height}%` }} />
                         <span className="text-[10px] mt-2 absolute -bottom-4">{point.year}</span>
                      </div>
                    )
                 })}
                 {/* SVG Line Overlay */}
                 <svg className="absolute inset-0 w-[calc(100%-2rem)] h-[calc(100%-1.5rem)] ml-4 pointer-events-none" preserveAspectRatio="none">
                    <polyline 
                      points="10%,45% 25%,50% 45%,60% 65%,70% 85%,55% 95%,40%" 
                      fill="none" 
                      stroke="#00ff00" 
                      strokeWidth="2" 
                      className="drop-shadow-[0_0_8px_#00ff00]"
                    />
                 </svg>
              </div>
           </div>

           {/* Central Bank Monitor */}
           <div className="grid grid-cols-2 gap-4">
             <div className="border border-[#00ff00]/30 bg-[#0a0a0a] p-4 group hover:border-[#00ff00] transition-colors cursor-crosshair">
                <h2 className="text-xs font-bold tracking-widest text-[#00ff00]/70 mb-3 block">FED WATCH TOOL (CME Group)</h2>
                <div className="flex justify-between items-center bg-[#00ff00]/10 p-2 border border-[#00ff00]/20">
                   <span className="text-xs md:text-sm">RATE CUT PROB (MAY)</span>
                   <span className="font-bold text-base md:text-lg">74.2%</span>
                </div>
             </div>
             <div className="border border-[#00ff00]/30 bg-[#0a0a0a] p-4 group hover:border-[#00ff00] transition-colors cursor-crosshair">
                <h2 className="text-xs font-bold tracking-widest text-[#00ff00]/70 mb-3 block">COPOM MONITOR BR</h2>
                <div className="flex justify-between items-center bg-[#00ff00]/10 p-2 border border-[#00ff00]/20">
                   <span className="text-xs md:text-sm">NEXT SELIC TARGET</span>
                   <span className="font-bold text-base md:text-lg">10.25%</span>
                </div>
             </div>
           </div>
        </div>

        {/* News Feed / Terminal Log (Right Column) */}
        <div className="lg:col-span-1 border border-[#00ff00]/30 bg-[#0a0a0a] p-3 flex flex-col h-[500px] lg:h-auto">
          <h2 className="text-xs font-bold border-b border-[#00ff00]/30 pb-2 mb-3 tracking-widest text-[#00ff00]/70">NEWSWIRE / MACRO HEADLINES</h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {[
              { time: '13:42', tag: 'URGENT', text: 'US CPI COMES IN HOT AT 3.2% Y/Y', color: 'text-red-500' },
              { time: '13:15', tag: 'CORP', text: 'NVIDIA ANNOUNCES NEW AI CHIP ARCHITECTURE', color: 'text-[#00ff00]' },
              { time: '12:30', tag: 'MACRO', text: 'ECB HOLDS RATES STEADY; LAGARDE SPKS', color: 'text-[#00ff00]' },
              { time: '11:05', tag: 'BRAZIL', text: 'GOVT REVISES FISCAL TARGET FOR 2025', color: 'text-yellow-500' },
              { time: '10:00', tag: 'COMM', text: 'OPEC+ EXTENDS PRODUCTION CUTS THROUGH Q2', color: 'text-[#00ff00]' },
              { time: '09:15', tag: 'CRYPTO', text: 'BITCOIN SURPASSES $68K ON ETF INFLOWS', color: 'text-[#00ff00]' },
              { time: '08:30', tag: 'MACRO', text: 'CHINA EXPORTS BEAT ESTIMATES IN JAN-FEB', color: 'text-[#00ff00]' },
              { time: '07:15', tag: 'FX', text: 'BOJ WEIGHS END OF NEGATIVE INTEREST RATES YIELD', color: 'text-yellow-500' },
            ].map((news, i) => (
              <div key={i} className="text-xs leading-relaxed group cursor-crosshair">
                <span className="opacity-50 mr-2">{news.time}</span>
                <span className={`px-1 mr-2 border border-current ${news.color} font-bold`}>{news.tag}</span>
                <span className="group-hover:bg-[#00ff00]/20 transition-colors cursor-text">{news.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#00ff00]/30">
            <div className="flex items-center gap-2">
              <span className="animate-pulse">_</span>
              <input type="text" className="bg-transparent border-none outline-none w-full text-[#00ff00] placeholder-[#00ff00]/30 text-xs uppercase" placeholder="TYPE SYMBOL OR /HELP..." />
            </div>
             <p className="text-[10px] text-[#00ff00]/40 mt-1">NEXUS TERMINAL v1.0.4. CONNECTED.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
