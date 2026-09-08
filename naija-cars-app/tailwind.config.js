/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shared premium marketplace design tokens
        ink: {
          DEFAULT: '#10281f',   // primary text, dark surfaces, borders, black buttons
          line: '#3A4A40',      // outlines / connectors on dark surfaces
          pill: '#1E3328',      // chips inside dark compare tray
        },
        brand: {
          DEFAULT: '#006b4a',   // primary actions, verified badges, hero bg
          hover: '#00583d',     // darkened ~8% for hover
        },
        amber: {
          DEFAULT: '#F5B840',   // secondary CTAs, highlights, warnings
          tint: '#FBF3DC',      // financing / monthly-payment panel bg
        },
        mint: {
          DEFAULT: '#8FD8B5',   // accent text on dark surfaces
        },
        paper: '#fcfdfb',       // page background
        greentint: '#edf4ef',   // verified-only panel, positive tag bg
        muted: '#61736b',       // secondary/meta text
        placeholdertext: '#8B948E', // input placeholders, inactive step labels
        lightborder: '#dce5df', // input borders inside white panels
        hairline: '#edf1ec',    // card-internal dividers
        warntext: '#B45309',    // inspection warnings
        herosub: '#D6EFE2',     // sub-copy on green hero
        darkmuted: '#AFC4B7',   // sub-copy on ink surfaces
        // Nigerian Pride Color Palette (legacy pages)
        naija: {
          50: '#f2f7f3',
          100: '#e3eee6',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#006b4a', // Nigerian Green
          600: '#00583d',
          700: '#004c34',
          800: '#00521F',
          900: '#003D15',
        },
        pearl: {
          50: '#fcfdfb',
          100: '#f2f6f2',
          200: '#dce5df',
          300: '#cfdbd2',
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
          500: '#263f34',
          600: '#243b31',
          700: '#173b2c',
          800: '#10281f',
          900: '#10281f',
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
        'archivo': ['Inter', 'Archivo', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'Archivo', 'system-ui', 'sans-serif'],
        'heading': ['Inter', 'Archivo', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'Archivo', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-naija': 'linear-gradient(135deg, #006b4a 0%, #00632E 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFB81C 0%, #CC9216 100%)',
        'gradient-luxury': 'linear-gradient(135deg, #FFB81C 0%, #CC9216 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
        'gradient-nigeria': 'linear-gradient(180deg, #006b4a 0%, #006b4a 50%, #FFFFFF 50%, #FFFFFF 100%)',
        'gradient-hero': 'linear-gradient(135deg, #006b4a 0%, #10B981 100%)',
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
        // Hard offset shadows — the "1b look" (never soft blurred)
        'hard': '0 2px 12px rgba(16,40,31,0.05)',
        'hard-sm': '0 2px 12px rgba(16,40,31,0.05)',
        'hard-lg': '0 2px 12px rgba(16,40,31,0.05)',
        'hard-green': '0 2px 12px rgba(16,40,31,0.05)',
        'hard-green-lg': '0 2px 12px rgba(16,40,31,0.05)',
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
