/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: "#050505",
          dark: "#0a0a0b",
          "deep-blue": "#001a4d",
          blue: "#0047ff",
          green: "#00ff41",
          neon: "#39ff14",
          border: "#1a1a1b",
          surface: "#0f0f12",
          alert: "#ff003c",
          warning: "#ffcc00",
        }
      },
      fontFamily: {
        ans: ['Inter', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, #1a1a1b 1px, transparent 1px)",
        'cyber-gradient': "linear-gradient(135deg, #001a4d 0%, #050505 100%)",
      },
      boxShadow: {
        'neon-glow': '0 0 10px rgba(57, 255, 20, 0.4)',
        'blue-glow': '0 0 15px rgba(0, 71, 255, 0.3)',
      }
    },
  },
  plugins: [],
}
