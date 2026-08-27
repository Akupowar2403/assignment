// Chrome stays neutral so the only colour on screen is task signal.
const VARIANTS = {
  primary: 'bg-ink text-white hover:bg-ink/90',
  secondary: 'bg-surface text-ink ring-1 ring-rule hover:bg-ground',
  ghost: 'text-muted hover:bg-ground hover:text-ink',
  danger: 'bg-sig-red text-white hover:brightness-95',
}

const SIZES = {
  sm: 'h-8 px-2.5 text-[13px]',
  md: 'h-9 px-3.5 text-sm',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  )
}
