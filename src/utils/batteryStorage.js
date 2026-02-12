const STORAGE_KEY = 'drone-deploy-battery-levels'

/**
 * Load battery levels for all drones from localStorage
 * @returns {Record<string, number>} Map of droneId -> battery percentage
 */
export function loadBatteryLevels() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * Save battery level for a drone to localStorage
 * @param {string} droneId - Drone ID (e.g. LON-DR-001)
 * @param {number} battery - Battery percentage (0-100)
 */
export function saveBatteryLevel(droneId, battery) {
  const levels = loadBatteryLevels()
  levels[droneId] = Math.max(0, Math.min(100, battery))
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels))
  } catch {
    // Ignore quota exceeded or other storage errors
  }
}
