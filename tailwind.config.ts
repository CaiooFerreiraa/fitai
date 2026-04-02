import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        '3xl': '1920px',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#ff0033",
        surface: "#1c1c1f",
        "surface-dark": "#0a0a0b",
      },
      boxShadow: {
        'brutalist': '10px 10px 0 0 #000000',
        'brutalist-lg': '20px 20px 0 0 #000000',
        'brutalist-xl': '35px 35px 0 0 #000000',
        'tactical': '0 20px 50px -10px rgba(0,0,0,0.8), 0 10px 20px -5px rgba(0,0,0,0.8)',
        'tactical-red': '0 0 50px -10px rgba(255, 0, 51, 0.4)',
      },
      animation: {
        'aura-pulse': 'aura-pulse 4s ease-in-out infinite',
        'glitch': 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite',
      },
      keyframes: {
        'aura-pulse': {
          '0%, 100%': { opacity: '0.04' },
          '50%': { opacity: '0.12' },
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
