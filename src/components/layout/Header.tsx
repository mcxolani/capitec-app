import { NavLink } from 'react-router'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/branch-locator', label: 'Branch Locator' },
  { to: '/loan-eligibility', label: 'Loan Eligibility' },
  { to: '/spending-insights', label: 'Spending Insights' },
]

export default function Header() {
  return (
    <header className="header">
      <span className="header__brand">Capitec Bank</span>
      <nav className="header__nav" aria-label="Main">
        {links.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? 'header__link header__link--active' : 'header__link'
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
