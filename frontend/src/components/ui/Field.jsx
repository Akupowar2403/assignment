const CONTROL =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-canvas'

function Wrapper({ label, error, hint, children }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>}
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-muted">{hint}</span>
      )}
    </label>
  )
}

export function Input({ label, error, hint, className = '', ...props }) {
  return (
    <Wrapper label={label} error={error} hint={hint}>
      <input className={`${CONTROL} ${error ? 'border-red-400' : ''} ${className}`} {...props} />
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
