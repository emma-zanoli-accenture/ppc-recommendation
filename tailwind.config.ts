import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base / background tiers — Paper (warm cream light theme)
        ink: '#F8F6F1',
        surface: '#FFFFFF',
        'surface-raised': '#F3F0E8',
        'surface-overlay': '#EBE7DC',
        'border-subtle': '#D8D2C4',
        'border-strong': '#C5BFAF',
        // Brand accent — UI chrome only, never AI elements
        brand: '#0F2744',
        'brand-dim': '#1A3A5C',
        'brand-subtle': '#E8EEF5',
        // Agentic accent — AI elements ONLY
        agent: '#7C3AED',
        'agent-dim': '#6D28D9',
        'agent-subtle': '#EDE9FE',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
