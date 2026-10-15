import { formatDistance } from '@/utils/distance'
import type { BranchWithDistance } from '@/types/branch'

interface Props {
  branch: BranchWithDistance
  hideTitle?: boolean
}

export default function BranchInfoCard({ branch, hideTitle = false }: Props) {
  return (
    <div className="info-card">
      {!hideTitle && <h3 className="info-card__title">{branch.name}</h3>}
      <p>{branch.address}</p>
      <dl className="info-card__meta">
        <div>
          <dt>Distance</dt>
          <dd>{formatDistance(branch.distanceKm)}</dd>
        </div>
        <div>
          <dt>Hours</dt>
          <dd>{branch.hours}</dd>
        </div>
        {branch.phone && (
          <div>
            <dt>Phone</dt>
            <dd>
              <a href={`tel:${branch.phone.replace(/\s/g, '')}`}>{branch.phone}</a>
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}
