/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#06060b",
        surface: "#0f0f18",
        "surface-elevated": "#161622",
        border: "#2a2a3d",
        primary: "#8b5cf6",
        "primary-muted": "#6d28d9",
        accent: "#38bdf8",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        muted: "#71717a",
        foreground: "#fafafa",
        "foreground-secondary": "#a1a1aa",
        glow: "#a78bfa",
        gold: "#fbbf24",
        epic: "#c084fc",
        legendary: "#f472b6",
        rare: "#60a5fa",
        streak: "#fb923c",
        xp: "#a78bfa",
        coin: "#38bdf8",
      },
      borderRadius: {
        game: "20px",
      },
    },
  },
  plugins: [],
};
