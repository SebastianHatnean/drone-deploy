const BATTERY_STORAGE_KEY = 'drone-deploy-driver-battery'

/**
 * Get current battery level for the driver's drone
 * @returns {number} Battery percentage (0-100)
 */
export function getDriverBattery() {
  try {
    const stored = localStorage.getItem(BATTERY_STORAGE_KEY)
    if (stored) {
      const battery = parseInt(stored, 10)
      if (!isNaN(battery) && battery >= 0 && battery <= 100) {
        return battery
      }
    }
  } catch (err) {
    console.warn('Failed to read battery from localStorage:', err)
  }
  return 100 // Default to full battery
}

/**
 * Set battery level for the driver's drone
 * @param {number} level - Battery percentage (0-100)
 */
export function setDriverBattery(level) {
  try {
    const clamped = Math.max(0, Math.min(100, Math.round(level)))
    localStorage.setItem(BATTERY_STORAGE_KEY, clamped.toString())
    // Dispatch storage event for cross-tab updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: BATTERY_STORAGE_KEY,
      newValue: clamped.toString(),
      storageArea: localStorage
    }))
  } catch (err) {
    console.warn('Failed to save battery to localStorage:', err)
  }
}

/**
 * Calculate battery drain based on ride distance
 * @param {Object} origin - Origin coordinates {lat, lng}
 * @param {Object} destination - Destination coordinates {lat, lng}
 * @returns {number} Battery percentage to drain
 */
export function calculateBatteryDrain(origin, destination) {
  const dLat = destination.lat - origin.lat
  const dLng = destination.lng - origin.lng
  const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111 // Rough km
  
  // Drain ~2-5% per km, minimum 5%, maximum 20%
  const drain = Math.max(5, Math.min(20, Math.round(distance * 3)))
  return drain
}

/**
 * Drain battery after completing a ride
 * @param {Object} origin - Origin coordinates
 * @param {Object} destination - Destination coordinates
 * @returns {number} New battery level
 */
export function drainBatteryAfterRide(origin, destination) {
  const currentBattery = getDriverBattery()
  const drain = calculateBatteryDrain(origin, destination)
  const newBattery = Math.max(0, currentBattery - drain)
  setDriverBattery(newBattery)
  return newBattery
}
