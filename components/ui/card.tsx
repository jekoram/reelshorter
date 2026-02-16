// ── Types ──

interface CardProps {
  children: React.ReactNode
  className?: string
}

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

// ── Card (dashboard / light use) ──

export function Card({ children, className }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className ?? ""}`}>
      {children}
    </div>
  )
}

// ── GlassCard (landing / dark theme glassmorphism) ──

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={`bg-white/[0.08] backdrop-blur-md border border-white/[0.15] rounded-2xl ${
        hover ? "hover:bg-white/[0.12] transition-colors" : ""
      } ${className ?? ""}`}
    >
      {children}
    </div>
  )
}
