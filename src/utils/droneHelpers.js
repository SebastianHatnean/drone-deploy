
/**
 * Get marker color based on drone battery level and status
 * Priority: Low battery > delivering > standby
 * @param {Object} drone - Drone object
 * @returns {string} Hex color code
 */
export function getMarkerColor(drone) {
    // Battery < 25% gets orange, regardless of status
    if (drone.battery < 25) {
      return '#FF9F3D'; // Orange
    }
    
    // Status 'delivering' gets blue
    if (drone.status === 'delivering') {
      return '#3DA9FF'; // Blue
    }
    
    // Status 'standby' gets green
    return '#10B981'; // Green
  }
  
  /**
   * Get status display information for drone card
   * @param {Object} drone - Drone object
   * @returns {Object} Object with text and color properties
   */
  export function getStatusDisplay(drone) {
    if (drone.battery < 25) {
      return { text: 'LOW BATTERY', color: '#FF9F3D' }
    }
    if (drone.status === 'delivering') {
      return { text: 'DELIVERING', color: '#3DA9FF' }
    }
    return { text: 'STANDBY', color: '#10B981' }
  }
  
  /**
   * Get drone passenger capacity based on model name
   * @param {string} droneName - Drone model name
   * @returns {string} Capacity string (e.g., "4 Pax")
   */
  export function getDroneCapacity(droneName) {
    return droneName.includes('X2') ? '6 Pax' : '4 Pax'
  }
  
  /**
   * Get drone description based on model name
   * @param {string} droneName - Drone model name
   * @returns {string} Description text
   */
  export function getDroneDescription(droneName) {
    return 'Advanced electric propulsion system with whisper-quiet rotors. Designed for urban air mobility and rapid executive transport.'
  }
  