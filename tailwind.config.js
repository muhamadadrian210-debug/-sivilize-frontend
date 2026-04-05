/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F1A",
        card: "#121826",
        border: "#1E293B",
        primary: {
          DEFAULT: "#FF7A00",
          hover: "#FF8C1A",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#94A3B8",
        },
        success: "#22C55E",
      },
      boxShadow: {
        'glow': '0 0 15px rgba(255, 122, 0, 0.3)',
        'glow-hover': '0 0 25px rgba(255, 122, 0, 0.5)',
      }
    },
  },
  plugins: [],
}

