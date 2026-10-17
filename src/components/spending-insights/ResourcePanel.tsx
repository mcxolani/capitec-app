import { Button, Callout, Spinner } from '@radix-ui/themes'
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
        <Spinner /> Loading…
      </p>
    )
  if (resource.error)
    return (
      <Callout.Root color="red" role="alert">
        <Callout.Text>{resource.error}</Callout.Text>
        <Button size="3" variant="outline" className="btn" type="button" onClick={resource.retry}>
          Try again
        </Button>
      </Callout.Root>
    )
  return resource.data === undefined ? <p>No data available.</p> : children(resource.data)
}
