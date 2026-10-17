import { Car, Film, ShoppingBag, ShoppingCart, Utensils, Zap, type LucideIcon } from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  'shopping-cart': ShoppingCart,
  film: Film,
  car: Car,
  utensils: Utensils,
  'shopping-bag': ShoppingBag,
  zap: Zap,
}

export default function CategoryIcon({ icon }: { icon: string }) {
  const Icon = icons[icon]
  return <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
}
