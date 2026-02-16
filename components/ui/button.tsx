// ── Types ──

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger"
  isLoading?: boolean
}

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

// ── Button (dashboard / general use) ──

export function Button({
  children,
  variant = "primary",
  isLoading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className ?? ""}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "로딩..." : children}
    </button>
  )
}

// ── GradientButton (landing CTA) ──

export function GradientButton({
  children,
  className,
  ...props
}: GradientButtonProps) {
  return (
    <button
      className={`bg-gradient-to-r from-accent-red to-accent-orange text-white text-sm font-bold uppercase tracking-wider px-8 py-3 rounded-full hover:brightness-110 hover:scale-105 transition-all duration-200 shadow-lg shadow-accent-red/25 ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  )
}
