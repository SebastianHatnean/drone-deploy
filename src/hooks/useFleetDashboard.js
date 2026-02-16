import { useState, useRef, useEffect } from 'react'
import { getCityById } from '../data/locations'
import { enrichDeliveringDrones, getFleetBounds } from '../data/tripData'
import { loadBatteryLevels, saveBatteryLevel, resetBatteryLevels } from '../utils/batteryStorage'
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
  const rawDrones = activeCity?.drones ?? []

  const [batteryOverrides, setBatteryOverrides] = useState(loadBatteryLevels)

  // Merge drones with persisted battery levels; recalculate range when battery is overridden
  const dronesWithBattery = rawDrones.map((d) => {
    const storedBattery = batteryOverrides[d.id]
    if (storedBattery == null) return d
    const battery = Number(storedBattery)
    if (Number.isNaN(battery)) return d
    const range = battery < 25 ? 8 : battery < 50 ? 18 : 35
    return { ...d, battery, range }
  })

  // Add trip data (origin, destination, route) for delivering drones
  const drones = enrichDeliveringDrones(dronesWithBattery)

  const [viewState, setViewState] = useState({
    longitude: activeCity?.center?.lng ?? 0,
    latitude: activeCity?.center?.lat ?? 0,
    zoom: DEFAULT_ZOOM + 0.5
  })

  const [selectedDrone, setSelectedDrone] = useState(null)
  const [hoveredDrone, setHoveredDrone] = useState(null)
  const [preSelectionZoom, setPreSelectionZoom] = useState(null)
  const [mapAnimationComplete, setMapAnimationComplete] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState({
    active: true,
    ready: true,
    lowBat: true
  })
  const [criticalBatteryFilter, setCriticalBatteryFilter] = useState(false)

  const isInitialMount = useRef(true)

  const matchesCategory = (drone) => {
    const allUnselected =
      !categoryFilter.active && !categoryFilter.ready && !categoryFilter.lowBat
    if (allUnselected) return false
    if (drone.battery < 25) return categoryFilter.lowBat
    if (drone.status === 'delivering') return categoryFilter.active
    return categoryFilter.ready
  }

  let displayedDrones = drones.filter(matchesCategory)
  if (criticalBatteryFilter) {
    displayedDrones = displayedDrones.filter((d) => d.battery < 20)
  }

  const toggleCategory = (key) => {
    setCategoryFilter((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Clear selection when selected drone is filtered out
  useEffect(() => {
    if (
      selectedDrone &&
      !displayedDrones.find((d) => d.id === selectedDrone)
    ) {
      setSelectedDrone(null)
    }
  }, [displayedDrones, selectedDrone])

  // Fly to city when switching (skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (!activeCity) return

    setSelectedDrone(null)
    const bounds = getFleetBounds(drones)
    if (mapRef?.current && bounds) {
      mapRef.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 80, right: 80 },
        maxZoom: 14,
        duration: CITY_SWITCH_FLY_DURATION,
        essential: true
      })
    } else {
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
    }
  }, [activeCityId, activeCity, mapRef, drones])

  /** Called when map finishes loading - fit bounds to show all drones and routes */
  const handleMapLoad = () => {
    if (mapRef?.current && drones.length > 0) {
      const bounds = getFleetBounds(drones)
      if (bounds) {
        mapRef.current.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 80, right: 80 },
          maxZoom: 14,
          duration: MAP_LOAD_EASE_DURATION,
          essential: true
        })
      } else if (activeCity) {
        mapRef.current.easeTo({
          center: [activeCity.center.lng, activeCity.center.lat],
          zoom: activeCity.zoom,
          duration: MAP_LOAD_EASE_DURATION,
          easing: (t) => 1 - Math.pow(1 - t, 3)
        })
      }
    }
    setTimeout(() => setMapAnimationComplete(true), MAP_LOAD_EASE_DURATION)
  }

  /** Select a drone by ID - flies map to marker and zooms in on first selection */
  const handleDroneSelect = (droneId, centerOverride) => {
    const drone = drones.find((d) => d.id === droneId)
    if (!drone) return

    const isFirstSelection = selectedDrone === null
    if (isFirstSelection) setPreSelectionZoom(viewState.zoom)

    setSelectedDrone(droneId)

    if (mapRef?.current) {
      const coords = centerOverride ?? drone.coordinates
      const flyToOptions = {
        center: [coords.lng, coords.lat],
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

  /** Update drone battery (after charging) and persist to localStorage */
  const updateDroneBattery = (droneId, battery) => {
    setBatteryOverrides((prev) => ({ ...prev, [droneId]: battery }))
    saveBatteryLevel(droneId, battery)
  }

  /** Reset all batteries to default values (clears localStorage overrides) */
  const resetBatteries = () => {
    setBatteryOverrides({})
    resetBatteryLevels()
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
    categoryFilter,
    setCategoryFilter,
    toggleCategory,
    criticalBatteryFilter,
    setCriticalBatteryFilter,
    mapAnimationComplete,
    handleMapLoad,
    handleDroneSelect,
    handleDroneDeselect,
    handleTableHover,
    updateDroneBattery,
    resetBatteries
  }
}
