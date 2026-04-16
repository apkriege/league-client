/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    {
      pattern: /border-(red|green|blue|yellow|purple|pink|indigo)-(500|600|700)/,
    },
  ],
  theme: {
    extend: {
      spacing: {
        body: "1rem",
      },
    },
  },
};
