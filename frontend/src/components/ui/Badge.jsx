import { TONE_COLOR } from '../../lib/constants'

/**
 * A signal mark: a colour dot plus a label. Deliberately not a filled pill —
 * dozens of pills in a table shout over each other, dots scan cleanly.
 */
export function Badge({ tone = 'neutral', children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] whitespace-nowrap text-ink">
      <span
        aria-hidden
        className="size-2 shrink-0 rounded-full"
        style={{ background: TONE_COLOR[tone] }}
      />
      {children}
    </span>
  )
}
