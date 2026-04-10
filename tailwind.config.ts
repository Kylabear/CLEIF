import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          night: "#0f172a",
          steel: "#1e293b",
          cyan: "#14b8a6",
          peach: "#fb923c"
        }
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"]
      },
      boxShadow: {
        glass: "0 12px 45px rgba(15, 23, 42, 0.25)"
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at 10% 10%, rgba(20,184,166,0.22), transparent 38%), radial-gradient(circle at 88% 16%, rgba(251,146,60,0.22), transparent 32%), linear-gradient(130deg, #0f172a 0%, #111827 40%, #020617 100%)"
      }
    }
  },
  plugins: []
};

export default config;
