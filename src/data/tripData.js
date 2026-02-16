/**
 * City-specific location names for mock trip routes.
 * Drone ID prefix (LON, AUH, PAR) determines which set is used.
 */
const MOCK_LOCATIONS_BY_CITY = {
  LON: [
    'Paddington Hub', 'Kings Cross', 'Waterloo Station', 'Liverpool Street',
    'Canary Wharf', 'Heathrow Terminal', 'Shoreditch', 'Camden Market',
    'Westminster', 'Victoria Station', 'Tower Bridge', 'Hyde Park',
    "Regent's Park", 'Southwark', 'Euston', 'Bermondsey', 'Hoxton',
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

function getLocationsForDrone(droneId) {
  const prefix = (droneId || '').split('-')[0]?.toUpperCase()
  return MOCK_LOCATIONS_BY_CITY[prefix] ?? MOCK_LOCATIONS_BY_CITY.LON
}

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

/**
 * Interpolate points between origin and destination with a slight arc.
 * @param {number} lat1 - Origin lat
 * @param {number} lng1 - Origin lng
 * @param {number} lat2 - Destination lat
 * @param {number} lng2 - Destination lng
 * @param {number} numPoints - Number of intermediate points
 * @returns {Array<[number, number]>} Array of [lng, lat] for GeoJSON
 */
function interpolateRoute(lat1, lng1, lat2, lng2, numPoints = 15) {
  const coords = []
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    // Slight arc: add perpendicular offset at midpoint for realism
    const arcFactor = Math.sin(t * Math.PI) * 0.002
    const lat = lat1 + (lat2 - lat1) * t + arcFactor
    const lng = lng1 + (lng2 - lng1) * t
    coords.push([lng, lat])
  }
  return coords
}

/**
 * Enrich delivering drones with trip data (origin, destination, route).
 * Uses deterministic logic based on drone ID so the same drone always gets the same trip.
 * @param {Array} drones - Array of drone objects
 * @returns {Array} Drones with trip data added for delivering drones
 */
/**
 * Compute bounding box for all drones and their routes.
 * @param {Array} drones - Enriched drones (with tripRoute for delivering)
 * @returns {[[number, number], [number, number]]} [[swLng, swLat], [neLng, neLat]] or null if empty
 */
export function getFleetBounds(drones) {
  if (!drones?.length) return null

  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity

  for (const drone of drones) {
    const coords = [drone.coordinates]
    if (drone.tripRoute?.length) {
      for (const [lng, lat] of drone.tripRoute) {
        coords.push({ lng, lat })
      }
    }
    for (const c of coords) {
      const lng = typeof c === 'object' && 'lng' in c ? c.lng : c[0]
      const lat = typeof c === 'object' && 'lat' in c ? c.lat : c[1]
      minLng = Math.min(minLng, lng)
      minLat = Math.min(minLat, lat)
      maxLng = Math.max(maxLng, lng)
      maxLat = Math.max(maxLat, lat)
    }
  }

  if (minLng === Infinity) return null

  // Add small buffer for single-point or tight clusters
  const pad = 0.005
  const lngSpan = Math.max(maxLng - minLng, pad)
  const latSpan = Math.max(maxLat - minLat, pad)
  const lngMid = (minLng + maxLng) / 2
  const latMid = (minLat + maxLat) / 2

  return [
    [lngMid - lngSpan / 2, latMid - latSpan / 2],
    [lngMid + lngSpan / 2, latMid + latSpan / 2]
  ]
}

export function enrichDeliveringDrones(drones) {
  return drones.map((drone) => {
    if (drone.status !== 'delivering') return drone

    // Use custom trip if provided
    if (drone.tripOrigin && drone.tripDestination) {
      const origin = drone.tripOrigin
      const dest = drone.tripDestination
      const tripRoute = interpolateRoute(origin.lat, origin.lng, dest.lat, dest.lng)
      return {
        ...drone,
        tripOrigin: { lat: origin.lat, lng: origin.lng, name: origin.name },
        tripDestination: { lat: dest.lat, lng: dest.lng, name: dest.name },
        tripRoute
      }
    }

    const locations = getLocationsForDrone(drone.id)
    const seed = hash(drone.id)

    const fromIdx = (seed * 17) % locations.length
    let toIdx = (seed * 31) % locations.length
    if (toIdx === fromIdx) toIdx = (toIdx + 1) % locations.length

    const originLat = drone.coordinates.lat
    const originLng = drone.coordinates.lng
    const offsetLat = 0.008 + (seed % 5) * 0.004
    const offsetLng = 0.01 + (seed % 7) * 0.003
    const destLat = originLat + offsetLat
    const destLng = originLng + offsetLng

    const tripRoute = interpolateRoute(originLat, originLng, destLat, destLng)

    return {
      ...drone,
      tripOrigin: { lat: originLat, lng: originLng, name: locations[fromIdx] },
      tripDestination: { lat: destLat, lng: destLng, name: locations[toIdx] },
      tripRoute
    }
  })
}
