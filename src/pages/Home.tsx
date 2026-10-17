import { ArrowRight, ChartPie, Calculator, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import './home.css'

const tools = [
  {
    to: '/branch-locator',
    title: 'Branch finder',
    description: 'Find a nearby branch, check opening hours and get directions.',
    action: 'Find a branch',
    icon: MapPin,
  },
  {
    to: '/loan-eligibility',
    title: 'Loan eligibility',
    description: 'Get an estimate of what you could borrow and your monthly repayments.',
    action: 'Check eligibility',
    icon: Calculator,
  },
  {
    to: '/spending-insights',
    title: 'Spending insights',
    description: 'See where your money goes and how your spending compares with your budgets.',
    action: 'View spending',
    icon: ChartPie,
  },
]

export default function Home() {
  return (
    <section className="home-page" aria-labelledby="home-heading">
      <div className="home-page__header">
        <p className="home-page__welcome">Welcome to Capitec</p>
        <h1 id="home-heading">What would you like to do?</h1>
        <p className="home-page__intro">A few useful tools to help you plan your next step.</p>
      </div>

      <div className="home-page__body">
        {tools.map(({ to, title, description, action, icon: Icon }) => (
          <Link key={to} to={to} className="home-tool" aria-labelledby={`${to.slice(1)}-title`}>
            <span className="home-tool__icon">
              <Icon size={26} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <h2 id={`${to.slice(1)}-title`}>{title}</h2>
            <p>{description}</p>
            <span className="home-tool__action">
              {action}
              <ArrowRight size={19} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      <p className="home-page__disclaimer">Loan estimates and spending figures use demo data.</p>
    </section>
  )
}
