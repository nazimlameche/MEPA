import type { Config } from 'tailwindcss';

export const baseConfig: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          50: '#EEEDFC',
          100: '#D4D2F8',
          200: '#ABA8F1',
          300: '#827EEA',
          400: '#6964EE',
          500: '#4F46E5',
          600: '#3730C3',
          700: '#2A249A',
          800: '#1E1970',
          900: '#120F47',
        },
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
        },
        danger: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Bricolage Grotesque', 'sans-serif'],
        body: ['var(--font-body)', 'DM Sans', 'sans-serif'],
        sans: ['var(--font-body)', 'DM Sans', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
};

export default baseConfig;
