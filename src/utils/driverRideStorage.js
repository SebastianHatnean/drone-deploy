const STORAGE_KEY = 'drone-deploy-driver-completed-rides'

/**
 * @typedef {Object} CompletedRide
 * @property {string} id - Unique ride ID
 * @property {string} droneId - Drone ID (e.g. AUH-DR-011)
 * @property {string} droneName - Drone model/name
 * @property {string} origin - Origin location name
 * @property {string} destination - Destination location name
 * @property {number} passengers - Number of passengers
 * @property {string} completedAt - ISO timestamp when ride completed
 * @property {string} [eta] - Original ETA at ride start
 */

/**
 * Load completed rides from localStorage
 * @returns {CompletedRide[]} Array of completed rides, newest first
 */
export function getCompletedRides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  } catch {
    return []
  }
}

/**
 * Save a completed ride to localStorage
 * @param {Object} ride - Ride data
 * @param {string} ride.droneId
 * @param {string} ride.droneName
 * @param {string} ride.origin
 * @param {string} ride.destination
 * @param {number} ride.passengers
 * @param {string} [ride.eta]
 */
export function saveCompletedRide(ride) {
  const completed = {
    id: `ride-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    droneId: ride.droneId,
    droneName: ride.droneName,
    origin: ride.origin,
    destination: ride.destination,
    passengers: ride.passengers ?? 0,
    completedAt: new Date().toISOString(),
    eta: ride.eta
  }
  const rides = getCompletedRides()
  rides.unshift(completed)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rides))
  } catch {
    // Ignore quota exceeded or other storage errors
  }
  return completed
}

/**
 * Get completed rides for today only
 * @returns {CompletedRide[]}
 */
export function getTodayCompletedRides() {
  const today = new Date().toDateString()
  return getCompletedRides().filter(
    (r) => new Date(r.completedAt).toDateString() === today
  )
}
