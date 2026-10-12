import type { Config } from 'tailwindcss';

// The whole look of the app is decided here, once. `colors` is replaced (not extended), so only the
// BoundaryPro palette exists: a class like bg-gray-100 simply does not compile, and no page can drift off-palette.
//
// Each hue has a strong shade for fills and a "light" and "dark" pair for badges and alerts.
// Amber and teal are too pale to be text on a light background, so their text uses the "dark" shade.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      navy: { DEFAULT: '#0B2545', 700: '#1B3A66', 500: '#4A5B73', 100: '#DCE2EB', 50: '#EEF1F6' }, // headings, sidebar, primary buttons
      amber: { DEFAULT: '#F5A623', light: '#FDEBC8', dark: '#7A4E00' }, // accents and the one key action on a screen
      teal: { DEFAULT: '#13A89E', light: '#D6F1EE', dark: '#0B6B64' }, // success, available, positive money
      cream: { DEFAULT: '#F7F4EA', deep: '#EDE8D6' }, // page background
      danger: { DEFAULT: '#D64545', light: '#FBE2E2', dark: '#A12A2A' }, // overdue, errors, destructive actions
    },
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      // One soft shadow for every card, tinted with the navy instead of plain grey
      boxShadow: {
        card: '0 1px 2px rgba(11, 37, 69, 0.06), 0 10px 24px -14px rgba(11, 37, 69, 0.28)',
        modal: '0 24px 60px -20px rgba(11, 37, 69, 0.55)',
      },
      keyframes: {
        // The route board on the landing page flips each number once, like a departure board
        flap: {
          '0%': { transform: 'rotateX(-90deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0)', opacity: '1' },
        },
        'toast-in': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        flap: 'flap 0.55s ease-out both',
        'toast-in': 'toast-in 0.2s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config;
