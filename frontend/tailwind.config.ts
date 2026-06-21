import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0A0F1C',
          secondary: '#121826',
          card: '#161F32',
          hover: '#1a2540',
        },
        accent: {
          primary: '#6366F1',
          secondary: '#06B6D4',
        },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          default: 'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.18)',
        },
        forge: {
          indigo: '#6366F1',
          cyan: '#06B6D4',
          green: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          blue: '#3B82F6',
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease forwards',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
