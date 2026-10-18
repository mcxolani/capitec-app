export type Position = {
  lat: number
  lng: number
}

export type Location = {
  label: string
  position: Position
}

export type Branch = {
  id: string
  name: string
  address: string
  position: Position
  phone: string
  hours: string
}

export type BranchSearchResult = Branch & {
  distanceKm: number | null
}
