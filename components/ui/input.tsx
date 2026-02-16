import { forwardRef } from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, className, id, ...props }, ref) {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-white/70"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 bg-white/[0.08] border rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red/50 outline-none transition-colors ${
            error ? "border-red-500/50" : "border-white/[0.15]"
          } ${className ?? ""}`}
          {...props}
        />
        {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
      </div>
    )
  }
)
