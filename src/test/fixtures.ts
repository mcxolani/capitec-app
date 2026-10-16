import type { BranchWithDistance } from '@/types/branch'

export const sandton: BranchWithDistance = {
  id: 'sandton-city',
  name: 'Sandton City',
  address: 'Sandton City, Rivonia Rd, Sandhurst',
  position: { lat: -26.1076, lng: 28.0567 },
  phone: '011 555 0101',
  hours: 'Mon–Fri 08:30–16:30',
  distanceKm: 0.4,
}

export const rosebank: BranchWithDistance = {
  id: 'rosebank',
  name: 'Rosebank',
  address: 'The Zone, Oxford Rd, Rosebank',
  position: { lat: -26.1457, lng: 28.0436 },
  hours: 'Mon–Fri 08:30–16:30',
  distanceKm: 4.27,
}
