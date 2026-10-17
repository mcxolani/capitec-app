import { useState } from 'react'
import { IconButton, Popover } from '@radix-ui/themes'
import { Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/branch-locator', label: 'Branch Locator' },
  { to: '/loan-eligibility', label: 'Loan Eligibility' },
  { to: '/spending-insights', label: 'Spending Insights' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigation = links.map(({ to, label, end }) => (
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
  ))

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__brand" aria-label="Capitec home">
          <img
            width="30"
            height="24"
            src="https://www.capitecbank.co.za/globalassets/approved-images/icons/capitec-logo-small.svg"
            alt=""
          />
          Capitec
        </Link>
        <nav className="header__nav" aria-label="Main">
          {navigation}
        </nav>
        <Popover.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Popover.Trigger>
            <IconButton
              size="3"
              variant="ghost"
              className="header__toggle"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </IconButton>
          </Popover.Trigger>
          <Popover.Content
            align="end"
            sideOffset={12}
            className="header__menu"
            aria-label="Navigation menu"
          >
            <nav className="header__mobile-nav" aria-label="Mobile">
              {navigation}
            </nav>
          </Popover.Content>
        </Popover.Root>
      </div>
    </header>
  )
}
