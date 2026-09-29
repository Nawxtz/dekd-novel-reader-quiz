import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dekd: {
          orange: "#f96519",
          "orange-hover": "#e05510",
          "orange-light": "#fff5ed",
          "orange-subtle": "#ffe8d6",
          green: "#8bc321",
          "green-hover": "#78ab1a",
          "green-light": "#f4fae8",
          dark: "#222222",
          gray: "#666666",
          "gray-light": "#999999",
          border: "#e5e7eb",
          bg: "#f8f9fa",
        },
      },
      aspectRatio: {
        "2/3": "2 / 3",
        "16/9": "16 / 9",
      },
    },
  },
  plugins: [],
};
export default config;
