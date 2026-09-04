/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#08080c',
        panel: '#0e0e14',
        card: '#12121a',
        raised: '#181822',
        line: '#20202c',
        line2: '#2a2a38',
        muted: '#7c7c92',
        soft: '#b4b4c6',
        ink: '#ececf3',
        accent: { DEFAULT: '#7c6cf6', dim: '#5b4fd6', glow: '#a99cff' },
        ok: '#3ddc97',
        warn: '#f5b544',
        bad: '#f06a6a',
        info: '#4fb7f5',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,108,246,0.35), 0 0 24px rgba(124,108,246,0.15)',
        card: '0 1px 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { fadeIn: 'fadeIn .25s ease-out' },
    },
  },
  plugins: [],
}
