import { Button, Callout, Spinner } from '@radix-ui/themes'
import { useEffect, useRef, useState } from 'react'
import { checkEligibility, fetchValidationRules } from '@/api/loanApi'
import LoanForm from '@/components/loan-eligibility/LoanForm'
import LoanResult from '@/components/loan-eligibility/LoanResult'
import type { EligibilityRequest, EligibilityResponse, ValidationRules } from '@/types/loan'
import '@/components/loan-eligibility/loan-eligibility.css'

export default function LoanEligibilityPage() {
  const [rules, setRules] = useState<ValidationRules | null>(null)
  const [rulesError, setRulesError] = useState(false)
  const [rulesAttempt, setRulesAttempt] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<{ result: EligibilityResponse; loanTerm: number } | null>(
    null,
  )
  const resultHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    let cancelled = false
    fetchValidationRules()
      .then((data) => {
        if (!cancelled) setRules(data)
      })
      .catch(() => {
        if (!cancelled) setRulesError(true)
      })
    return () => {
      cancelled = true
    }
  }, [rulesAttempt])

  const retryRules = () => {
    setRulesError(false)
    setRulesAttempt((n) => n + 1)
  }

  // announce and scroll to each new result
  useEffect(() => {
    if (outcome) resultHeadingRef.current?.focus()
  }, [outcome])

  const handleSubmit = async (request: EligibilityRequest) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const result = await checkEligibility(request)
      setOutcome({ result, loanTerm: request.loanDetails.loanTerm })
    } catch {
      setSubmitError('We couldn’t check your eligibility. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="loan-page">
      <h1>Loan Eligibility Simulator</h1>
      <p className="loan-page__intro">
        Tell us about your income, expenses and the loan you want, and we’ll estimate what you could
        qualify for.
      </p>

      {rulesError ? (
        <Callout.Root color="red" role="alert" className="loan-page__message">
          <Callout.Text>
            The simulator couldn’t load. Check your connection and try again.
          </Callout.Text>
          <Button size="3" variant="outline" type="button" className="btn" onClick={retryRules}>
            Try again
          </Button>
        </Callout.Root>
      ) : !rules ? (
        <p className="loan-page__message" role="status">
          <Spinner /> Loading…
        </p>
      ) : (
        <div className="loan-page__body">
          <div>
            <LoanForm rules={rules} submitting={submitting} onSubmit={handleSubmit} />
            {submitError && (
              <p role="alert" className="field-error">
                {submitError}
              </p>
            )}
          </div>

          {outcome ? (
            <LoanResult
              result={outcome.result}
              loanTerm={outcome.loanTerm}
              headingRef={resultHeadingRef}
            />
          ) : (
            <p className="loan-page__placeholder">
              Your estimate will appear here once you’ve filled in the form.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
