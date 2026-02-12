import { useRef, useEffect } from 'react'
import './App.css'
import { cities } from './data/locations'
import { MAP_STYLE } from './constants'
import CitySelector from './components/CitySelector'
import DroneMap from './components/DroneMap'
import DroneCard from './components/DroneCard'
import FleetTable from './components/FleetTable'
import { useFleetDashboard } from './hooks/useFleetDashboard'
import { DRONE_IMAGE_MAP } from './utils/droneImages'

/**
 * App - Root component for the Drone Fleet Dashboard.
 * Composes CitySelector, DroneMap, FleetTable, and DroneCard via the useFleetDashboard hook.
 */
function App() {
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

  // Preload drone images for faster card rendering
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
      <CitySelector
        cities={cities}
        value={activeCityId}
        onChange={setActiveCityId}
      />

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

export default App
