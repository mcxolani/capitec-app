const randFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
})

const spendingRandFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 2,
})

export function formatCurrency(amount: number) {
  return randFormatter.format(amount)
}

export function formatSpendingCurrency(amount: number) {
  return spendingRandFormatter.format(amount)
}
