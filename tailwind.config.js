/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "baffle-navy": "#1B263B",
        "anchors-deep": "#111827",
        "signal-slate": "#334155",
        "software-gray": "#9CA3AF",
        "clarity-white": "#F4F7FA",
        "parchment-white": "#F8F3E8",
        "ai-blue": "#3A86FF",
        "signal-orange": "#F97316",
        "stewardship-gold": "#C6A15B",
        "covenant-red": "#7F1D1D",
      },
    },
  },
  plugins: [],
};
