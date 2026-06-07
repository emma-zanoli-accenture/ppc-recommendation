import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base / background tiers
        ink: '#0D1B2A',
        surface: '#112233',
        'surface-raised': '#162E44',
        'surface-overlay': '#1C3A55',
        'border-subtle': '#1E3A52',
        'border-strong': '#2A5070',
        // Brand accent — UI chrome only, never AI elements
        brand: '#2E9EF7',
        'brand-dim': '#1A6FAF',
        'brand-subtle': '#0D3A5C',
        // Agentic accent — AI elements ONLY
        agent: '#A78BFA',
        'agent-dim': '#6D52C2',
        'agent-subtle': '#2D1F5E',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
