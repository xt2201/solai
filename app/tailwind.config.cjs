/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Slate (Dark theme)
        slate: {
          950: '#0f172a', // bg-primary
          900: '#1e293b', // bg-secondary
          800: '#334155', // bg-tertiary
          700: '#475569', // bg-elevated
          500: '#64748b',
          400: '#94a3b8', // text-tertiary
          300: '#cbd5e1', // text-secondary
          200: '#e2e8f0',
          100: '#f1f5f9', // text-primary
        },
        // Primary gradient
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Base
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Accent gradient
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7', // Base
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      spacing: {
        '16': '64px',  // topnav height
        '60': '240px', // sidebar expanded
        '16': '64px',  // sidebar collapsed (same as default)
      },
      height: {
        'topnav': '64px',
      },
      width: {
        'sidebar-expanded': '240px',
        'sidebar-collapsed': '64px',
      },
      zIndex: {
        'topnav': '50',
        'sidebar': '30',
        'overlay': '40',
      },
    },
  },
  plugins: [],
}
