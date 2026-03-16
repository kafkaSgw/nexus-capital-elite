/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: 'var(--surface-1)',
          card: 'var(--surface-2)',
          border: 'var(--surface-border)',
          hover: 'var(--surface-hover)',
          surface: 'var(--surface-2)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)',
          lighter: 'var(--primary-lighter)',
          glow: 'var(--primary-glow)',
        },
        accent: {
          green: '#00E676', // Tech neon green
          'green-light': '#69F0AE',
          red: '#FF1744',   // Tech neon red
          'red-light': '#FF4569',
          yellow: '#FFEA00',
          purple: '#E040FB', // Cyber purple
          orange: '#FF9100',
          cyan: '#00E5FF',   // Tech cyan
        },
        corporate: {
          navy: '#05070B',
          slate: '#0F172A',
          steel: '#334155',
          silver: '#94A3B8',
          gold: '#C5A861', // More subdued tech gold
          'gold-light': '#E2C883',
          'gold-dark': '#9A7D37',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        /* Sleek Tech Shadows */
        card: '0 8px 32px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'card-hover': '0 12px 48px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        subtle: '0 2px 4px rgba(0, 0, 0, 0.2)',
        highlight: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',

        /* Vibrant but thin glows (High-Tech, NOT messy neon) */
        glow: '0 0 0 1px rgba(0, 112, 243, 0.2), 0 0 16px rgba(0, 112, 243, 0.15)',
        'glow-lg': '0 0 0 1px rgba(0, 112, 243, 0.3), 0 0 32px rgba(0, 112, 243, 0.2)',
        'glow-cyan': '0 0 0 1px rgba(0, 229, 255, 0.2), 0 0 16px rgba(0, 229, 255, 0.15)',
        'glow-purple': '0 0 0 1px rgba(224, 64, 251, 0.2), 0 0 16px rgba(224, 64, 251, 0.15)',

        'corporate': '0 4px 12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.02)',
        'corporate-lg': '0 16px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.03)',
        'float': '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2.5s infinite linear',
        'border-flow': 'borderFlow 4s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        pulseGlow: {
          '0%': { opacity: '0.6', filter: 'brightness(1)' },
          '100%': { opacity: '1', filter: 'brightness(1.5)' },
        }
      },
      backgroundSize: {
        '200%': '200% auto',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
}
