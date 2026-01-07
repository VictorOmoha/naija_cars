/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nigerian Pride Color Palette
        naija: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#008753', // Nigerian Green
          600: '#00753D',
          700: '#00632E',
          800: '#00521F',
          900: '#003D15',
        },
        pearl: {
          50: '#FFFFFF',
          100: '#FEFEFE',
          200: '#FAFAFA',
          300: '#F5F5F5',
          400: '#F0F0F0',
          500: '#EBEBEB', // Off-white/Pearl
          600: '#D6D6D6',
          700: '#C2C2C2',
          800: '#ADADAD',
          900: '#999999',
        },
        gold: {
          50: '#FFF9E6',
          100: '#FFF3CC',
          200: '#FFE699',
          300: '#FFD966',
          400: '#FFCC33',
          500: '#FFB81C', // Nigerian Gold accent
          600: '#E6A519',
          700: '#CC9216',
          800: '#B38013',
          900: '#996D10',
        },
        charcoal: {
          50: '#F5F5F5',
          100: '#EBEBEB',
          200: '#D6D6D6',
          300: '#C2C2C2',
          400: '#8F8F8F',
          500: '#1A1A1A',
          600: '#141414',
          700: '#0F0F0F',
          800: '#0A0A0A',
          900: '#050505',
        },
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
      },
      fontFamily: {
        'display': ['Poppins', 'system-ui', 'sans-serif'], // Bold, modern
        'heading': ['Inter', 'Helvetica', 'Arial', 'sans-serif'], // Clean, professional
        'body': ['Inter', 'system-ui', 'sans-serif'], // Clean, readable
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-naija': 'linear-gradient(135deg, #008753 0%, #00632E 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFB81C 0%, #CC9216 100%)',
        'gradient-luxury': 'linear-gradient(135deg, #FFB81C 0%, #CC9216 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
        'gradient-nigeria': 'linear-gradient(180deg, #008753 0%, #008753 50%, #FFFFFF 50%, #FFFFFF 100%)',
        'gradient-hero': 'linear-gradient(135deg, #008753 0%, #10B981 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'warm': '0 4px 20px rgba(0, 135, 83, 0.15)',
        'warm-lg': '0 8px 32px rgba(0, 135, 83, 0.2)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'button': '0 4px 14px rgba(0, 135, 83, 0.3)',
        'lifted': '0 10px 40px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 30px rgba(255, 184, 28, 0.4)',
        'luxury': '0 4px 20px rgba(255, 184, 28, 0.3)',
        'luxury-lg': '0 8px 32px rgba(255, 184, 28, 0.4)',
        'luxury-xl': '0 12px 48px rgba(255, 184, 28, 0.5)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
}
