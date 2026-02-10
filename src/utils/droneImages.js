/**
 * Maps drone model names to asset images.
 * Uses all available drone images from assets folder.
 */
import skyrunnerX1 from '../assets/skyrunnerX1.png'
import skyrunnerX2 from '../assets/skyrunnerX2.png'
import taxiDrone1 from '../assets/taxi-drone-1.png'
import taxiDrone2 from '../assets/taxi-drone-2.png'
import taxiDrone3 from '../assets/taxi-drone-3.png'
import droneMockup from '../assets/drone-mockup.png'

/** Model → image mapping. All 6 assets used across 7 models. */
export const DRONE_IMAGE_MAP = {
  Dragonfly: skyrunnerX1,
  Peregrine: skyrunnerX2,
  'Sirocco Pax': taxiDrone1,
  'Zephyr T-Line': taxiDrone2,
  'Mistral 400': taxiDrone3,
  'Sky-Shuttle': droneMockup,
  VertiBus: taxiDrone2
}

/**
 * Get image source for a drone by model name
 * @param {string} model - Drone model (e.g. Dragonfly, Sirocco Pax)
 * @returns {string} Image URL/path
 */
export function getDroneImage(model) {
  return DRONE_IMAGE_MAP[model] ?? droneMockup
}
