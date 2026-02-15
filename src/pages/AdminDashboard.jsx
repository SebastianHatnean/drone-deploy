import { useRef, useEffect } from 'react'
import { cities } from '../data/locations'
import { MAP_STYLE } from '../constants'
import AppMenu from '../components/AppMenu'
import DroneMap from '../components/DroneMap'
import DroneCard from '../components/DroneCard'
import FleetTable from '../components/FleetTable'
import { useFleetDashboard } from '../hooks/useFleetDashboard'
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
    drones,
    displayedDrones,
    updateDroneBattery,
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
  } = useFleetDashboard({ cities, mapRef })

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
          criticalBatteryFilter={criticalBatteryFilter}
          onCriticalBatteryFilterChange={setCriticalBatteryFilter}
        />
      </header>

      <DroneMap
        ref={mapRef}
        drones={displayedDrones}
        viewState={viewState}
        onMove={setViewState}
        onLoad={handleMapLoad}
        selectedDroneId={selectedDrone}
        hoveredDrone={hoveredDrone}
        onDroneSelect={handleDroneSelect}
        onDroneHover={setHoveredDrone}
        mapStyle={MAP_STYLE}
      />

      <FleetTable
        drones={displayedDrones}
        selectedDrone={selectedDrone}
        onDroneSelect={handleDroneSelect}
        onDroneHover={handleTableHover}
        showTable={mapAnimationComplete}
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
