import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B1120",
        panel: "#111a2e",
        edge: "#1e293b",
        accent: "#38bdf8",
      },
    },
  },
  plugins: [],
};

export default config;
