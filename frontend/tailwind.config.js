/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#090d16',
        surface: '#111827',
        'surface-2': '#1f2937',
        'surface-3': '#283449',
        border: '#374151',
        primary: '#3b82f6',
        'primary-dark': '#2563eb',
        'primary-light': '#60a5fa',
        accent: '#a855f7',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(59,130,246,0.25), 0 8px 24px -8px rgba(59,130,246,0.35)',
        'glow-lg': '0 0 40px -8px rgba(59,130,246,0.45)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: 0, transform: 'translateX(12px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseGlow: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.55 } },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out both',
        slideUp: 'slideUp 0.4s ease-out both',
        slideInRight: 'slideInRight 0.3s ease-out both',
        shimmer: 'shimmer 2.5s linear infinite',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
}
