import { Card } from '@radix-ui/themes'
import type { Ref } from 'react'
import type { AffordabilityScore, EligibilityResponse, RiskCategory } from '@/types/loan'
import { formatRand } from '@/utils/currency'

interface Props {
  result: EligibilityResponse
  loanTerm: number
  // the page focuses the heading when a result arrives
  headingRef?: Ref<HTMLHeadingElement>
}

const RISK_LABELS: Record<RiskCategory, string> = { low: 'Low', medium: 'Medium', high: 'High' }

const AFFORDABILITY_LABELS: Record<AffordabilityScore, string> = {
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

export default function LoanResult({ result, loanTerm, headingRef }: Props) {
  const { eligibilityResult, recommendedLoan, affordabilityAnalysis } = result
  const { isEligible } = eligibilityResult
  const { recommendedAmount } = recommendedLoan

  const outcome = isEligible ? 'eligible' : recommendedAmount > 0 ? 'partial' : 'declined'
  const headline = {
    eligible: `You're likely eligible for ${formatRand(recommendedAmount)}`,
    partial: `You could qualify for up to ${formatRand(recommendedAmount)}`,
    declined: "You're not eligible for a loan right now",
  }[outcome]

  return (
    <section
      className={`loan-result loan-result--${outcome}`}
      aria-labelledby="loan-result-heading"
    >
      <div className="loan-result__summary">
        <h2 id="loan-result-heading" ref={headingRef} tabIndex={-1}>
          {headline}
        </h2>
        <p>{eligibilityResult.decisionReason}</p>
      </div>

      {recommendedAmount > 0 && (
        <Card className="loan-result__panel">
          <h3>{isEligible ? 'Your loan' : 'Suggested loan'}</h3>
          <dl className="loan-result__figures">
            <div>
              <dt>Amount</dt>
              <dd>{formatRand(recommendedAmount)}</dd>
            </div>
            <div>
              <dt>Monthly repayment</dt>
              <dd>{formatRand(recommendedLoan.monthlyPayment)}</dd>
            </div>
            <div>
              <dt>Interest rate</dt>
              <dd>{recommendedLoan.interestRate}% a year</dd>
            </div>
            <div>
              <dt>Term</dt>
              <dd>{loanTerm} months</dd>
            </div>
            <div>
              <dt>Total repayment</dt>
              <dd>{formatRand(recommendedLoan.totalRepayment)}</dd>
            </div>
            <div>
              <dt>Most you could borrow</dt>
              <dd>{formatRand(recommendedLoan.maxAmount)}</dd>
            </div>
          </dl>
        </Card>
      )}

      <Card className="loan-result__panel">
        <h3>Affordability</h3>
        <dl className="loan-result__figures">
          <div>
            <dt>Disposable income</dt>
            <dd>{formatRand(affordabilityAnalysis.disposableIncome)} a month</dd>
          </div>
          <div>
            <dt>Debt-to-income</dt>
            <dd>{affordabilityAnalysis.debtToIncomeRatio}%</dd>
          </div>
          <div>
            <dt>Loan-to-income</dt>
            <dd>{affordabilityAnalysis.loanToIncomeRatio}% of annual income</dd>
          </div>
          <div>
            <dt>Affordability rating</dt>
            <dd>{AFFORDABILITY_LABELS[affordabilityAnalysis.affordabilityScore]}</dd>
          </div>
          <div>
            <dt>Risk category</dt>
            <dd>{RISK_LABELS[eligibilityResult.riskCategory]}</dd>
          </div>
          <div>
            <dt>Estimated approval likelihood</dt>
            <dd>{eligibilityResult.approvalLikelihood}%</dd>
          </div>
        </dl>
      </Card>

      <p className="loan-result__disclaimer">
        This is an estimate based on simulated data, not a credit decision or a loan offer. A real
        application includes a full credit check and affordability assessment.
      </p>
    </section>
  )
}
