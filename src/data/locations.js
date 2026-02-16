/**
 * Calculate drone range based on battery level
 * @param {number} battery - Battery percentage (0-100)
 * @returns {number} Range in kilometers
 */
function calculateRange(battery) {
  if (battery < 25) return Math.floor(Math.random() * 6) + 5
  if (battery < 50) return Math.floor(Math.random() * 11) + 10
  return Math.floor(Math.random() * 21) + 20
}

/** Drone models for image mapping – each maps to an asset */
export const DRONE_MODELS = [
  'Dragonfly',
  'Peregrine',
  'Sirocco Pax',
  'Zephyr T-Line',
  'Mistral 400',
  'Sky-Shuttle',
  'VertiBus'
]

/**
 * Create drones for a city with coordinates offset from center.
 * Each drone in a city gets a unique name (model + optional suffix like -1, -2 for taxis).
 *
 * @param {string} cityId - City prefix for drone IDs (e.g. 'LON', 'AUH', 'PAR')
 * @param {number} centerLat - City center latitude
 * @param {number} centerLng - City center longitude
 * @param {Array} droneConfigs - Array of { id, status, battery, model, suffix?, offsetLat, offsetLng, eta?, load? }
 * @returns {Array} Drone objects with unique names per city
 */
function createCityDrones(cityId, centerLat, centerLng, droneConfigs) {
  return droneConfigs.map((config) => {
    const name = config.suffix != null ? `${config.model}-${config.suffix}` : config.model
    const drone = {
      id: `${cityId}-${config.id}`,
      status: config.status,
      battery: config.battery,
      name,
      model: config.model,
      range: calculateRange(config.battery),
      load: config.load ?? 0,
      eta: config.eta,
      coordinates: {
        lat: centerLat + config.offsetLat,
        lng: centerLng + config.offsetLng
      }
    }
    if (config.tripOrigin) drone.tripOrigin = config.tripOrigin
    if (config.tripDestination) drone.tripDestination = config.tripDestination
    return drone
  })
}

/** Drone configs – model + optional suffix for unique names per city. Offsets in degrees. */
const LONDON_DRONES = [
  { id: 'DR-001', status: 'standby', battery: 92, model: 'Dragonfly', suffix: 1, offsetLat: 0.0006, offsetLng: -0.0011 },
  { id: 'DR-002', status: 'standby', battery: 92, model: 'Dragonfly', suffix: 2, offsetLat: 0.0011, offsetLng: -0.0006 },
  { id: 'DR-003', status: 'standby', battery: 92, model: 'Dragonfly', suffix: 3, offsetLat: 0.0006, offsetLng: -0.0111 },
  { id: 'DR-004', status: 'standby', battery: 92, model: 'Peregrine', offsetLat: 0, offsetLng: -0.0004 },
  { id: 'DR-005', status: 'standby', battery: 88, model: 'Sirocco Pax', offsetLat: 0.0081, offsetLng: 0.0354 },
  { id: 'DR-006', status: 'standby', battery: 75, model: 'Zephyr T-Line', offsetLat: -0.0029, offsetLng: 0.0411 },
  { id: 'DR-007', status: 'standby', battery: 95, model: 'Mistral 400', offsetLat: 0.0120, offsetLng: 0.0006 },
  { id: 'DR-008', status: 'standby', battery: 67, model: 'Sky-Shuttle', offsetLat: -0.0041, offsetLng: 0.0079 },
  { id: 'DR-009', status: 'standby', battery: 81, model: 'VertiBus', offsetLat: 0.0213, offsetLng: 0.0251 },
  { id: 'DR-010', status: 'standby', battery: 58, model: 'Peregrine', suffix: 1, offsetLat: -0.0099, offsetLng: -0.0081 },
  { id: 'DR-011', status: 'standby', battery: 90, model: 'Sirocco Pax', suffix: 1, offsetLat: 0.0151, offsetLng: -0.0285 },
  { id: 'DR-012', status: 'standby', battery: 73, model: 'Zephyr T-Line', suffix: 1, offsetLat: 0.0275, offsetLng: 0.0031 },
  { id: 'DR-013', status: 'standby', battery: 86, model: 'Mistral 400', suffix: 1, offsetLat: 0.0375, offsetLng: 0.0031  },
  { id: 'DR-014', status: 'standby', battery: 78, model: 'Sky-Shuttle', suffix: 1, offsetLat: -0.0181, offsetLng: -0.0165 },
  { id: 'DR-015', status: 'delivering', battery: 62, model: 'VertiBus', suffix: 1, eta: '8 mins', load: 2, offsetLat: 0.0071, offsetLng: 0.0269 },
  { id: 'DR-016', status: 'delivering', battery: 71, model: 'Dragonfly', suffix: 4, eta: '12 mins', load: 3, offsetLat: 0.0247, offsetLng: -0.0113 },
  { id: 'DR-017', status: 'delivering', battery: 55, model: 'Peregrine', suffix: 2, eta: '15 mins', load: 1, offsetLat: -0.0107, offsetLng: -0.0467 },
  { id: 'DR-018', status: 'delivering', battery: 68, model: 'Sirocco Pax', suffix: 2, eta: '6 mins', load: 4, offsetLat: 0.0017, offsetLng: 0.0521 },
  { id: 'DR-019', status: 'delivering', battery: 84, model: 'Zephyr T-Line', suffix: 2, eta: '10 mins', load: 2, offsetLat: 0.0356, offsetLng: 0.0218 },
  { id: 'DR-020', status: 'delivering', battery: 77, model: 'Mistral 400', suffix: 2, eta: '5 mins', load: 3, offsetLat: -0.0224, offsetLng: 0.0261 },
  { id: 'DR-021', status: 'standby', battery: 18, model: 'Sky-Shuttle', suffix: 2, offsetLat: -0.0063, offsetLng: -0.0143 },
  { id: 'DR-022', status: 'delivering', battery: 22, model: 'VertiBus', suffix: 2, eta: '3 mins', load: 1, offsetLat: 0.0195, offsetLng: 0.0461 },
  { id: 'DR-023', status: 'standby', battery: 15, model: 'Dragonfly', suffix: 5, offsetLat: -0.0092, offsetLng: -0.0277 },
  { id: 'DR-024', status: 'standby', battery: 20, model: 'Peregrine', suffix: 3, offsetLat: 0.0402, offsetLng: -0.0096 }
]

const ABU_DHABI_DRONES = [
  { id: 'DR-001', status: 'standby', battery: 94, model: 'Dragonfly', offsetLat: 0, offsetLng: 0 },
  { id: 'DR-002', status: 'standby', battery: 88, model: 'Peregrine', offsetLat: 0.008, offsetLng: 0.012 },
  { id: 'DR-003', status: 'standby', battery: 76, model: 'Sirocco Pax', offsetLat: -0.006, offsetLng: 0.008 },
  { id: 'DR-004', status: 'standby', battery: 91, model: 'Zephyr T-Line', offsetLat: 0.012, offsetLng: -0.005 },
  { id: 'DR-005', status: 'standby', battery: 82, model: 'Mistral 400', offsetLat: -0.004, offsetLng: -0.011 },
  { id: 'DR-006', status: 'standby', battery: 65, model: 'Sky-Shuttle', offsetLat: 0.015, offsetLng: 0.018 },
  { id: 'DR-007', status: 'delivering', battery: 58, model: 'VertiBus', eta: '10 mins', load: 2, offsetLat: -0.009, offsetLng: 0.022 },
  { id: 'DR-008', status: 'delivering', battery: 72, model: 'Dragonfly', suffix: 1, eta: '7 mins', load: 1, offsetLat: 0.018, offsetLng: -0.008 },
  { id: 'DR-009', status: 'standby', battery: 19, model: 'Peregrine', suffix: 1, offsetLat: -0.012, offsetLng: -0.015 },
  { id: 'DR-010', status: 'delivering', battery: 24, model: 'Sirocco Pax', suffix: 1, eta: '4 mins', load: 3, offsetLat: 0.006, offsetLng: -0.018 },
  {
    id: 'DR-011',
    status: 'delivering',
    battery: 100,
    model: 'Mistral 400',
    suffix: 1,
    eta: '6 mins',
    load: 2,
    offsetLat: 24.441938 - 24.4539,
    offsetLng: 54.6478849 - 54.3773,
    tripOrigin: { lat: 24.441938, lng: 54.6478849, name: 'Abu Dhabi Airport' },
    tripDestination: { lat: 24.429167, lng: 54.618333, name: 'Masdar City' }
  }
]

const PARIS_DRONES = [
  { id: 'DR-001', status: 'standby', battery: 90, model: 'Dragonfly', offsetLat: 0, offsetLng: 0 },
  { id: 'DR-002', status: 'standby', battery: 85, model: 'Peregrine', offsetLat: 0.006, offsetLng: 0.004 },
  { id: 'DR-003', status: 'standby', battery: 78, model: 'Sirocco Pax', offsetLat: -0.005, offsetLng: 0.009 },
  { id: 'DR-004', status: 'standby', battery: 92, model: 'Zephyr T-Line', offsetLat: 0.009, offsetLng: -0.003 },
  { id: 'DR-005', status: 'standby', battery: 70, model: 'Mistral 400', offsetLat: -0.008, offsetLng: -0.006 },
  { id: 'DR-006', status: 'standby', battery: 88, model: 'Sky-Shuttle', offsetLat: 0.011, offsetLng: 0.014 },
  { id: 'DR-007', status: 'delivering', battery: 64, model: 'VertiBus', eta: '9 mins', load: 2, offsetLat: -0.004, offsetLng: 0.018 },
  { id: 'DR-008', status: 'delivering', battery: 75, model: 'Dragonfly', suffix: 1, eta: '12 mins', load: 4, offsetLat: 0.013, offsetLng: -0.012 },
  { id: 'DR-009', status: 'standby', battery: 17, model: 'Peregrine', suffix: 1, offsetLat: -0.011, offsetLng: 0.005 },
  { id: 'DR-010', status: 'delivering', battery: 21, model: 'Sirocco Pax', suffix: 1, eta: '5 mins', load: 1, offsetLat: 0.007, offsetLng: -0.016 }
]

const LONDON = {
  id: 'london',
  name: 'London',
  center: { lng: -0.1276, lat: 51.5074 },
  zoom: 12,
  drones: createCityDrones('LON', 51.5074, -0.1276, LONDON_DRONES)
}

const ABU_DHABI = {
  id: 'abu-dhabi',
  name: 'Abu Dhabi',
  center: { lng: 54.3773, lat: 24.4539 },
  zoom: 12,
  drones: createCityDrones('AUH', 24.4539, 54.3773, ABU_DHABI_DRONES)
}

const PARIS = {
  id: 'paris',
  name: 'Paris',
  center: { lng: 2.3522, lat: 48.8566 },
  zoom: 12,
  drones: createCityDrones('PAR', 48.8566, 2.3522, PARIS_DRONES)
}

export const cities = [LONDON, ABU_DHABI, PARIS]

export function getCityById(id) {
  return cities.find(c => c.id === id) ?? cities[0]
}
