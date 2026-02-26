module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
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
