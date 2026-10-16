import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="page-message">
      <h1>Page not found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link className="btn btn--primary" to="/">
        Go to home
      </Link>
    </div>
  )
}
