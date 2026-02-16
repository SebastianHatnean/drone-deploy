import { useState, useEffect } from 'react'

const PROGRESS_INCREMENT = 0.05
const TICK_MS = 2500

/**
 * Interpolate position along a route based on progress (0-1).
 * @param {Array<[number, number]>} route - Array of [lng, lat]
 * @param {number} progress - 0 to 1
 * @returns {{ lat: number, lng: number }}
 */
function interpolatePosition(route, progress) {
  if (!route || route.length === 0) return { lat: 0, lng: 0 }
  if (progress <= 0) {
    const [lng, lat] = route[0]
    return { lat, lng }
  }
  if (progress >= 1) {
    const [lng, lat] = route[route.length - 1]
    return { lat, lng }
  }

  const idx = progress * (route.length - 1)
  const i = Math.floor(idx)
  const frac = idx - i
  const [lng1, lat1] = route[i]
  const [lng2, lat2] = route[Math.min(i + 1, route.length - 1)]

  return {
    lat: lat1 + (lat2 - lat1) * frac,
    lng: lng1 + (lng2 - lng1) * frac
  }
}

/**
 * Hook to animate trip progress for delivering drones.
 * @param {Array} deliveringDrones - Drones with tripOrigin, tripDestination, tripRoute
 * @returns {{ progressMap: Record<string, number>, getDronePosition: (drone) => { lat, lng }, getDroneBearing: (drone) => number }}
 */
export function useTripProgress(deliveringDrones) {
  const [progressMap, setProgressMap] = useState({})

  useEffect(() => {
    const ids = deliveringDrones.map((d) => d.id)
    setProgressMap((prev) => {
      const next = { ...prev }
      ids.forEach((id) => {
        if (next[id] == null) next[id] = 0
      })
      return next
    })
  }, [deliveringDrones.map((d) => d.id).join(',')])

  useEffect(() => {
    if (deliveringDrones.length === 0) return

    const interval = setInterval(() => {
      setProgressMap((prev) => {
        const next = { ...prev }
        deliveringDrones.forEach((drone) => {
          const current = next[drone.id] ?? 0
          let nextVal = current + PROGRESS_INCREMENT
          if (nextVal >= 1) nextVal = 0
          next[drone.id] = nextVal
        })
        return next
      })
    }, TICK_MS)

    return () => clearInterval(interval)
  }, [deliveringDrones])

  const getDronePosition = (drone) => {
    if (!drone.tripRoute) return drone.coordinates
    const progress = progressMap[drone.id] ?? 0
    return interpolatePosition(drone.tripRoute, progress)
  }

  /** Bearing in degrees (0 = north, 90 = east) for arrow rotation */
  const getDroneBearing = (drone) => {
    if (!drone.tripRoute || drone.tripRoute.length < 2) return 0
    const progress = progressMap[drone.id] ?? 0
    const pos = interpolatePosition(drone.tripRoute, progress)
    const idx = progress * (drone.tripRoute.length - 1)
    const i = Math.min(Math.floor(idx) + 1, drone.tripRoute.length - 1)
    const [lng2, lat2] = drone.tripRoute[i]
    const dLng = lng2 - pos.lng
    const dLat = lat2 - pos.lat
    if (Math.abs(dLng) < 1e-9 && Math.abs(dLat) < 1e-9) return 0
    return (Math.atan2(dLng, dLat) * 180) / Math.PI
  }

  return { progressMap, getDronePosition, getDroneBearing }
}
