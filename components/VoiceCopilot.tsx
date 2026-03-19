'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, Brain, Volume2, X } from 'lucide-react'

export default function VoiceCopilot() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'pt-BR'

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript
          setTranscript(text)
          processCommand(text)
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      } else {
        setSupported(false)
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) return
    
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setTranscript('')
      setResponse('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const processCommand = (text: string) => {
    const lower = text.toLowerCase()
    let reply = "Desculpe, não entendi. Tente perguntar sobre seu patrimônio, dividendos ou sobre o risco atual da carteira."

    if (lower.includes('patrimônio') || lower.includes('total') || lower.includes('dinheiro') || lower.includes('quanto eu tenho')) {
      reply = "Seu patrimônio líquido consolidado atual é de aproximadamente Oito Milhões e Quinhentos Mil Reais. Houve uma valorização de 2.4% este mês."
    } else if (lower.includes('dividendo') || lower.includes('provento') || lower.includes('renda') || lower.includes('pingou')) {
      reply = "A projeção de dividendos e proventos para este mês é de Quarenta e Cinco Mil Reais líquidos na conta, impulsionado por seus fundos imobiliários."
    } else if (lower.includes('risco') || lower.includes('cair') || lower.includes('bolsa') || lower.includes('volatilidade')) {
      reply = "O risco da sua carteira está rigorosamente controlado pelo nosso sistema. Seu Índice Sharpe atual é de 1.85, indicando forte blindagem contra quedas do Ibovespa."
    } else if (lower.includes('bom dia') || lower.includes('boa tarde') || lower.includes('olá') || lower.includes('nexus')) {
      reply = "Olá Diretor! Sou o Nexus Copilot, sua Inteligência Artificial particular. Como posso otimizar seu tempo hoje?"
    }

    setResponse(reply)
    speak(reply)
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.rate = 1.05
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  if (!supported) return null // Hide if browser doesn't support Web Speech API

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[60] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 bg-dark-card border border-primary/40 rounded-2xl p-5 shadow-[0_0_40px_rgba(37,99,235,0.15)] w-[calc(100vw-2rem)] sm:w-80 animate-in slide-in-from-bottom-5 duration-300 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent-purple to-primary" />
          <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isListening ? 'bg-primary animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-dark-bg border border-primary/30'}`}>
              <Brain className={`w-4 h-4 ${isListening ? 'text-white' : 'text-primary'}`} />
            </div>
            <h3 className="font-bold text-white text-sm">Nexus Copilot (Voz)</h3>
          </div>

          <div className="space-y-4">
            {transcript && (
              <div className="bg-dark-bg p-3 rounded-xl border border-dark-border/50 text-sm text-gray-300">
                <span className="text-gray-500 text-xs block mb-1">Você perguntou:</span>
                "{transcript}"
              </div>
            )}
            
            {response && (
              <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 text-sm text-white relative shadow-inner">
                 <Volume2 className="w-3 h-3 text-primary absolute top-3 right-3 opacity-50" />
                <span className="text-primary text-xs block mb-1">Resposta da Inteligência Auditiva:</span>
                {response}
              </div>
            )}

            {!transcript && !response && (
              <p className="text-sm text-gray-400 text-center py-4">
                Pressione o microfone e diga em voz alta algo como: <br/><br/>
                <span className="text-primary cursor-pointer hover:underline" onClick={() => processCommand("Qual o meu patrimônio?")}>"Qual o meu patrimônio?"</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating Microfone Button */}
      <button
        id="tour-copilot"
        onClick={() => {
          if (!isOpen) setIsOpen(true)
          toggleListening()
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border ${
          isListening 
            ? 'bg-primary border-primary/50 scale-110 shadow-[0_0_30px_rgba(37,99,235,0.6)]' 
            : 'bg-dark-card border-dark-border hover:border-primary/50 hover:bg-dark-hover'
        }`}
        aria-label="Ativar Comando de Voz Nexus"
      >
        {isListening ? (
          <div className="relative flex items-center justify-center">
             <Mic className="w-6 h-6 text-white relative z-10" />
             <div className="absolute inset-0 bg-white rounded-full opacity-30 animate-ping" />
          </div>
        ) : (
          <Mic className="w-6 h-6 text-primary" />
        )}
      </button>
    </div>
  )
}
