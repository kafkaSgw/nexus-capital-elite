'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Medal, Crown, Flame, Star, Loader2, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { useAcademyProgress } from '@/hooks/useAcademyProgress'

interface LeaderboardEntry {
  user_id: string;
  xp: number;
  streak: number;
  badges: string[];
  rank?: number;
  name?: string; 
  isCurrentUser?: boolean;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { xp: currentXp, streak: currentStreak } = useAcademyProgress()

  const getAvatarName = (uuid: string) => {
    const adjs = ['Quantum', 'Neural', 'Cyber', 'Nexus', 'Alpha', 'Omega', 'Nova', 'Crypto', 'Tech', 'Iron']
    const nouns = ['Trader', 'Whale', 'Bull', 'Bear', 'Shark', 'Wolf', 'Eagle', 'Titan', 'Ghost', 'Ninja']
    
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
        hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx1 = Math.abs(hash) % adjs.length;
    const idx2 = Math.abs(hash >> 8) % nouns.length;
    
    return `${adjs[idx1]} ${nouns[idx2]}`
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('academy_profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(50)

      if (error) {
        throw error
      }

      const localId = localStorage.getItem('nexus_device_id')

      let formatted: LeaderboardEntry[] = (data || []).map((row, index) => ({
        user_id: row.user_id,
        xp: row.xp || 0,
        streak: row.streak || 0,
        badges: row.badges || [],
        rank: index + 1,
        name: getAvatarName(row.user_id),
        isCurrentUser: row.user_id === localId
      }))

      if (formatted.length < 5) {
        const mockPlayers: LeaderboardEntry[] = [
          { user_id: 'mock-1', xp: 5400, streak: 12, badges: ['b1', 'b2'], rank: 0, name: 'Quantum Whale' },
          { user_id: 'mock-2', xp: 4200, streak: 5, badges: ['b1'], rank: 0, name: 'Cyber Bull' },
          { user_id: 'mock-3', xp: 3100, streak: 21, badges: ['b3'], rank: 0, name: 'Nexus Shark' },
          { user_id: 'mock-4', xp: 2800, streak: 2, badges: [], rank: 0, name: 'Alpha Titan' },
          { user_id: 'mock-5', xp: 1500, streak: 7, badges: ['b2'], rank: 0, name: 'Iron Ninja' },
        ]
        
        formatted = [...formatted, ...mockPlayers].sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }))
        
        if (localId && !formatted.find(f => f.isCurrentUser)) {
          formatted.push({
            user_id: localId,
            xp: currentXp,
            streak: currentStreak,
            badges: [],
            rank: formatted.length + 1,
            name: 'Você (Sócio)',
            isCurrentUser: true
          })
          formatted = formatted.sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }))
        }
      }

      setLeaders(formatted)
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Carregando Hall da Fama...</p>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-8 w-8 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Leaderboard Global</h2>
          <p className="text-slate-400">Os tubarões mais dedicados da Nexus Academy.</p>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 bg-slate-800/30 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2 md:col-span-1 text-center">Rank</div>
          <div className="col-span-6 md:col-span-5">Investidor</div>
          <div className="col-span-4 md:col-span-3 text-right pr-4">XP Total</div>
          <div className="hidden md:flex col-span-3 items-center justify-end gap-6 pr-4">
            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> Ofensiva</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/50">
          {leaders.map((leader, idx) => {
            const isTop3 = leader.rank && leader.rank <= 3;
            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={leader.user_id}
                className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-slate-800/40
                  ${leader.isCurrentUser ? 'bg-amber-500/10 border-l-2 border-l-amber-500' : ''}
                `}
              >
                <div className="col-span-2 md:col-span-1 flex justify-center">
                  {leader.rank === 1 ? (
                    <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                  ) : leader.rank === 2 ? (
                    <Medal className="w-6 h-6 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.6)]" />
                  ) : leader.rank === 3 ? (
                    <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
                  ) : (
                    <span className="text-lg font-bold text-slate-500">{leader.rank}</span>
                  )}
                </div>
                
                <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-inner flex-shrink-0
                    ${isTop3 ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 text-amber-400' : 'bg-slate-800 border border-slate-700 text-slate-300'}
                  `}>
                    {leader.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className={`font-bold truncate ${leader.isCurrentUser ? 'text-amber-400' : 'text-white'}`}>
                      {leader.name} {leader.isCurrentUser && '(Você)'}
                    </h3>
                    <div className="flex gap-1 mt-1">
                      {leader.badges && leader.badges.slice(0, 3).map((b, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-span-4 md:col-span-3 text-right pr-4">
                  <span className={`text-lg font-black tracking-tight ${isTop3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {leader.xp.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 ml-1 font-bold uppercase">XP</span>
                </div>

                <div className="hidden md:flex col-span-3 justify-end pr-6">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400">
                    <Flame className="w-4 h-4" />
                    <span className="font-bold">{leader.streak} d</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
