import { describe, expect, it } from 'vitest'
import { monthlyPayment, paymentSchedule, repaymentTotals, roundCents } from './loanCalculations'

// R150,000 at 12.5% over 24 months, the example in the API spec. The spec shows
// R7,089.50; the standard formula gives R7,096.10 (checked independently).
const AMOUNT = 150000
const RATE = 12.5
const TERM = 24

describe('roundCents', () => {
  it.each([
    [1.004, 1.0],
    [1.006, 1.01],
    [7096.096235, 7096.1],
  ])('rounds %s to %s', (input, expected) => {
    expect(roundCents(input)).toBe(expected)
  })
})

describe('monthlyPayment', () => {
  it('matches the standard amortisation formula', () => {
    expect(monthlyPayment(AMOUNT, RATE, TERM)).toBe(7096.1)
  })

  it('splits the principal evenly when there is no interest', () => {
    expect(monthlyPayment(12000, 0, 12)).toBe(1000)
  })

  it('costs more per month over a shorter term', () => {
    expect(monthlyPayment(AMOUNT, RATE, 12)).toBeGreaterThan(monthlyPayment(AMOUNT, RATE, TERM))
  })
})

describe('paymentSchedule', () => {
  const schedule = paymentSchedule(AMOUNT, RATE, TERM)

  it('has one entry per month', () => {
    expect(schedule).toHaveLength(TERM)
    expect(schedule.map((m) => m.month)).toEqual(Array.from({ length: TERM }, (_, i) => i + 1))
  })

  it('charges a month of interest on the opening balance first', () => {
    expect(schedule[0]).toEqual({
      month: 1,
      payment: 7096.1,
      interest: 1562.5,
      principal: 5533.6,
      balance: 144466.4,
    })
  })

  it('pays off exactly the amount borrowed', () => {
    const principalPaid = roundCents(schedule.reduce((sum, m) => sum + m.principal, 0))
    expect(principalPaid).toBe(AMOUNT)
    expect(schedule.at(-1)?.balance).toBe(0)
  })

  it('keeps the final payment within a few cents of the others', () => {
    expect(Math.abs(schedule.at(-1)!.payment - 7096.1)).toBeLessThan(0.25)
  })

  it('shifts each payment from interest towards principal over time', () => {
    expect(schedule[1].interest).toBeLessThan(schedule[0].interest)
    expect(schedule[1].principal).toBeGreaterThan(schedule[0].principal)
  })
})

describe('repaymentTotals', () => {
  it('adds up the schedule', () => {
    const totals = repaymentTotals(AMOUNT, RATE, TERM)

    // 23 × R7,096.10 + a final R7,096.00, matching an exact decimal calculation
    expect(totals).toMatchObject({
      monthlyPayment: 7096.1,
      totalRepayment: 170306.3,
      totalInterest: 20306.3,
    })
    expect(totals.schedule).toHaveLength(TERM)
  })

  it('charges no interest at 0%', () => {
    expect(repaymentTotals(12000, 0, 12)).toMatchObject({ totalRepayment: 12000, totalInterest: 0 })
  })
})
