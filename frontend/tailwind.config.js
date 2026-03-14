/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'at-primary': '#6366f1',
        'at-primary-hover': '#4f46e5',
        'at-accent': '#8b5cf6',
        'at-success': '#10b981',
        'at-bg': '#0a0a0f',
        'at-surface': '#111118',
        'at-surface-2': '#1a1a24',
        'at-border': 'rgba(255, 255, 255, 0.08)',
        'at-text': '#f1f1f4',
        'at-muted': '#9ca3af',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
