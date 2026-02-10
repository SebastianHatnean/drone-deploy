
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
  export function getDroneDescription() {
    return 'Advanced electric propulsion system with whisper-quiet rotors. Designed for urban air mobility and rapid executive transport.'
  }

  /**
   * City-specific locations for mock flight routes.
   * Drone ID prefix (LON, AUH, PAR) determines which set is used.
   */
  const MOCK_LOCATIONS_BY_CITY = {
    LON: [
      'Paddington Hub', 'Kings Cross', 'Waterloo Station', 'Liverpool Street',
      'Canary Wharf', 'Heathrow Terminal', 'Shoreditch', 'Camden Market',
      'Westminster', 'Victoria Station', 'Tower Bridge', 'Hyde Park',
      'Regent\'s Park', 'Southwark', 'Euston', 'Bermondsey', 'Hoxton',
      'Angel', 'Whitechapel', 'Vauxhall'
    ],
    AUH: [
      'Sheikh Zayed Grand Mosque', 'Corniche', 'Marina Mall', 'Yas Island',
      'Saadiyat Island', 'Al Reem Island', 'Khalifa City', 'Al Maryah Island',
      'Abu Dhabi Airport', 'Al Zahiyah', 'Al Qurm', 'Al Mushrif',
      'Al Danah', 'Al Nahyan', 'Al Rawdah', 'Al Kheeran', 'Hudayriat Island',
      'Al Reem', 'Zayed Port', 'Al Bateen'
    ],
    PAR: [
      'Eiffel Tower', 'Champs-Élysées', 'Notre-Dame', 'Louvre Museum',
      'Gare du Nord', 'Gare de Lyon', 'Montmartre', 'Le Marais',
      'Saint-Germain', 'Bastille', 'La Défense', 'Place de la Concorde',
      'Arc de Triomphe', 'Montparnasse', 'Belleville', 'Pigalle',
      'Opéra Garnier', 'Île de la Cité', 'Panthéon', 'Marais'
    ]
  }

  /**
   * Get city locations from drone ID prefix (e.g. LON-DR-001 → LON)
   * Falls back to London if unknown prefix.
   */
  function getLocationsForDrone(droneId) {
    const prefix = (droneId || '').split('-')[0]?.toUpperCase()
    return MOCK_LOCATIONS_BY_CITY[prefix] ?? MOCK_LOCATIONS_BY_CITY.LON
  }

  /**
   * Generate deterministic mock flight history for a drone (no backend)
   * Uses city-specific locations based on drone ID prefix (LON, AUH, PAR).
   * @param {string} droneId - Drone ID to seed the mock data (e.g. AUH-DR-001)
   * @returns {Array<{time: string, from: string, to: string, duration: string, status: 'Completed'|'Cancelled'}>}
   */
  export function generateMockHistory(droneId) {
    const locations = getLocationsForDrone(droneId)

    const hash = (str) => {
      let h = 0
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i)
        h |= 0
      }
      return Math.abs(h)
    }
    const seed = hash(droneId)

    const statuses = ['Completed', 'Completed', 'Completed', 'Cancelled']
    const durations = ['12 min', '18 min', '8 min', '22 min', '15 min', '6 min']
    const timeOffsets = [
      { label: '2 hours ago', mins: 120 },
      { label: '5 hours ago', mins: 300 },
      { label: 'Yesterday', mins: 1440 },
      { label: '2 days ago', mins: 2880 },
      { label: '3 days ago', mins: 4320 }
    ]

    const count = 3 + (seed % 3) // 3–5 flights
    const history = []

    for (let i = 0; i < count; i++) {
      const s = seed + i
      const fromIdx = (s * 17) % locations.length
      let toIdx = (s * 31) % locations.length
      if (toIdx === fromIdx) toIdx = (toIdx + 1) % locations.length

      history.push({
        time: timeOffsets[i % timeOffsets.length].label,
        from: locations[fromIdx],
        to: locations[toIdx],
        duration: durations[(s + i) % durations.length],
        status: statuses[(s + i) % statuses.length]
      })
    }

    return history
  }
  