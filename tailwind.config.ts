import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        dark: "hsl(var(--dark-bg))",
      },
      aspectRatio: {
        '1/1': '1 / 1',
        '4/3': '4 / 3',
        '3/4': '3 / 4',
        '16/9': '16 / 9',
        '3/2': '3 / 2',
        '5/3': '5 / 3',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
};

export default config;
