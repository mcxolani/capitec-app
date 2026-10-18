import { Link } from 'react-router'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <strong>Capitec</strong>
          <p>Everyday tools for your next step.</p>
        </div>
        <nav aria-label="Footer">
          <Link to="/branch-locator">Find a branch</Link>
          <Link to="/loan-eligibility">Check loan eligibility</Link>
          <Link to="/spending-insights">Explore spending</Link>
        </nav>
      </div>
    </footer>
  )
}
