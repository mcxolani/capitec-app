import * as Collapsible from '@radix-ui/react-collapsible'
import { useEffect, useRef } from 'react'
import { formatDistance } from '@/utils/distance'
import type { BranchWithDistance } from '@/types/branch'
import BranchInfoCard from './BranchInfoCard'

interface Props {
  branch: BranchWithDistance
  selected: boolean
  onSelect: (id: string | null) => void
}

export default function BranchListItem({ branch, selected, onSelect }: Props) {
  const ref = useRef<HTMLLIElement>(null)

  // when selected from the map, bring the list item into view
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selected])

  return (
    <Collapsible.Root
      open={selected}
      onOpenChange={(open) => onSelect(open ? branch.id : null)}
      asChild
    >
      <li ref={ref} className={selected ? 'branch-item branch-item--selected' : 'branch-item'}>
        <Collapsible.Trigger asChild>
          <button type="button" className="branch-item__header">
            <span className="branch-item__name">{branch.name}</span>
            <span className="branch-item__distance">{formatDistance(branch.distanceKm)}</span>
            <span className="branch-item__address">{branch.address}</span>
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="branch-item__body">
          <BranchInfoCard branch={branch} hideTitle />
        </Collapsible.Content>
      </li>
    </Collapsible.Root>
  )
}
