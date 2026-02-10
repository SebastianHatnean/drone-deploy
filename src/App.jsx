import { useState, useRef, useEffect } from 'react'
import Map, { Marker, Popup } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import './App.css'
import { cities, getCityById } from './data/locations'
import { getMarkerColor } from './utils/droneHelpers'
import DronePopup from './components/DronePopup'
import DroneCard from './components/DroneCard'
import FleetTable from './components/FleetTable'
import skyrunnerX1 from './assets/skyrunnerX1.png'
import skyrunnerX2 from './assets/skyrunnerX2.png'
import droneMockup from './assets/drone-mockup.png'

const ZOOM_INCREMENT = 0.5
const DEFAULT_ZOOM = 12

function App() {
  const [activeCityId, setActiveCityId] = useState(cities[0].id)
  const activeCity = getCityById(activeCityId)
  const drones = activeCity.drones

  const [viewState, setViewState] = useState({
    longitude: activeCity.center.lng,
    latitude: activeCity.center.lat,
    zoom: DEFAULT_ZOOM + 0.5
  })

  const [selectedDrone, setSelectedDrone] = useState(null)
  const [hoveredDrone, setHoveredDrone] = useState(null)
  const [preSelectionZoom, setPreSelectionZoom] = useState(null)
  const [mapAnimationComplete, setMapAnimationComplete] = useState(false)
  const [criticalBatteryFilter, setCriticalBatteryFilter] = useState(false)

  const displayedDrones = criticalBatteryFilter
    ? drones.filter(d => d.battery < 20)
    : drones

  // Clear selection when selected drone is filtered out
  useEffect(() => {
    if (criticalBatteryFilter && selectedDrone && !displayedDrones.find(d => d.id === selectedDrone)) {
      setSelectedDrone(null)
    }
  }, [criticalBatteryFilter, displayedDrones, selectedDrone])

  const mapRef = useRef(null)

  const isInitialMount = useRef(true)

  // Fly to city when switching (skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    setSelectedDrone(null)
    setViewState({
      longitude: activeCity.center.lng,
      latitude: activeCity.center.lat,
      zoom: activeCity.zoom + 0.5
    })
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [activeCity.center.lng, activeCity.center.lat],
        zoom: activeCity.zoom,
        duration: 1200,
        essential: true
      })
    }
  }, [activeCityId, activeCity])

  // Preload drone images when app loads
  useEffect(() => {
    const imagesToPreload = [skyrunnerX1, skyrunnerX2, droneMockup]
    
    imagesToPreload.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  // Zoom out animation when map finishes loading
  const handleMapLoad = () => {
    if (mapRef.current) {
      mapRef.current.easeTo({
        zoom: activeCity.zoom,
        duration: 1000,
        easing: (t) => 1 - Math.pow(1 - t, 3) // Cubic ease-out
      })
      
      // Trigger table fade-in after zoom animation completes
      setTimeout(() => {
        setMapAnimationComplete(true)
      }, 1000)
    }
  }

  const handleDroneSelect = (droneId) => {
    const drone = drones.find(d => d.id === droneId)
    if (!drone) return

    const isFirstSelection = selectedDrone === null
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/8e58a966-9876-4f24-bc09-47b74c79ad18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:handleDroneSelect',message:'handleDroneSelect called',data:{droneId,isFirstSelection,currentSelectedDrone:selectedDrone},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A',runId:'post-fix'})}).catch(()=>{});
    // #endregion
    
    if (isFirstSelection) {
      // Store current zoom before zooming in
      setPreSelectionZoom(viewState.zoom)
    }

    // Simply set the new drone - animation handled by CSS with unique key
    setSelectedDrone(droneId)

    // Fly to drone - only zoom in on first selection
    if (mapRef.current) {
      const flyToOptions = {
        center: [drone.coordinates.lng, drone.coordinates.lat],
        duration: 1000,
        essential: true
      }
      
      // Only include zoom if it's the first selection
      if (isFirstSelection) {
        flyToOptions.zoom = viewState.zoom + ZOOM_INCREMENT
      }
      
      mapRef.current.flyTo(flyToOptions)
    }
  }

  const handleDroneDeselect = () => {
    // Restore original zoom level
    if (mapRef.current && preSelectionZoom !== null) {
      mapRef.current.easeTo({
        zoom: preSelectionZoom,
        duration: 800
      })
    }

    setPreSelectionZoom(null)
    setSelectedDrone(null)
  }

  const handleTableHover = (droneId) => {
    if (droneId) {
      const drone = drones.find(d => d.id === droneId)
      setHoveredDrone(drone)
    } else {
      setHoveredDrone(null)
    }
  }

  return (
    <>
      {/* City Selector */}
      <div className="city-selector">
        <label htmlFor="city-select" className="city-selector-label">City</label>
        <select
          id="city-select"
          className="city-select"
          value={activeCityId}
          onChange={(e) => setActiveCityId(e.target.value)}
        >
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <div className="map-container">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onLoad={handleMapLoad}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        >
          {displayedDrones.map(drone => (
            <Marker
              key={drone.id}
              longitude={drone.coordinates.lng}
              latitude={drone.coordinates.lat}
            >
              <div 
                className={`marker ${selectedDrone === drone.id ? 'radar-effect' : ''}`}
                style={{ backgroundColor: getMarkerColor(drone), color: getMarkerColor(drone) }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDroneSelect(drone.id)
                }}
                onMouseEnter={() => setHoveredDrone(drone)}
                onMouseLeave={() => setHoveredDrone(null)}
                title={`${drone.name} - ${drone.id}`}
              />
            </Marker>
          ))}
          
          {hoveredDrone && hoveredDrone.id !== selectedDrone && (
            <Popup
              longitude={hoveredDrone.coordinates.lng}
              latitude={hoveredDrone.coordinates.lat}
              closeButton={false}
              closeOnClick={false}
              anchor="bottom"
              offset={25}
            >
              <DronePopup drone={hoveredDrone} />
            </Popup>
          )}
        </Map>
      </div>

      <FleetTable
        drones={displayedDrones}
        selectedDrone={selectedDrone}
        onDroneSelect={handleDroneSelect}
        onDroneHover={handleTableHover}
        showTable={mapAnimationComplete}
        criticalBatteryFilter={criticalBatteryFilter}
        onCriticalBatteryFilterChange={setCriticalBatteryFilter}
      />

      {/* Active card - key ensures fresh animation on drone change */}
      {selectedDrone && (
        <>
          {/* #region agent log */}
          {(() => { fetch('http://127.0.0.1:7243/ingest/8e58a966-9876-4f24-bc09-47b74c79ad18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:render:activeCard',message:'Rendering active card',data:{selectedDrone},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D',runId:'post-fix'})}).catch(()=>{}); return null; })()}
          {/* #endregion */}
          <DroneCard 
            key={selectedDrone}
            drone={drones.find(d => d.id === selectedDrone)} 
            onClose={handleDroneDeselect}
          />
        </>
      )}
    </>
  )
}

export default App