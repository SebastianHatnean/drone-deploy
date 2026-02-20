import { useState, useEffect, useRef } from 'react'

const TICK_MS = 500 // Update every 500ms for smooth animation

/**
 * Calculate distance between two points in kilometers
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} Distance in kilometers
 */
function calculateDistance(point1, point2) {
  const dLat = point2.lat - point1.lat
  const dLng = point2.lng - point1.lng
  // Rough approximation: 1 degree ≈ 111 km
  return Math.sqrt(dLat * dLat + dLng * dLng) * 111
}

/**
 * Calculate progress increment based on distance (1km = 1 second)
 * @param {Object} origin - {lat, lng}
 * @param {Object} destination - {lat, lng}
 * @returns {number} Progress increment per tick
 */
function calculateProgressIncrementFromDistance(origin, destination) {
  const distance = calculateDistance(origin, destination)
  const durationSeconds = Math.max(3, distance) // Minimum 3 seconds
  const ticksNeeded = (durationSeconds * 1000) / TICK_MS
  return 1 / ticksNeeded
}

/**
 * Seeded random for deterministic but varied values per drone
 * @param {number} seed
 * @returns {number} 0-1
 */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * Calculate progress increment for random duration (20-30 seconds) per drone.
 * Uses drone id as seed so each drone gets a different duration.
 * @param {string} droneId - Drone ID for deterministic variation
 * @returns {number} Progress increment per tick
 */
function calculateProgressIncrementRandom(droneId) {
  const seed = (droneId || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const durationSeconds = 20 + seededRandom(seed) * 20 // 20-40 seconds, different per drone
  const ticksNeeded = (durationSeconds * 1000) / TICK_MS
  return 1 / ticksNeeded
}

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
 * @param {Object} [options] - Optional config
 * @param {(drone: Object) => void} [options.onRideComplete] - Called when a drone's progress reaches 100%
 * @param {'distance'|'random'} [options.durationMode='distance'] - 'distance' = 1km=1s, 'random' = 20-30s per ride
 * @returns {{ progressMap: Record<string, number>, getDronePosition: (drone) => { lat, lng }, getDroneBearing: (drone) => number }}
 */
export function useTripProgress(deliveringDrones, options = {}) {
  const { onRideComplete, durationMode = 'distance' } = options
  const [progressMap, setProgressMap] = useState({})
  const onRideCompleteRef = useRef(onRideComplete)
  const completedDronesRef = useRef(new Set()) // Track which drones have had completion callback invoked
  const progressIncrementsRef = useRef({}) // Store progress increment for each drone
  onRideCompleteRef.current = onRideComplete

  useEffect(() => {
    const ids = deliveringDrones.map((d) => d.id)
    setProgressMap((prev) => {
      const next = { ...prev }
      ids.forEach((id) => {
        // Always reset when a drone appears in deliveringDrones - same drone can have multiple rides
        next[id] = 0
        completedDronesRef.current.delete(id)
        
        const drone = deliveringDrones.find(d => d.id === id)
        if (durationMode === 'random') {
          progressIncrementsRef.current[id] = calculateProgressIncrementRandom(id)
        } else if (drone?.tripOrigin && drone?.tripDestination) {
          progressIncrementsRef.current[id] = calculateProgressIncrementFromDistance(
            drone.tripOrigin,
            drone.tripDestination
          )
        } else {
          progressIncrementsRef.current[id] = 0.05 // Fallback
        }
      })
      return next
    })
  }, [deliveringDrones.map((d) => d.id).join(','), durationMode])

  useEffect(() => {
    if (deliveringDrones.length === 0) return

    const interval = setInterval(() => {
      setProgressMap((prev) => {
        const next = { ...prev }
        const newlyCompleted = []
        
        deliveringDrones.forEach((drone) => {
          const current = next[drone.id] ?? 0
          
          // If already completed (callback already invoked), keep at 100%
          if (completedDronesRef.current.has(drone.id)) {
            next[drone.id] = 1
            return
          }
          
          // If already at 100% but not yet marked as completed, mark it now
          if (current >= 1) {
            next[drone.id] = 1
            completedDronesRef.current.add(drone.id)
            newlyCompleted.push(drone)
            return
          }
          
          // Get the progress increment for this specific drone
          const increment = progressIncrementsRef.current[drone.id] ?? 0.05
          const nextVal = current + increment
          
          if (nextVal >= 1) {
            next[drone.id] = 1
            completedDronesRef.current.add(drone.id)
            newlyCompleted.push(drone)
          } else {
            next[drone.id] = nextVal
          }
        })
        
        // Call completion callbacks synchronously after state update
        if (newlyCompleted.length > 0) {
          newlyCompleted.forEach((drone) => {
            onRideCompleteRef.current?.(drone)
          })
        }
        
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
