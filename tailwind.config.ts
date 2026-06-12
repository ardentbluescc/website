import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    borderRadius: {
      'none': '0px',
      'sm':   '0px',
      DEFAULT: '0px',
      'md':   '0px',
      'lg':   '0px',
      'xl':   '0px',
      '2xl':  '0px',
      '3xl':  '0px',
      'full': '0px',
    },
    extend: {
      colors: {
        navy: {
          900: '#060D1A',
          800: '#0B1220',
          700: '#0F1A2E',
          600: '#122240',
        },
        ardent: {
          DEFAULT: '#1D6EF5',
          light: '#3B82F6',
          bright: '#60A5FA',
          card: '#111827',
          border: '#1E293B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scan-line': 'scanLine 1.8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scanLine: {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
