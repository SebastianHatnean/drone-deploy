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

/**
 * Create drones for a city with coordinates offset from center
 * @param {string} cityId - City prefix for drone IDs (e.g. 'LON', 'AUH', 'PAR')
 * @param {number} centerLat - City center latitude
 * @param {number} centerLng - City center longitude
 * @param {Array} offsets - Array of { lat, lng } offsets from center (roughly 0.001–0.02 degrees)
 * @returns {Array} Drone objects
 */
function createCityDrones(cityId, centerLat, centerLng, droneConfigs) {
  return droneConfigs.map((config, i) => ({
    id: `${cityId}-${config.id}`,
    status: config.status,
    battery: config.battery,
    name: config.name,
    range: calculateRange(config.battery),
    load: config.load ?? 0,
    eta: config.eta,
    coordinates: {
      lat: centerLat + config.offsetLat,
      lng: centerLng + config.offsetLng
    }
  }))
}

/** Drone configs – offsets are in degrees (≈0.01 ≈ 1km) */
const LONDON_DRONES = [
  { id: 'DR-001-taxi-1', status: 'standby', battery: 92, name: 'Skyrunner X1 Taxi 1', offsetLat: 0.0006, offsetLng: -0.0011 },
  { id: 'DR-001-taxi-2', status: 'standby', battery: 92, name: 'Skyrunner X1 Taxi 2', offsetLat: 0.0011, offsetLng: -0.0006 },
  { id: 'DR-001-taxi-3', status: 'standby', battery: 92, name: 'Skyrunner X1 Taxi 3', offsetLat: 0.0006, offsetLng: -0.0111 },
  { id: 'DR-001', status: 'standby', battery: 92, name: 'Skyrunner X1', offsetLat: 0, offsetLng: -0.0004 },
  { id: 'DR-002', status: 'standby', battery: 88, name: 'Skyrunner X2', offsetLat: 0.0081, offsetLng: 0.0354 },
  { id: 'DR-003', status: 'standby', battery: 75, name: 'Skyrunner X1', offsetLat: -0.0029, offsetLng: 0.0411 },
  { id: 'DR-004', status: 'standby', battery: 95, name: 'Skyrunner X2', offsetLat: 0.0120, offsetLng: 0.0006 },
  { id: 'DR-005', status: 'standby', battery: 67, name: 'Skyrunner X1', offsetLat: -0.0041, offsetLng: 0.0079 },
  { id: 'DR-006', status: 'standby', battery: 81, name: 'Skyrunner X2', offsetLat: 0.0213, offsetLng: 0.0251 },
  { id: 'DR-007', status: 'standby', battery: 58, name: 'Skyrunner X1', offsetLat: -0.0099, offsetLng: -0.0081 },
  { id: 'DR-008', status: 'standby', battery: 90, name: 'Skyrunner X2', offsetLat: 0.0151, offsetLng: -0.0285 },
  { id: 'DR-009', status: 'standby', battery: 73, name: 'Skyrunner X1', offsetLat: 0.0275, offsetLng: 0.0031 },
  { id: 'DR-010', status: 'standby', battery: 86, name: 'Skyrunner X2', offsetLat: 0.0060, offsetLng: 0.1571 },
  { id: 'DR-011', status: 'standby', battery: 78, name: 'Skyrunner X1', offsetLat: -0.0181, offsetLng: -0.0165 },
  { id: 'DR-012', status: 'delivering', battery: 62, name: 'Skyrunner X2', eta: '8 mins', load: 2, offsetLat: 0.0071, offsetLng: 0.0269 },
  { id: 'DR-013', status: 'delivering', battery: 71, name: 'Skyrunner X1', eta: '12 mins', load: 3, offsetLat: 0.0247, offsetLng: -0.0113 },
  { id: 'DR-014', status: 'delivering', battery: 55, name: 'Skyrunner X2', eta: '15 mins', load: 1, offsetLat: -0.0107, offsetLng: -0.0467 },
  { id: 'DR-015', status: 'delivering', battery: 68, name: 'Skyrunner X1', eta: '6 mins', load: 4, offsetLat: 0.0017, offsetLng: 0.0521 },
  { id: 'DR-016', status: 'delivering', battery: 84, name: 'Skyrunner X2', eta: '10 mins', load: 2, offsetLat: 0.0356, offsetLng: 0.0218 },
  { id: 'DR-017', status: 'delivering', battery: 77, name: 'Skyrunner X1', eta: '5 mins', load: 3, offsetLat: -0.0224, offsetLng: 0.0261 },
  { id: 'DR-018', status: 'standby', battery: 18, name: 'Skyrunner X2', offsetLat: -0.0063, offsetLng: -0.0143 },
  { id: 'DR-019', status: 'delivering', battery: 22, name: 'Skyrunner X1', eta: '3 mins', load: 1, offsetLat: 0.0195, offsetLng: 0.0461 },
  { id: 'DR-020', status: 'standby', battery: 15, name: 'Skyrunner X2', offsetLat: -0.0092, offsetLng: -0.0277 },
  { id: 'DR-021', status: 'standby', battery: 20, name: 'Skyrunner X1', offsetLat: 0.0402, offsetLng: -0.0096 }
]

const ABU_DHABI_DRONES = [
  { id: 'DR-001', status: 'standby', battery: 94, name: 'Skyrunner X1', offsetLat: 0, offsetLng: 0 },
  { id: 'DR-002', status: 'standby', battery: 88, name: 'Skyrunner X2', offsetLat: 0.008, offsetLng: 0.012 },
  { id: 'DR-003', status: 'standby', battery: 76, name: 'Skyrunner X1', offsetLat: -0.006, offsetLng: 0.008 },
  { id: 'DR-004', status: 'standby', battery: 91, name: 'Skyrunner X2', offsetLat: 0.012, offsetLng: -0.005 },
  { id: 'DR-005', status: 'standby', battery: 82, name: 'Skyrunner X1', offsetLat: -0.004, offsetLng: -0.011 },
  { id: 'DR-006', status: 'standby', battery: 65, name: 'Skyrunner X2', offsetLat: 0.015, offsetLng: 0.018 },
  { id: 'DR-007', status: 'delivering', battery: 58, name: 'Skyrunner X1', eta: '10 mins', load: 2, offsetLat: -0.009, offsetLng: 0.022 },
  { id: 'DR-008', status: 'delivering', battery: 72, name: 'Skyrunner X2', eta: '7 mins', load: 1, offsetLat: 0.018, offsetLng: -0.008 },
  { id: 'DR-009', status: 'standby', battery: 19, name: 'Skyrunner X1', offsetLat: -0.012, offsetLng: -0.015 },
  { id: 'DR-010', status: 'delivering', battery: 24, name: 'Skyrunner X2', eta: '4 mins', load: 3, offsetLat: 0.006, offsetLng: -0.018 }
]

const PARIS_DRONES = [
  { id: 'DR-001', status: 'standby', battery: 90, name: 'Skyrunner X1', offsetLat: 0, offsetLng: 0 },
  { id: 'DR-002', status: 'standby', battery: 85, name: 'Skyrunner X2', offsetLat: 0.006, offsetLng: 0.004 },
  { id: 'DR-003', status: 'standby', battery: 78, name: 'Skyrunner X1', offsetLat: -0.005, offsetLng: 0.009 },
  { id: 'DR-004', status: 'standby', battery: 92, name: 'Skyrunner X2', offsetLat: 0.009, offsetLng: -0.003 },
  { id: 'DR-005', status: 'standby', battery: 70, name: 'Skyrunner X1', offsetLat: -0.008, offsetLng: -0.006 },
  { id: 'DR-006', status: 'standby', battery: 88, name: 'Skyrunner X2', offsetLat: 0.011, offsetLng: 0.014 },
  { id: 'DR-007', status: 'delivering', battery: 64, name: 'Skyrunner X1', eta: '9 mins', load: 2, offsetLat: -0.004, offsetLng: 0.018 },
  { id: 'DR-008', status: 'delivering', battery: 75, name: 'Skyrunner X2', eta: '12 mins', load: 4, offsetLat: 0.013, offsetLng: -0.012 },
  { id: 'DR-009', status: 'standby', battery: 17, name: 'Skyrunner X1', offsetLat: -0.011, offsetLng: 0.005 },
  { id: 'DR-010', status: 'delivering', battery: 21, name: 'Skyrunner X2', eta: '5 mins', load: 1, offsetLat: 0.007, offsetLng: -0.016 }
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
