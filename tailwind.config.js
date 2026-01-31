/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    "border-blue-500",
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
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        golf: {
          primary: "#1F7FFF",
          "primary-content": "#FFFFFF",
          secondary: "#888888",
          "secondary-content": "#FFFFFF",
          accent: "#00B8E6",
          "accent-content": "#FFFFFF",
          neutral: "#2D2D2D",
          "neutral-content": "#FFFFFF",
          "base-100": "#FFFFFF",
          "base-200": "#fafcff",
          "base-300": "#f3f5f8",
          "base-content": "#000000",
          info: "#1F7FFF",
          "info-content": "#FFFFFF",
          success: "#2E8B57",
          "success-content": "#FFFFFF",
          warning: "#FF9800",
          "warning-content": "#FFFFFF",
          error: "#D32F2F",
          "error-content": "#FFFFFF",
        },
      },
    ],
    defaultTheme: "golf",
  },
};
