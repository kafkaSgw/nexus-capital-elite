'use client'

import { Trophy, Star, Target, Crown, Lock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function WealthMilestones({ currentNetWorth = 8500000 }: { currentNetWorth?: number }) {
  const milestones = [
    { id: 1, title: 'Primeiro Milhão', value: 1000000, icon: Star, achieved: currentNetWorth >= 1000000 },
    { id: 2, title: 'Independência Nível 1', value: 5000000, icon: Target, achieved: currentNetWorth >= 5000000 },
    { id: 3, title: 'Patrimônio Elite', value: 10000000, icon: Crown, achieved: currentNetWorth >= 10000000 },
    { id: 4, title: 'Legacy Wealth', value: 50000000, icon: Lock, achieved: currentNetWorth >= 50000000 },
  ]

  const nextMilestone = milestones.find(m => !m.achieved) || milestones[milestones.length - 1]
  const prevMilestone = [...milestones].reverse().find(m => m.achieved) || { value: 0 }
  
  const progressToNext = nextMilestone && prevMilestone && nextMilestone.value > prevMilestone.value
    ? ((currentNetWorth - prevMilestone.value) / (nextMilestone.value - prevMilestone.value)) * 100
    : 100

  return (
    <div className="card-premium">
      <div className="p-6 border-b border-dark-border">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent-yellow" />
          Jornada Patrimonial
        </h3>
      </div>

      <div className="p-6 space-y-6">
        <div className="relative">
          <div className="flex justify-between items-end mb-2">
            <div>
               <p className="text-sm text-gray-400">Progresso Atual</p>
               <p className="text-xl font-bold text-white number-font mt-1">
                 {formatCurrency(currentNetWorth)}
               </p>
            </div>
            <div className="text-right">
               <p className="text-sm font-medium text-gray-400">
                 Próxima Meta: <span className="text-white">{formatCurrency(nextMilestone.value)}</span>
               </p>
            </div>
          </div>
          <div className="h-4 bg-dark-bg rounded-full overflow-hidden border border-dark-border/50 relative">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-yellow/50 to-accent-yellow rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(Math.max(progressToNext, 0), 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {milestones.map((milestone) => {
            const Icon = milestone.icon
            return (
              <div 
                key={milestone.id} 
                className={`p-4 rounded-xl flex items-center justify-between border transition-all ${milestone.achieved ? 'bg-gradient-to-r from-accent-yellow/10 to-transparent border-accent-yellow/20 hover:border-accent-yellow/40' : 'bg-dark-card border-dark-border hover:border-dark-border/80'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${milestone.achieved ? 'bg-accent-yellow/20 text-accent-yellow shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-dark-bg text-gray-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-medium ${milestone.achieved ? 'text-accent-yellow' : 'text-gray-400'}`}>
                      {milestone.title}
                    </p>
                    <p className="text-sm text-gray-500 number-font">{formatCurrency(milestone.value)}</p>
                  </div>
                </div>
                {milestone.achieved ? (
                  <span className="text-xs font-bold text-accent-yellow bg-accent-yellow/10 px-3 py-1.5 rounded-lg border border-accent-yellow/20 shadow-sm">
                    Alcançado
                  </span>
                ) : (
                  <span className="text-xs font-bold text-gray-600 bg-dark-bg px-3 py-1.5 rounded-lg border border-dark-border">
                    Bloqueado
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
