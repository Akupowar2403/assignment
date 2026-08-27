import { PRIORITY_BY_VALUE, STATUS_BY_VALUE } from '../lib/constants'
import { Badge } from './ui/Badge'

export const StatusBadge = ({ value }) => (
  <Badge tone={STATUS_BY_VALUE[value].tone}>{STATUS_BY_VALUE[value].label}</Badge>
)

export const PriorityBadge = ({ value }) => (
  <Badge tone={PRIORITY_BY_VALUE[value].tone}>{PRIORITY_BY_VALUE[value].label}</Badge>
)
