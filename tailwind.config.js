module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        error: 'var(--color-error)'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
