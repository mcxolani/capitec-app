import { Button } from '@radix-ui/themes'
import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="page-message">
      <h1>Page not found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist.</p>
      <Button asChild size="3" className="btn btn--primary">
        <Link to="/">Go to home</Link>
      </Button>
    </div>
  )
}
