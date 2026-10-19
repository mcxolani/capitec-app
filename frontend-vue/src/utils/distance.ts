import type { Position } from '@/types/branch'

const earthRadiusKm = 6371

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

export function distanceInKm(from: Position, to: Position) {
  const latitudeDifference = toRadians(to.lat - from.lat)
  const longitudeDifference = toRadians(to.lng - from.lng)
  const fromLatitude = toRadians(from.lat)
  const toLatitude = toRadians(to.lat)
  const distance =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDifference / 2) ** 2

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(distance))
}
