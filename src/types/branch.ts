export interface LatLng {
  lat: number
  lng: number
}

export interface Origin {
  position: LatLng
  label: string
}

export interface Branch {
  id: string
  name: string
  address: string
  position: LatLng
  phone?: string
  hours: string
}

export interface BranchWithDistance extends Branch {
  distanceKm: number
}
