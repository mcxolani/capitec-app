import type { ReactNode } from 'react'

export default function ResourcePanel<T>({
  resource,
  children,
}: {
  resource: { data?: T; loading: boolean; error?: string; retry: () => void }
  children: (data: T) => ReactNode
}) {
  if (resource.loading)
    return (
      <p className="spending-muted" role="status">
        Loading…
      </p>
    )
  if (resource.error)
    return (
      <div role="alert">
        <p>{resource.error}</p>
        <button className="btn" type="button" onClick={resource.retry}>
          Try again
        </button>
      </div>
    )
  return resource.data === undefined ? <p>No data available.</p> : children(resource.data)
}
