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
  const [lowBatteryModalOpen, setLowBatteryModalOpen] = useState(false)
  const lowBatteryModalShownForRideRef = useRef(null) // Track which ride we've shown modal for
  const statusCardNodeRef = useRef(null)

  const batteryTooLow = droneBattery <= 0

  // Only show ride on map after driver accepts
  const driverDrone = rideResponse === 'accepted' ? rideOfferData : null

  const deliveringDrones = driverDrone?.status === 'delivering' ? [driverDrone] : []

  // Status for the persistent status card
  const driverStatus = driverDrone ? 'driving' : isCharging ? 'charging' : 'waiting'
  const waitingLabel = waitingForNextRide ? 'Preparing next ride' : notificationVisible ? 'Ride request pending' : 'Waiting for rides'

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

  // Show low battery modal only once per ride request when battery is 0%
  useEffect(() => {
    if (!notificationVisible || !rideOfferData || !batteryTooLow) {
      if (!notificationVisible) lowBatteryModalShownForRideRef.current = null
      if (!batteryTooLow) setLowBatteryModalOpen(false)
      return
    }
    const rideKey = `${rideOfferData.tripOrigin?.name}-${rideOfferData.tripDestination?.name}`
    if (lowBatteryModalShownForRideRef.current === rideKey) return
    lowBatteryModalShownForRideRef.current = rideKey
    setLowBatteryModalOpen(true)
  }, [notificationVisible, rideOfferData?.tripOrigin?.name, rideOfferData?.tripDestination?.name, batteryTooLow])

  const handleAccept = () => {
    if (batteryTooLow) return
    setRideResponse('accepted')
    setNotificationVisible(false)
  }

  const handleChargeFromModal = () => {
    setLowBatteryModalOpen(false)
    handleStartCharging()
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

      {/* Always-visible draggable drone status card */}
      <Draggable
        nodeRef={statusCardNodeRef}
        handle=".driver-status-card-drag-handle"
        cancel="button, input, a, [role='button']"
        defaultPosition={{ x: 24, y: 76 }}
        bounds={false}
        position={undefined}
      >
        <div ref={statusCardNodeRef} className="driver-status-card">
          <div className="driver-status-card-drag-handle modal-drag-handle" aria-label="Drag to move">
            <GripVertical size={18} />
            <h2 className="driver-status-card-title">DRONE STATUS</h2>
          </div>
          <div className="driver-status-card-content">
            <div className="driver-status-card-section">
              <div className="driver-status-card-row">
                <span className="driver-status-card-label">Status</span>
                <span
                  className={`driver-status-card-badge driver-status-badge-${driverStatus}`}
                >
                  {driverStatus === 'driving' && <Navigation size={14} />}
                  {driverStatus === 'charging' && <Zap size={14} className="charging-icon" />}
                  {driverStatus === 'waiting' && <MapPin size={14} />}
                  {driverStatus === 'driving' && 'Driving'}
                  {driverStatus === 'charging' && 'Charging'}
                  {driverStatus === 'waiting' && waitingLabel}
                </span>
              </div>
              <div className="driver-status-card-row">
                <span className="driver-status-card-label">Battery</span>
                <span className={`driver-status-card-value driver-status-battery ${droneBattery < 25 ? 'low' : ''}`}>
                  <Battery size={14} />
                  {droneBattery}%
                  {isCharging && <span className="driver-status-charging-indicator"> ↑</span>}
                </span>
              </div>
              {driverStatus === 'driving' && driverDrone && (
                <>
                  <div className="driver-status-card-row">
                    <span className="driver-status-card-label">Model</span>
                    <span className="driver-status-card-value">{driverDrone.name ?? driverDrone.model}</span>
                  </div>
                  <div className="driver-status-card-row">
                    <span className="driver-status-card-label">Progress</span>
                    <span className="driver-status-card-value">
                      {Math.round((progressMap[driverDrone.id] ?? 0) * 100)}% to destination
                    </span>
                  </div>
                  <div className="driver-status-route">
                    <span className="driver-ride-origin">{driverDrone.tripOrigin?.name ?? 'Origin'}</span>
                    <span className="driver-ride-arrow">→</span>
                    <span className="driver-ride-dest">{driverDrone.tripDestination?.name ?? 'Destination'}</span>
                  </div>
                  <div className="driver-status-card-row">
                    <span className="driver-status-card-label">Passengers</span>
                    <span className="driver-status-card-value">
                      {driverDrone.load ?? 0} of {getDroneCapacity(driverDrone.name)}
                    </span>
                  </div>
                </>
              )}
              {driverStatus !== 'driving' && droneBattery < 100 && (
                <div className="driver-status-charge-action">
                  {!isCharging ? (
                    <button
                      type="button"
                      className="driver-status-charge-btn"
                      onClick={handleStartCharging}
                    >
                      <Zap size={16} />
                      Charge Drone
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="driver-status-charge-btn charging"
                      onClick={handleStopCharging}
                    >
                      <Zap size={16} className="charging-icon" />
                      Charging... {droneBattery}%
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Draggable>

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
                disabled={batteryTooLow}
                title={batteryTooLow ? 'Charge the drone first' : undefined}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={lowBatteryModalOpen} onOpenChange={(open) => !open && setLowBatteryModalOpen(false)}>
        <DialogContent className="driver-low-battery-modal" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="driver-low-battery-title">
              <Battery size={24} className="driver-low-battery-icon" />
              Drone has no battery
            </DialogTitle>
          </DialogHeader>
          <div className="driver-low-battery-content">
            <p>Your drone cannot fly without battery. Please charge it before accepting rides.</p>
          </div>
          <DialogFooter showCloseButton={false}>
            <Button variant="outline" onClick={() => setLowBatteryModalOpen(false)}>
              Close
            </Button>
            <Button onClick={handleChargeFromModal} disabled={isCharging}>
              <Zap size={16} />
              Charge Drone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

    </>
  )
}
