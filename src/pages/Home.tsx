import { Button, Card } from '@radix-ui/themes'
import { ArrowRight, ChartPie, Calculator, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import './home.css'

const tools = [
  {
    to: '/branch-locator',
    title: 'Find a branch',
    description: 'Check nearby locations, opening hours and directions.',
    action: 'Find a branch',
    icon: MapPin,
  },
  {
    to: '/loan-eligibility',
    title: 'Check loan eligibility',
    description: 'Get an estimate of what you could borrow and repay each month.',
    action: 'Check eligibility',
    icon: Calculator,
  },
  {
    to: '/spending-insights',
    title: 'Explore your spending',
    description: 'See where your money goes and how your budgets are doing.',
    action: 'View spending',
    icon: ChartPie,
  },
]

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-page__header" aria-labelledby="home-heading">
        <div className="home-page__copy">
          <p className="home-page__welcome">Your everyday banking tools</p>
          <h1 id="home-heading">A little clarity. A better next step.</h1>
          <p className="home-page__intro">
            Find a branch, check a loan estimate or get a clearer view of your spending.
          </p>
          <Button asChild className="btn btn--primary">
            <a href="#home-tools">
              Explore the tools <ArrowRight size={18} aria-hidden="true" />
            </a>
          </Button>
        </div>
        <div className="home-page__visual">
          <img
            src="/images/banking-tools.webp"
            alt="A woman using her phone at a desk"
            width="1100"
            height="500"
          />
          <p>Make room for your next move.</p>
        </div>
      </section>

      <section id="home-tools" className="home-page__tools" aria-labelledby="home-tools-heading">
        <p className="home-page__welcome">Simple tools. Useful answers.</p>
        <h2 id="home-tools-heading">What would you like to do?</h2>
        <div className="home-page__body">
          {tools.map(({ to, title, description, action, icon: Icon }) => (
            <Card key={to} asChild size="3" className="home-tool">
              <article>
                <span className="home-tool__icon">
                  <Icon size={25} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
                <Button asChild className="btn btn--primary">
                  <Link to={to}>
                    {action} <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </Button>
              </article>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
