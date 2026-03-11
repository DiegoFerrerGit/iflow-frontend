module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        }
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-out-right': 'slideOutRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-out': 'fadeOut 0.3s ease-in forwards',
      },
      colors: {
        primary: "#a855f7",
        secondary: "#f472b6",
        background: "#16121d",
        surface: "#1f222e",
        error: "#f87171",
        accent: "#10b981",
        "background-dark": "#16121d",
        "card-dark": "#1f222e",
        "emerald-deep": "#064e3b",
        "ars-cyan": "#22d3ee",
        "sidebar-bg": "#0f0a15",
        "logout-coral": "#f87171",
        "dist-orange": "#fb923c",
        "dist-coral": "#fb7185",
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
