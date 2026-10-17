import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const field = (name: string | RegExp) => screen.getByLabelText(name)

// Types the API spec's example request into the loan form
export async function fillSpecExample() {
  await userEvent.type(field('Age'), '35')
  await userEvent.selectOptions(field('Employment status'), 'Employed')
  await userEvent.type(field('Months in current employment'), '24')
  await userEvent.type(field('Monthly income (R)'), '25 000')
  await userEvent.type(field('Monthly expenses (R)'), '15000')
  await userEvent.type(field(/existing debt/i), '5000')
  await userEvent.type(field(/credit score/i), '650')
  await userEvent.type(field('Loan amount (R)'), 'R150,000')
  await userEvent.type(field('Term (months)'), '24')
  await userEvent.selectOptions(field('Purpose'), 'Home improvement')
}
