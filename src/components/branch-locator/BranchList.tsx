import BranchListItem from './BranchListItem'
import type { BranchWithDistance } from '@/types/branch'

interface Props {
  branches: BranchWithDistance[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  hasOrigin: boolean
  loading: boolean
  radiusKm: number
}

export default function BranchList({
  branches,
  selectedId,
  onSelect,
  hasOrigin,
  loading,
  radiusKm,
}: Props) {
  const message = !hasOrigin
    ? 'Search for an address or use your location to find nearby branches.'
    : loading
      ? 'Loading branches…'
      : branches.length === 0
        ? `No branches within ${radiusKm} km. Try a larger radius.`
        : null

  if (message) return <p className="branch-list__empty">{message}</p>

  return (
    <div className="branch-list">
      <p className="branch-list__summary">
        {branches.length} {branches.length === 1 ? 'branch' : 'branches'} within {radiusKm} km
      </p>
      <ul className="branch-list__items">
        {branches.map((b) => (
          <BranchListItem
            key={b.id}
            branch={b}
            selected={b.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  )
}
