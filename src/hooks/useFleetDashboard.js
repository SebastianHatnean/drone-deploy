import { useState, useRef, useEffect } from 'react'
import { getCityById } from '../data/locations'
import {
  ZOOM_INCREMENT,
  DEFAULT_ZOOM,
  CITY_SWITCH_FLY_DURATION,
  MAP_LOAD_EASE_DURATION,
  DESELECT_ZOOM_DURATION
} from '../constants'

/**
 * Custom hook that manages all fleet dashboard state and behaviors.
 * Encapsulates city switching, drone selection, filtering, and map interactions.
 *
 * @param {Object} options
 * @param {Array} options.cities - List of city objects
 * @param {React.RefObject} options.mapRef - Ref to the Mapbox map instance (for flyTo, easeTo)
 * @returns {Object} Fleet dashboard state and handlers
 */
export function useFleetDashboard({ cities, mapRef }) {
  const defaultCity = cities[0]
  const [activeCityId, setActiveCityId] = useState(defaultCity?.id)
  const activeCity = getCityById(activeCityId)
  const drones = activeCity?.drones ?? []

  const [viewState, setViewState] = useState({
    longitude: activeCity?.center?.lng ?? 0,
    latitude: activeCity?.center?.lat ?? 0,
    zoom: DEFAULT_ZOOM + 0.5
  })

  const [selectedDrone, setSelectedDrone] = useState(null)
  const [hoveredDrone, setHoveredDrone] = useState(null)
  const [preSelectionZoom, setPreSelectionZoom] = useState(null)
  const [mapAnimationComplete, setMapAnimationComplete] = useState(false)
  const [criticalBatteryFilter, setCriticalBatteryFilter] = useState(false)

  const isInitialMount = useRef(true)

  // Filtered drone list: critical battery only when filter is active
  const displayedDrones = criticalBatteryFilter
    ? drones.filter((d) => d.battery < 20)
    : drones

  // Clear selection when selected drone is filtered out
  useEffect(() => {
    if (
      criticalBatteryFilter &&
      selectedDrone &&
      !displayedDrones.find((d) => d.id === selectedDrone)
    ) {
      setSelectedDrone(null)
    }
  }, [criticalBatteryFilter, displayedDrones, selectedDrone])

  // Fly to city when switching (skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (!activeCity) return

    setSelectedDrone(null)
    setViewState({
      longitude: activeCity.center.lng,
      latitude: activeCity.center.lat,
      zoom: activeCity.zoom + 0.5
    })
    if (mapRef?.current) {
      mapRef.current.flyTo({
        center: [activeCity.center.lng, activeCity.center.lat],
        zoom: activeCity.zoom,
        duration: CITY_SWITCH_FLY_DURATION,
        essential: true
      })
    }
  }, [activeCityId, activeCity, mapRef])

  /** Called when map finishes loading - runs zoom animation and reveals table */
  const handleMapLoad = () => {
    if (mapRef?.current && activeCity) {
      mapRef.current.easeTo({
        zoom: activeCity.zoom,
        duration: MAP_LOAD_EASE_DURATION,
        easing: (t) => 1 - Math.pow(1 - t, 3)
      })
      setTimeout(() => setMapAnimationComplete(true), MAP_LOAD_EASE_DURATION)
    }
  }

  /** Select a drone by ID - flies map to marker and zooms in on first selection */
  const handleDroneSelect = (droneId) => {
    const drone = drones.find((d) => d.id === droneId)
    if (!drone) return

    const isFirstSelection = selectedDrone === null
    if (isFirstSelection) setPreSelectionZoom(viewState.zoom)

    setSelectedDrone(droneId)

    if (mapRef?.current) {
      const flyToOptions = {
        center: [drone.coordinates.lng, drone.coordinates.lat],
        duration: 1000,
        essential: true
      }
      if (isFirstSelection) {
        flyToOptions.zoom = viewState.zoom + ZOOM_INCREMENT
      }
      mapRef.current.flyTo(flyToOptions)
    }
  }

  /** Deselect drone - restores previous zoom level */
  const handleDroneDeselect = () => {
    if (mapRef?.current && preSelectionZoom !== null) {
      mapRef.current.easeTo({
        zoom: preSelectionZoom,
        duration: DESELECT_ZOOM_DURATION
      })
    }
    setPreSelectionZoom(null)
    setSelectedDrone(null)
  }

  /** Set hovered drone from table row hover (for map popup sync) */
  const handleTableHover = (droneId) => {
    if (droneId) {
      const drone = drones.find((d) => d.id === droneId)
      setHoveredDrone(drone)
    } else {
      setHoveredDrone(null)
    }
  }

  return {
    activeCityId,
    setActiveCityId,
    activeCity,
    drones,
    displayedDrones,
    viewState,
    setViewState,
    selectedDrone,
    hoveredDrone,
    setHoveredDrone,
    criticalBatteryFilter,
    setCriticalBatteryFilter,
    mapAnimationComplete,
    handleMapLoad,
    handleDroneSelect,
    handleDroneDeselect,
    handleTableHover
  }
}
