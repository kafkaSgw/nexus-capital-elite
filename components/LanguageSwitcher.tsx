'use client'

import { useTranslation } from '@/lib/i18n'
import { Languages } from 'lucide-react'

export default function LanguageSwitcher() {
    const { lang, setLang } = useTranslation()

    return (
        <button
            onClick={() => setLang(lang === 'pt-BR' ? 'en' : 'pt-BR')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all text-xs font-medium"
            title={lang === 'pt-BR' ? 'Switch to English' : 'Mudar para Português'}
        >
            <Languages className="w-4 h-4" />
            <span className="font-mono text-[10px] uppercase">{lang === 'pt-BR' ? 'EN' : 'PT'}</span>
        </button>
    )
}
