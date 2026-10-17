export function formatMoney(amount: number): string {
  return `R${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatPercentage(value: number | null): string {
  return value === null ? 'No previous spending' : `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function saDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(date)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Johannesburg',
  }).format(new Date(date))
}

export function formatMonth(month: string): string {
  return new Intl.DateTimeFormat('en-ZA', {
    month: 'short',
    year: '2-digit',
    timeZone: 'Africa/Johannesburg',
  }).format(new Date(`${month}-01T00:00:00Z`))
}
