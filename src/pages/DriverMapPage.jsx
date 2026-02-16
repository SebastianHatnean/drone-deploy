import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import Draggable from 'react-draggable'
import { Zap, Users, MapPin, Navigation, GripVertical, CheckCircle, Battery } from 'lucide-react'
import { cities, generateRandomRide } from '../data/locations'
import { enrichDeliveringDrones } from '../data/tripData'
import { getFleetBounds } from '../data/tripData'
import { MAP_STYLE } from '../constants'
import DroneMap from '../components/DroneMap'
import { useTripProgress } from '../hooks/useTripProgress'
import { getStatusDisplay, getDroneCapacity } from '../utils/droneHelpers'
import ModeSwitcher from '../components/ModeSwitcher'
import { saveCompletedRide } from '../utils/driverRideStorage'
import { getDriverBattery, setDriverBattery, drainBatteryAfterRide } from '../utils/driverBatteryStorage'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

/** Mock: ID of the drone assigned to the current driver. Replace with auth/assignment later. */
const DRIVER_DRONE_ID = 'AUH-DR-011'

const NOTIFICATION_DELAY_MS = 5000
const NEXT_RIDE_DELAY_MS = 10000 // 10 seconds after completion before next ride
const CHARGE_DURATION_MS = 5000 // 5 seconds to fully charge
const CHARGE_TICK_MS = 100 // Update every 100ms during charging

/**
 * DriverMapPage - Driver-only map view.
 * Ride appears only after driver accepts. Notification appears 5s after route access.
 */
export default function DriverMapPage() {
  const mapRef = useRef(null)

  // Battery management
  const [droneBattery, setDroneBattery] = useState(() => getDriverBattery())
  const [isCharging, setIsCharging] = useState(false)
  const chargingIntervalRef = useRef(null)

  // Generate a new random ride each time component mounts or after completion
  const [currentRide, setCurrentRide] = useState(() => generateRandomRide())
  
  // Get the driver's base drone and enrich it with the current ride
  const allDrones = cities.flatMap((c) => c.drones)
  const driverDroneRaw = allDrones.find((d) => d.id === DRIVER_DRONE_ID)
  
  // Apply the random ride to the driver's drone (with current battery)
  const driverDroneWithRide = useMemo(() => {
    if (!driverDroneRaw) return null
    return {
      ...driverDroneRaw,
      battery: droneBattery,
      eta: currentRide.eta,
      load: currentRide.passengers,
      tripOrigin: currentRide.origin,
      tripDestination: currentRide.destination,
      coordinates: {
        lat: currentRide.origin.lat,
        lng: currentRide.origin.lng
      }
    }
  }, [driverDroneRaw, currentRide, droneBattery])
  
  const rideOfferData = enrichDeliveringDrones(driverDroneWithRide ? [driverDroneWithRide] : [])[0] ?? null

  const [notificationVisible, setNotificationVisible] = useState(false)
  const [rideResponse, setRideResponse] = useState(null) // null | 'accepted' | 'rejected'
  const [lastCompletedRide, setLastCompletedRide] = useState(null)
  const [waitingForNextRide, setWaitingForNextRide] = useState(false) // Delay after completion
  const rideCardNodeRef = useRef(null)

  // Only show ride on map after driver accepts
  const driverDrone = rideResponse === 'accepted' ? rideOfferData : null

  const deliveringDrones = driverDrone?.status === 'delivering' ? [driverDrone] : []

  const handleRideComplete = useCallback((drone) => {
    // Drain battery based on ride distance
    const newBattery = drainBatteryAfterRide(drone.tripOrigin, drone.tripDestination)
    setDroneBattery(newBattery)
    
    const saved = saveCompletedRide({
      droneId: drone.id,
      droneName: drone.name ?? drone.model,
      origin: drone.tripOrigin?.name ?? 'Origin',
      destination: drone.tripDestination?.name ?? 'Destination',
      passengers: drone.load ?? 0,
      eta: drone.eta
    })
    setLastCompletedRide(saved)
    setRideResponse(null)
    setWaitingForNextRide(true)
    
    // Wait 10 seconds, then generate a new ride and allow next notification
    setTimeout(() => {
      setCurrentRide(generateRandomRide()) // Generate new ride for next request
      setWaitingForNextRide(false)
    }, NEXT_RIDE_DELAY_MS)
  }, [])

  const { progressMap, getDronePosition, getDroneBearing } = useTripProgress(deliveringDrones, {
    onRideComplete: handleRideComplete
  })

  const [viewState, setViewState] = useState({
    longitude: 54.3773,
    latitude: 24.4539,
    zoom: 13
  })

  const [mapAnimationComplete, setMapAnimationComplete] = useState(false)

  // Show notification 5 seconds after route access (only if not waiting for next ride)
  useEffect(() => {
    if (!rideOfferData || rideResponse || waitingForNextRide) return
    const timer = setTimeout(() => setNotificationVisible(true), NOTIFICATION_DELAY_MS)
    return () => clearTimeout(timer)
  }, [rideOfferData, rideResponse, waitingForNextRide])

  const handleAccept = () => {
    setRideResponse('accepted')
    setNotificationVisible(false)
  }

  const handleReject = () => {
    setNotificationVisible(false)
    // Generate a new ride and reset after a brief delay
    setTimeout(() => {
      setCurrentRide(generateRandomRide())
      setRideResponse(null)
    }, 2000)
  }

  // Charging functionality
  const handleStartCharging = () => {
    if (isCharging || droneBattery >= 100 || rideResponse === 'accepted') return
    
    setIsCharging(true)
    const startBattery = droneBattery
    const startTime = Date.now()
    const targetBattery = 100
    const batteryToCharge = targetBattery - startBattery
    
    chargingIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / CHARGE_DURATION_MS)
      const newBattery = Math.round(startBattery + batteryToCharge * progress)
      
      setDroneBattery(newBattery)
      setDriverBattery(newBattery)
      
      if (progress >= 1) {
        setIsCharging(false)
        clearInterval(chargingIntervalRef.current)
      }
    }, CHARGE_TICK_MS)
  }

  const handleStopCharging = () => {
    if (chargingIntervalRef.current) {
      clearInterval(chargingIntervalRef.current)
      chargingIntervalRef.current = null
    }
    setIsCharging(false)
  }

  // Clean up charging interval on unmount
  useEffect(() => {
    return () => {
      if (chargingIntervalRef.current) {
        clearInterval(chargingIntervalRef.current)
      }
    }
  }, [])

  const handleMapLoad = () => {
    // Map loaded – if driver already accepted, fit bounds and show card
    if (mapRef.current && driverDrone) {
      const bounds = getFleetBounds([driverDrone])
      if (bounds) {
        const [[swLng, swLat], [neLng, neLat]] = bounds
        mapRef.current.fitBounds(
          [
            [swLng, swLat],
            [neLng, neLat]
          ],
          { padding: 80, duration: 1000 }
        )
      }
      setMapAnimationComplete(true)
    }
  }

  // When driver accepts, fit map to ride and show card (map may already be loaded)
  useEffect(() => {
    if (!driverDrone) return
    const center = driverDrone.status === 'delivering' && driverDrone.tripRoute
      ? { lng: driverDrone.tripRoute[0][0], lat: driverDrone.tripRoute[0][1] }
      : driverDrone.coordinates
    setViewState((prev) => ({
      ...prev,
      longitude: center.lng,
      latitude: center.lat
    }))

    if (mapRef.current) {
      const bounds = getFleetBounds([driverDrone])
      if (bounds) {
        const [[swLng, swLat], [neLng, neLat]] = bounds
        mapRef.current.fitBounds(
          [
            [swLng, swLat],
            [neLng, neLat]
          ],
          { padding: 80, duration: 1000 }
        )
      }
      setMapAnimationComplete(true)
    }
  }, [driverDrone?.id])

  const dronesToShow = driverDrone ? [driverDrone] : []

  return (
    <>
      <header className="app-header app-header-driver">
        <div className="driver-header-content">
          <h1 className="driver-header-title">Driver</h1>
          <nav className="driver-nav" aria-label="Driver navigation">
            <NavLink
              to="/driver"
              end
              className={({ isActive }) =>
                `driver-nav-link ${isActive ? 'driver-nav-link-active' : ''}`
              }
            >
              Map
            </NavLink>
            <NavLink
              to="/driver/dashboard"
              className={({ isActive }) =>
                `driver-nav-link ${isActive ? 'driver-nav-link-active' : ''}`
              }
            >
              Dashboard
            </NavLink>
          </nav>
        </div>
        <ModeSwitcher />
      </header>

      <DroneMap
        ref={mapRef}
        drones={dronesToShow}
        deliveringDronesWithTrips={deliveringDrones}
        getDronePosition={getDronePosition}
        getDroneBearing={getDroneBearing}
        viewState={viewState}
        onMove={setViewState}
        onLoad={handleMapLoad}
        selectedDroneId={driverDrone?.id ?? null}
        hoveredDrone={null}
        onDroneSelect={() => {}}
        onDroneHover={() => {}}
        mapStyle={MAP_STYLE}
      />

      {mapAnimationComplete && driverDrone && driverDrone.status === 'delivering' && (
        <Draggable
          nodeRef={rideCardNodeRef}
          handle=".driver-ride-card-drag-handle"
          cancel="button, input, a, [role='button']"
          defaultPosition={{ x: 0, y: 0 }}
          bounds={false}
          position={undefined}
        >
          <div ref={rideCardNodeRef} className="driver-ride-card">
            <div className="driver-ride-card-drag-handle modal-drag-handle" aria-label="Drag to move">
              <GripVertical size={18} />
              <h2 className="driver-ride-card-title">ACTIVE RIDE</h2>
            </div>
            <div className="driver-ride-card-content">
              <div className="driver-ride-panel-section">
                <h3 className="driver-ride-panel-title">
                  <MapPin size={16} />
                  Ride details
                </h3>
                <div className="driver-ride-route">
                  <span className="driver-ride-origin">{driverDrone.tripOrigin?.name ?? 'Origin'}</span>
                  <span className="driver-ride-arrow">→</span>
                  <span className="driver-ride-dest">{driverDrone.tripDestination?.name ?? 'Destination'}</span>
                </div>
                <div className="driver-ride-panel-row">
                  <span className="driver-ride-panel-label">Remaining time</span>
                  <span className="driver-ride-panel-value">{driverDrone.eta ?? '—'}</span>
                </div>
                <div className="driver-ride-panel-row">
                  <span className="driver-ride-panel-label">Progress</span>
                  <span className="driver-ride-panel-value">
                    {Math.round((progressMap[driverDrone.id] ?? 0) * 100)}% to destination
                  </span>
                </div>
              </div>

              <div className="driver-ride-panel-section">
                <h3 className="driver-ride-panel-title">
                  <Navigation size={16} />
                  Drone status
                </h3>
                <div className="driver-ride-panel-row">
                  <span className="driver-ride-panel-label">Status</span>
                  <span
                    className="driver-ride-panel-badge"
                    style={{ '--status-color': getStatusDisplay(driverDrone).color }}
                  >
                    {getStatusDisplay(driverDrone).text}
                  </span>
                </div>
                <div className="driver-ride-panel-row">
                  <span className="driver-ride-panel-label">Model</span>
                  <span className="driver-ride-panel-value">{driverDrone.name ?? driverDrone.model}</span>
                </div>
                <div className="driver-ride-panel-row">
                  <span className="driver-ride-panel-label">Battery</span>
                  <span className="driver-ride-panel-value driver-ride-battery">
                    <Zap size={14} />
                    {driverDrone.battery}%
                  </span>
                </div>
                <div className="driver-ride-panel-row">
                  <span className="driver-ride-panel-label">Range</span>
                  <span className="driver-ride-panel-value">{driverDrone.range ?? '—'} km</span>
                </div>
              </div>

              <div className="driver-ride-panel-section">
                <h3 className="driver-ride-panel-title">
                  <Users size={16} />
                  Load setup
                </h3>
                <div className="driver-ride-panel-row">
                  <span className="driver-ride-panel-label">Capacity</span>
                  <span className="driver-ride-panel-value">{getDroneCapacity(driverDrone.name)}</span>
                </div>
                <div className="driver-ride-panel-row">
                  <span className="driver-ride-panel-label">Passengers onboard</span>
                  <span className="driver-ride-panel-value">
                    {driverDrone.load ?? 0} of {getDroneCapacity(driverDrone.name)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Draggable>
      )}

      {notificationVisible && rideOfferData && (
        <div className="driver-notification">
          <div className="driver-notification-content">
            <h3 className="driver-notification-title">New ride request</h3>
            <p className="driver-notification-subtitle">Passenger pickup</p>
            <div className="driver-notification-route">
              <span className="driver-ride-origin">{rideOfferData.tripOrigin?.name ?? 'Origin'}</span>
              <span className="driver-ride-arrow">→</span>
              <span className="driver-ride-dest">{rideOfferData.tripDestination?.name ?? 'Destination'}</span>
            </div>
            <div className="driver-notification-meta">
              <span>ETA: {rideOfferData.eta ?? '—'}</span>
              <span>{rideOfferData.load ?? 0} passenger{rideOfferData.load !== 1 ? 's' : ''}</span>
            </div>
            <div className="driver-notification-actions">
              <button
                type="button"
                className="driver-notification-btn driver-notification-btn-reject"
                onClick={handleReject}
              >
                Reject
              </button>
              <button
                type="button"
                className="driver-notification-btn driver-notification-btn-accept"
                onClick={handleAccept}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!lastCompletedRide} onOpenChange={(open) => !open && setLastCompletedRide(null)}>
        <DialogContent className="driver-ride-completed-modal" showCloseButton={true}>
          {lastCompletedRide && (
            <>
              <DialogHeader>
                <DialogTitle className="driver-ride-completed-title">
                  <CheckCircle size={24} />
                  Ride completed
                </DialogTitle>
              </DialogHeader>
              <div className="driver-ride-completed-content">
                <div className="driver-ride-route">
                  <span className="driver-ride-origin">{lastCompletedRide.origin}</span>
                  <span className="driver-ride-arrow">→</span>
                  <span className="driver-ride-dest">{lastCompletedRide.destination}</span>
                </div>
                <p className="driver-ride-completed-meta">
                  {lastCompletedRide.passengers} passenger{lastCompletedRide.passengers !== 1 ? 's' : ''} · {lastCompletedRide.droneName}
                </p>
                <p className="driver-ride-completed-saved">
                  Saved to your dashboard and ride history.
                </p>
              </div>
              <DialogFooter showCloseButton={false}>
                <Button onClick={() => setLastCompletedRide(null)}>OK</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {!driverDrone && !notificationVisible && (
        <div className="driver-no-assignment">
          <div className="driver-battery-status">
            <div className="driver-battery-level">
              <Battery 
                size={24} 
                className={`driver-battery-icon ${droneBattery < 25 ? 'low' : ''}`}
              />
              <span className="driver-battery-percentage">{droneBattery}%</span>
            </div>
            {!isCharging && droneBattery < 100 && (
              <button
                type="button"
                className="driver-charge-btn"
                onClick={handleStartCharging}
              >
                <Zap size={16} />
                Charge Drone
              </button>
            )}
            {isCharging && (
              <button
                type="button"
                className="driver-charge-btn charging"
                onClick={handleStopCharging}
              >
                <Zap size={16} className="charging-icon" />
                Charging... {droneBattery}%
              </button>
            )}
          </div>
          <p>
            {waitingForNextRide 
              ? 'Great job! Preparing next ride...' 
              : 'Waiting for ride requests...'}
          </p>
          <p className="driver-no-assignment-hint">
            {waitingForNextRide
              ? 'Next ride request will appear shortly.'
              : 'You will receive a notification when a ride is available.'}
          </p>
        </div>
      )}
    </>
  )
}
