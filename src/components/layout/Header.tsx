import { useEffect, useState } from 'react'
import { NavLink } from 'react-router'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/branch-locator', label: 'Branch Locator' },
  { to: '/loan-eligibility', label: 'Loan Eligibility' },
  { to: '/spending-insights', label: 'Spending Insights' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <header className="header">
      <span className="header__brand">Capitec Bank</span>
      <button
        type="button"
        className="header__toggle"
        aria-expanded={menuOpen}
        aria-controls="main-nav"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
        <span className="header__toggle-bar" aria-hidden="true" />
        <span className="header__toggle-bar" aria-hidden="true" />
        <span className="header__toggle-bar" aria-hidden="true" />
      </button>
      <nav
        id="main-nav"
        className={menuOpen ? 'header__nav header__nav--open' : 'header__nav'}
        aria-label="Main"
      >
        {links.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMenuOpen(false)}
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
