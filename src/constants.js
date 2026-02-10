/**
 * App-wide configuration constants.
 * Centralizes values used across components for easier maintenance.
 */

/** Zoom level added when user selects a drone (focus-in effect) */
export const ZOOM_INCREMENT = 0.5

/** Default map zoom level when viewing a city */
export const DEFAULT_ZOOM = 12

/** Map style URL - dark theme for dashboard aesthetic */
export const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11'

/** Duration (ms) for map flyTo animation when switching cities */
export const CITY_SWITCH_FLY_DURATION = 1200

/** Duration (ms) for map easeTo animation on initial load */
export const MAP_LOAD_EASE_DURATION = 1000

/** Duration (ms) for zoom-out when deselecting a drone */
export const DESELECT_ZOOM_DURATION = 800
