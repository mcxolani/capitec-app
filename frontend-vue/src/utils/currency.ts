const randFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
})

export function formatCurrency(amount: number) {
  return randFormatter.format(amount)
}
