import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 壮族传统配色 | Zhuang Traditional Colors
        zhuang: {
          red: '#D73C2C',
          blue: '#1E5BA8',
          black: '#1A1A1A',
          gold: '#D4AF37',
          green: '#2E8B57',
        },
        // 水墨画风格 | Ink Painting Style
        ink: {
          black: '#000000',
          'gray-dark': '#333333',
          gray: '#808080',
          'gray-light': '#CCCCCC',
          cyan: '#7FCDCD',
          green: '#90EE90',
        },
        // ASEAN 官方色彩 | ASEAN Official Colors
        asean: {
          red: '#C8102E',
          blue: '#003DA5',
          yellow: '#FFD100',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        zhuang: ['var(--font-zhuang)', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'mist-flow': 'mistFlow 10s ease-in-out infinite',
        'drum-rotate': 'drumRotate 2s ease-in-out',
        'embroidery-bounce': 'embroideryBounce 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        mistFlow: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '50%': { transform: 'translateX(10px) translateY(-10px)' },
        },
        drumRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        embroideryBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'ink-texture': "url('/images/textures/ink-paper.jpg')",
        'zhuangjin-pattern': "url('/images/patterns/zhuangjin-bg.svg')",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
