import * as Accordion from '@radix-ui/react-accordion'
import { Button, Card } from '@radix-ui/themes'
import { ArrowRight, ChartPie, Calculator, ChevronDown, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import './home.css'

const questions = [
  {
    question: 'Will checking a loan estimate affect my credit record?',
    answer:
      'No. This simulator uses the details you enter to calculate an estimate. It does not run a credit check or submit a loan application.',
  },
  {
    question: 'Is the spending dashboard connected to my account?',
    answer:
      'The dashboard uses demo data. You can explore categories, compare months and try the budget filters without connecting a bank account.',
  },
  {
    question: 'How do I find a branch near me?',
    answer:
      'Open the branch finder and search for an address or suburb, or choose “Use my location”. You can adjust the search radius, check branch hours and get directions.',
  },
]

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-page__header" aria-labelledby="home-heading">
        <div className="home-page__copy">
          <p className="home-page__welcome">Your everyday banking tools</p>
          <h1 id="home-heading">
            A little clarity.
            <br />A better next step.
          </h1>
          <p className="home-page__intro">
            Understand your spending, explore what you could borrow or find a branch nearby. Start
            with what matters to you.
          </p>
          <Button size="3" asChild className="btn btn--primary">
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
            fetchPriority="high"
          />
          <div className="home-page__visual-caption">
            Make room for
            <br />
            <strong>your next move.</strong>
          </div>
        </div>
      </section>

      <section id="home-tools" className="home-page__tools" aria-labelledby="home-tools-heading">
        <div className="home-page__section-heading">
          <p className="home-page__welcome">Simple tools. Useful answers.</p>
          <h2 id="home-tools-heading">What would you like to do?</h2>
        </div>
        <div className="home-page__body">
          <Card asChild className="home-tool">
            <article>
              <div className="home-tool__visual home-tool__visual--loan">
                <Calculator size={48} strokeWidth={1.4} aria-hidden="true" />
                <span>Plan with confidence</span>
              </div>
              <div className="home-tool__body">
                <p className="home-tool__eyebrow">Borrowing</p>
                <h3>See what could work for you</h3>
                <p>
                  Take a closer look at your income and expenses. Get an estimate of your loan
                  amount and monthly repayments.
                </p>
                <Button asChild className="btn btn--primary">
                  <Link to="/loan-eligibility" aria-label="Loan eligibility">
                    Check eligibility <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </article>
          </Card>
          <Card asChild className="home-tool home-tool--dark">
            <article>
              <div className="home-tool__visual home-tool__visual--spending">
                <ChartPie size={48} strokeWidth={1.4} aria-hidden="true" />
                <span>See the bigger picture</span>
              </div>
              <div className="home-tool__body">
                <p className="home-tool__eyebrow">Your money</p>
                <h3>Know where your money goes</h3>
                <p>
                  Explore your spending by category, compare your monthly totals and see how your
                  budgets are doing.
                </p>
                <Button asChild className="btn btn--primary">
                  <Link to="/spending-insights" aria-label="Spending insights">
                    View spending <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </article>
          </Card>
        </div>
        <Card asChild className="home-page__branch">
          <section aria-labelledby="home-branch-heading">
            <div className="home-page__branch-icon">
              <MapPin size={48} strokeWidth={1.4} aria-hidden="true" />
            </div>
            <div>
              <p className="home-tool__eyebrow">Here to help</p>
              <h3 id="home-branch-heading">Find a branch. Plan your visit.</h3>
              <p>Search your area, check opening hours and get directions before you leave.</p>
            </div>
            <Button asChild variant="outline" className="btn">
              <Link to="/branch-locator" aria-label="Branch finder">
                Find a branch <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          </section>
        </Card>
        <p className="home-page__disclaimer">Loan estimates and spending figures use demo data.</p>
      </section>

      <section className="home-page__questions" aria-labelledby="home-questions-heading">
        <div>
          <p className="home-page__welcome">Before you start</p>
          <h2 id="home-questions-heading">A few things to know</h2>
          <p>Quick answers to help you make the most of these tools.</p>
        </div>
        <Accordion.Root type="single" collapsible className="home-questions">
          {questions.map(({ question, answer }) => (
            <Accordion.Item key={question} value={question} className="home-questions__item">
              <Accordion.Header className="home-questions__heading">
                <Accordion.Trigger className="home-questions__trigger">
                  {question}
                  <ChevronDown size={20} aria-hidden="true" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="home-questions__content">
                <p>{answer}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>
      <section className="home-page__cta" aria-label="Explore your spending">
        <h2>Start with a clearer picture of your money.</h2>
        <Button asChild variant="surface" className="btn">
          <Link to="/spending-insights">
            Explore spending insights <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </div>
  )
}
