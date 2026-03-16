'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

// ─── Web Audio API Sound Synthesizer ─────────────────────────────
type SoundType = 'click' | 'success' | 'error' | 'notification' | 'cash' | 'toggle'

let audioCtx: AudioContext | null = null

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume()
    }
    return audioCtx
}

function synthesizeSound(type: SoundType) {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    const masterGain = ctx.createGain()
    masterGain.connect(ctx.destination)
    masterGain.gain.setValueAtTime(0.15, now) // Keep sounds subtle

    switch (type) {
        case 'click': {
            const osc = ctx.createOscillator()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(800, now)
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.08)
            masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
            osc.connect(masterGain)
            osc.start(now)
            osc.stop(now + 0.08)
            break
        }
        case 'success': {
            // Two-tone ascending chime
            const osc1 = ctx.createOscillator()
            const osc2 = ctx.createOscillator()
            osc1.type = 'sine'
            osc2.type = 'sine'
            osc1.frequency.setValueAtTime(523, now) // C5
            osc2.frequency.setValueAtTime(659, now + 0.1) // E5
            const g1 = ctx.createGain()
            const g2 = ctx.createGain()
            g1.gain.setValueAtTime(0.12, now)
            g1.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
            g2.gain.setValueAtTime(0.001, now)
            g2.gain.setValueAtTime(0.12, now + 0.1)
            g2.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
            osc1.connect(g1).connect(ctx.destination)
            osc2.connect(g2).connect(ctx.destination)
            osc1.start(now)
            osc1.stop(now + 0.2)
            osc2.start(now + 0.1)
            osc2.stop(now + 0.35)
            break
        }
        case 'error': {
            const osc = ctx.createOscillator()
            osc.type = 'square'
            osc.frequency.setValueAtTime(280, now)
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.2)
            masterGain.gain.setValueAtTime(0.08, now)
            masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
            osc.connect(masterGain)
            osc.start(now)
            osc.stop(now + 0.2)
            break
        }
        case 'notification': {
            // Soft bell
            const osc = ctx.createOscillator()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(880, now) // A5
            osc.frequency.exponentialRampToValueAtTime(1100, now + 0.05)
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.15)
            masterGain.gain.setValueAtTime(0.1, now)
            masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
            osc.connect(masterGain)
            osc.start(now)
            osc.stop(now + 0.4)
            break
        }
        case 'cash': {
            // Ka-ching! coin sound
            const osc1 = ctx.createOscillator()
            const osc2 = ctx.createOscillator()
            osc1.type = 'sine'
            osc2.type = 'triangle'
            osc1.frequency.setValueAtTime(1200, now)
            osc1.frequency.exponentialRampToValueAtTime(2400, now + 0.05)
            osc2.frequency.setValueAtTime(3000, now + 0.05)
            osc2.frequency.exponentialRampToValueAtTime(1500, now + 0.2)
            const g1 = ctx.createGain()
            const g2 = ctx.createGain()
            g1.gain.setValueAtTime(0.1, now)
            g1.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
            g2.gain.setValueAtTime(0.001, now)
            g2.gain.setValueAtTime(0.08, now + 0.05)
            g2.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
            osc1.connect(g1).connect(ctx.destination)
            osc2.connect(g2).connect(ctx.destination)
            osc1.start(now)
            osc1.stop(now + 0.1)
            osc2.start(now + 0.05)
            osc2.stop(now + 0.3)
            break
        }
        case 'toggle': {
            const osc = ctx.createOscillator()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(500, now)
            osc.frequency.exponentialRampToValueAtTime(700, now + 0.05)
            masterGain.gain.setValueAtTime(0.08, now)
            masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
            osc.connect(masterGain)
            osc.start(now)
            osc.stop(now + 0.06)
            break
        }
    }
}

// ─── Context & Provider ──────────────────────────────────────────
interface SoundContextType {
    playSound: (type: SoundType) => void
    muted: boolean
    toggleMute: () => void
}

const SoundContext = createContext<SoundContextType>({
    playSound: () => { },
    muted: false,
    toggleMute: () => { },
})

export function useSoundFX() {
    return useContext(SoundContext)
}

export function SoundProvider({ children }: { children: ReactNode }) {
    const [muted, setMuted] = useState(true) // Default muted, user opts in

    useEffect(() => {
        const saved = localStorage.getItem('nexus-sound-muted')
        if (saved !== null) {
            setMuted(saved === 'true')
        }
    }, [])

    const toggleMute = useCallback(() => {
        setMuted(prev => {
            const next = !prev
            localStorage.setItem('nexus-sound-muted', String(next))
            // Play a small toggle sound when unmuting
            if (!next) {
                try { synthesizeSound('toggle') } catch { }
            }
            return next
        })
    }, [])

    const playSound = useCallback((type: SoundType) => {
        if (muted) return
        try {
            synthesizeSound(type)
        } catch (err) {
            // Silently fail - audio is non-critical
        }
    }, [muted])

    return (
        <SoundContext.Provider value={{ playSound, muted, toggleMute }}>
            {children}
        </SoundContext.Provider>
    )
}
