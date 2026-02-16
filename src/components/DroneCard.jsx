import { useEffect, useState, useRef } from 'react'
import Draggable from 'react-draggable'
import { GripVertical } from 'lucide-react'
import { getStatusDisplay, getDroneCapacity, getDroneDescription, generateMockHistory } from '../utils/droneHelpers'
import { getDroneImage } from '../utils/droneImages'
import ChargingState from './ChargingState'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

function DroneCard({ drone, onClose, onBatteryUpdate }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [chargeView, setChargeView] = useState('confirm') // 'confirm' | 'charging'
  const nodeRef = useRef(null)

  const handleOpenChange = (open) => {
    setIsDialogOpen(open)
    if (!open) setChargeView('confirm')
  }

  const handleStartCharging = () => {
    setChargeView('charging')
  }
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/8e58a966-9876-4f24-bc09-47b74c79ad18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DroneCard.jsx:mount',message:'DroneCard mounted',data:{droneId:drone?.id,droneName:drone?.name},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D',runId:'post-fix'})}).catch(()=>{});
    return () => {
      fetch('http://127.0.0.1:7243/ingest/8e58a966-9876-4f24-bc09-47b74c79ad18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DroneCard.jsx:unmount',message:'DroneCard unmounting',data:{droneId:drone?.id,droneName:drone?.name},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D',runId:'post-fix'})}).catch(()=>{});
    };
  }, []);
  // #endregion

  if (!drone) return null

  const statusInfo = getStatusDisplay(drone)
  const capacity = getDroneCapacity(drone.name)
  const description = getDroneDescription(drone.name)
  const recentFlights = generateMockHistory(drone.id)

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/8e58a966-9876-4f24-bc09-47b74c79ad18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DroneCard.jsx:render',message:'DroneCard rendering',data:{droneId:drone?.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B',runId:'post-fix'})}).catch(()=>{});
  // #endregion

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drone-card-drag-handle"
      cancel="button, [role='dialog']"
      defaultPosition={{ x: 0, y: 0 }}
      bounds={false}
      position={undefined}
    >
      <div ref={nodeRef} className="drone-card">
      {/* Header with drag handle, status badge and close button */}
      <div className="drone-card-header">
        <div className="drone-card-drag-handle modal-drag-handle" aria-label="Drag to move">
          <GripVertical size={18} />
          <div className="drone-card-status" style={{ '--status-color': statusInfo.color }}>
            <span className="status-dot"></span>
            <span className="status-text">{statusInfo.text}</span>
          </div>
        </div>
        <button 
          className="drone-card-close" 
          onClick={onClose}
          aria-label="Close drone details"
        >
          ×
        </button>
      </div>

      {/* Drone Image */}
      <div className="drone-card-image">
        <img 
          src={getDroneImage(drone.model ?? drone.name)} 
          alt={drone.name}
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      </div>

      {/* Title Section */}
      <div className="drone-card-title">
        <h2 className="drone-name">{drone.name}</h2>
        <p className="drone-subtitle">Light Utility Civilian Helicopter</p>
      </div>

      {/* Stats Grid */}
      <div className="drone-card-stats">
        {/* Battery Stat */}
        <div className="stat-card">
          <div className="stat-icon battery-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="7" width="15" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M18 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H18" stroke="currentColor" strokeWidth="2"/>
              <rect x="6" y="9" width="9" height="6" fill="currentColor"/>
            </svg>
          </div>
          <div className="stat-card-content">
            <div className="stat-value">{drone.battery}%</div>
            <div className="stat-label">Charge</div>
          </div>
        </div>

        {/* Range Stat */}
        <div className="stat-card">
          <div className="stat-icon range-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 12L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
            </svg>
          </div>
          <div className="stat-card-content">
            <div className="stat-value">{drone.range} km</div>
            <div className="stat-label">Range</div>
          </div>
        </div>

        {/* Capacity Stat */}
        <div className="stat-card">
          <div className="stat-icon capacity-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M4 20V18C4 15.7909 5.79086 14 8 14H10C12.2091 14 14 15.7909 14 18V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="17" cy="7" r="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 20V18.5C20 17.1193 18.8807 16 17.5 16H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-card-content">
            <div className="stat-value">{capacity}</div>
            <div className="stat-label">Capacity</div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="drone-card-description">{description}</p>

      {/* Recent Flights */}
      <div className="drone-card-flights">
        <h3 className="drone-card-flights-title">Recent Flights</h3>
        <ul className="drone-card-flights-list">
          {recentFlights.map((flight, i) => (
            <li key={i} className="flight-item">
              <div className="flight-header">
                <span className="flight-time">{flight.time}</span>
                <span className={`flight-status flight-status-${flight.status.toLowerCase()}`}>
                  {flight.status}
                </span>
              </div>
              <div className="flight-route">
                {flight.from} → {flight.to}
              </div>
              <div className="flight-duration">{flight.duration}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button className="drone-card-button" disabled={drone.battery >= 100}>
            Charge now
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </DialogTrigger>
        {chargeView === 'confirm' ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Charge {drone.name}</DialogTitle>
              <DialogDescription>
                Start charging {drone.name}? Current battery level is {drone.battery}%.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button className="drone-card-button" type="button" onClick={handleStartCharging}>
                Start charging
              </button>
            </DialogFooter>
          </DialogContent>
        ) : (
          <ChargingState drone={drone} onBatteryComplete={onBatteryUpdate} />
        )}
      </Dialog>
      </div>
    </Draggable>
  )
}

export default DroneCard