import { useEffect } from 'react'
import { getStatusDisplay, getDroneCapacity, getDroneDescription } from '../utils/droneHelpers'
import skyrunnerX1 from '../assets/skyrunnerX1.png'
import skyrunnerX2 from '../assets/skyrunnerX2.png'
import skyrunnerX1Taxi1 from '../assets/taxi-drone-1.png'
import skyrunnerX1Taxi2 from '../assets/taxi-drone-2.png'
import droneMockup from '../assets/drone-mockup.png'

const droneImages = {
  'Skyrunner X1': skyrunnerX1,
  'Skyrunner X2': skyrunnerX2,
  'Skyrunner X1 Taxi 1': skyrunnerX1Taxi1,
  'Skyrunner X1 Taxi 2': skyrunnerX1Taxi2,
}

function DroneCard({ drone, onClose }) {
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

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/8e58a966-9876-4f24-bc09-47b74c79ad18',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DroneCard.jsx:render',message:'DroneCard rendering',data:{droneId:drone?.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B',runId:'post-fix'})}).catch(()=>{});
  // #endregion

  return (
    <div className="drone-card">
      {/* Header with status badge and close button */}
      <div className="drone-card-header">
        <div className="drone-card-status" style={{ '--status-color': statusInfo.color }}>
          <span className="status-dot"></span>
          <span className="status-text">{statusInfo.text}</span>
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
          src={droneImages[drone.name] || droneMockup} 
          alt={drone.name}
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      </div>

      {/* Title Section */}
      <div className="drone-card-title">
        <h2 className="drone-name">Volta {drone.name}</h2>
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

      {/* Action Button */}
      <button className="drone-card-button">
        Charge now
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}

export default DroneCard