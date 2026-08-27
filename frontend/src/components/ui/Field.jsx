const CONTROL =
  'w-full rounded-md border border-rule bg-surface px-2.5 py-1.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink disabled:bg-ground'

const LABEL = 'mb-1 block font-mono text-[11px] tracking-[0.08em] text-muted uppercase'

function Wrapper({ label, error, hint, children }) {
  return (
    <label className="block">
      {label && <span className={LABEL}>{label}</span>}
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-sig-red">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-muted">{hint}</span>
      )}
    </label>
  )
}

export function Input({ label, error, hint, className = '', ...props }) {
  return (
    <Wrapper label={label} error={error} hint={hint}>
      <input
        className={`${CONTROL} ${error ? 'border-sig-red' : ''} ${className}`}
        {...props}
      />
    </Wrapper>
  )
}

export function Textarea({ label, error, hint, className = '', ...props }) {
  return (
    <Wrapper label={label} error={error} hint={hint}>
      <textarea className={`${CONTROL} resize-y ${className}`} {...props} />
    </Wrapper>
  )
}

/** `options` is `[{ value, label }]`; `placeholder` adds an empty "any" choice. */
export function Select({ label, error, hint, options, placeholder, className = '', ...props }) {
  return (
    <Wrapper label={label} error={error} hint={hint}>
      <select className={`${CONTROL} ${className}`} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Wrapper>
  )
}
