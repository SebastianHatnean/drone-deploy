import { useRef, useEffect } from 'react'
import { cities } from '../data/locations'
import { MAP_STYLE } from '../constants'
import AppMenu from '../components/AppMenu'
import ModeSwitcher from '../components/ModeSwitcher'
import DroneMap from '../components/DroneMap'
import DroneCard from '../components/DroneCard'
import FleetTable from '../components/FleetTable'
import OngoingTripsPanel from '../components/OngoingTripsPanel'
import { useFleetDashboard } from '../hooks/useFleetDashboard'
import { useTripProgress } from '../hooks/useTripProgress'
import { DRONE_IMAGE_MAP } from '../utils/droneImages'

/**
 * AdminDashboard - Full fleet management view for admin users.
 * Map, fleet table, drone details, charging, and all controls.
 */
export default function AdminDashboard() {
  const mapRef = useRef(null)

  const {
    activeCityId,
    setActiveCityId,
    resetBatteries,
    drones,
    displayedDrones,
    updateDroneBattery,
    viewState,
    setViewState,
    selectedDrone,
    hoveredDrone,
    setHoveredDrone,
    categoryFilter,
    toggleCategory,
    criticalBatteryFilter,
    setCriticalBatteryFilter,
    mapAnimationComplete,
    handleMapLoad,
    handleDroneSelect,
    handleDroneDeselect,
    handleTableHover
  } = useFleetDashboard({ cities, mapRef })

  const deliveringDrones = drones.filter((d) => d.status === 'delivering')
  const { progressMap, getDronePosition, getDroneBearing } = useTripProgress(deliveringDrones, {
    durationMode: 'random' // 20-30 seconds per ride (no distance-based timing)
  })

  const handleFocusDrone = (droneId) => {
    const drone = drones.find((d) => d.id === droneId)
    if (!drone) return
    const center =
      drone.status === 'delivering' && drone.tripRoute
        ? getDronePosition(drone)
        : drone.coordinates
    handleDroneSelect(droneId, center)
  }

  useEffect(() => {
    const uniqueImages = [...new Set(Object.values(DRONE_IMAGE_MAP))]
    uniqueImages.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  const selectedDroneData = drones.find((d) => d.id === selectedDrone)

  return (
    <>
      <header className="app-header">
        <AppMenu
          cities={cities}
          activeCityId={activeCityId}
          onCityChange={setActiveCityId}
          onResetBatteries={resetBatteries}
          criticalBatteryFilter={criticalBatteryFilter}
          onCriticalBatteryFilterChange={setCriticalBatteryFilter}
        />
        <ModeSwitcher />
      </header>

      <DroneMap
        ref={mapRef}
        drones={displayedDrones}
        deliveringDronesWithTrips={deliveringDrones}
        getDronePosition={getDronePosition}
        getDroneBearing={getDroneBearing}
        viewState={viewState}
        onMove={setViewState}
        onLoad={handleMapLoad}
        selectedDroneId={selectedDrone}
        hoveredDrone={hoveredDrone}
        onDroneSelect={handleDroneSelect}
        onDroneHover={setHoveredDrone}
        mapStyle={MAP_STYLE}
      />

      <OngoingTripsPanel
        deliveringDrones={deliveringDrones}
        progressMap={progressMap}
        onFocusDrone={handleFocusDrone}
        showPanel={mapAnimationComplete}
      />

      <FleetTable
        drones={displayedDrones}
        allDrones={drones}
        selectedDrone={selectedDrone}
        onDroneSelect={handleDroneSelect}
        onDroneHover={handleTableHover}
        showTable={mapAnimationComplete}
        categoryFilter={categoryFilter}
        onCategoryToggle={toggleCategory}
        criticalBatteryFilter={criticalBatteryFilter}
        onCriticalBatteryFilterChange={setCriticalBatteryFilter}
      />

      {selectedDroneData && (
        <DroneCard
          key={selectedDrone}
          drone={selectedDroneData}
          onClose={handleDroneDeselect}
          onBatteryUpdate={updateDroneBattery}
        />
      )}
    </>
  )
}
