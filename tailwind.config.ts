import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 배경 그라데이션 색상
        "bg-top": "#0a0a1a",
        "bg-mid": "#1a1040",
        "bg-bottom": "#2d1b4e",
        "bg-warm": "#4a2040",

        // 포인트 컬러
        "accent-red": "#e94560",
        "accent-orange": "#ff6b35",
        "accent-purple": "#7b2ff7",

        // 글래스모피즘
        "glass-bg": "rgba(255, 255, 255, 0.08)",
        "glass-border": "rgba(255, 255, 255, 0.15)",

        // 텍스트
        "text-primary": "#ffffff",
        "text-secondary": "rgba(255, 255, 255, 0.7)",
        "text-muted": "rgba(255, 255, 255, 0.5)",
      },
    },
  },
  plugins: [],
}

export default config
