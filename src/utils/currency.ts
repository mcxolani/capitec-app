// Whole rands with thousands separators, matching the spec's messages ("R5,000")
export function formatRand(amount: number): string {
  return `R${Math.round(amount).toLocaleString('en-US')}`
}
