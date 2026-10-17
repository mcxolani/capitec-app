import type { PaymentScheduleEntry } from '@/types/loan'

export const roundCents = (amount: number) => Math.round(amount * 100) / 100

// Standard amortised loan payment: equal monthly instalments, interest charged
// monthly on the outstanding balance at annualRate / 12.
export function monthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  const r = annualRate / 100 / 12
  if (r === 0) return roundCents(principal / termMonths)
  return roundCents((principal * r) / (1 - (1 + r) ** -termMonths))
}

// Month-by-month breakdown. The last payment absorbs the rounding so the
// balance ends at exactly zero.
export function paymentSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
): PaymentScheduleEntry[] {
  const r = annualRate / 100 / 12
  const payment = monthlyPayment(principal, annualRate, termMonths)
  const schedule: PaymentScheduleEntry[] = []
  let balance = principal

  for (let month = 1; month <= termMonths; month++) {
    const interest = roundCents(balance * r)
    const principalPaid = month === termMonths ? balance : roundCents(payment - interest)
    balance = roundCents(balance - principalPaid)
    schedule.push({
      month,
      payment: roundCents(principalPaid + interest),
      principal: principalPaid,
      interest,
      balance,
    })
  }

  return schedule
}

export function repaymentTotals(principal: number, annualRate: number, termMonths: number) {
  const schedule = paymentSchedule(principal, annualRate, termMonths)
  const totalRepayment = roundCents(schedule.reduce((sum, m) => sum + m.payment, 0))
  return {
    monthlyPayment: monthlyPayment(principal, annualRate, termMonths),
    totalRepayment,
    totalInterest: roundCents(totalRepayment - principal),
    schedule,
  }
}
