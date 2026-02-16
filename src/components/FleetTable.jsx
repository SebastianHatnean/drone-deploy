import { useState, useMemo, useRef } from 'react'
import Draggable from 'react-draggable'
import { GripVertical } from 'lucide-react'
import { getMarkerColor } from '../utils/droneHelpers'

/**
 * Get display status for table
 * @param {Object} drone - Drone object
 * @returns {Object} { text, color }
 */
function getTableStatus(drone) {
  if (drone.battery < 25) {
    return { text: 'LOW BAT', color: '#FF9F3D' }
  }
  if (drone.status === 'delivering') {
    return { text: 'ACTIVE', color: '#3DA9FF' }
  }
  return { text: 'READY', color: '#10B981' }
}

export default function FleetTable({ 
  drones, 
  allDrones,
  selectedDrone, 
  onDroneSelect, 
  onDroneHover,
  showTable = true,
  categoryFilter = { active: true, ready: true, lowBat: true },
  onCategoryToggle,
  criticalBatteryFilter = false,
  onCriticalBatteryFilterChange
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hoverTimeoutRef = useRef(null)
  const nodeRef = useRef(null)

  const handleMouseEnter = (droneId) => {
    hoverTimeoutRef.current = setTimeout(() => {
      onDroneHover(droneId)
    }, 400)
  }

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current)
    onDroneHover(null)
  }

  const dronesForCounts = allDrones ?? drones

  // Categorize and count drones (use full fleet for counts)
  const counts = useMemo(() => {
    return dronesForCounts.reduce((acc, drone) => {
      if (drone.battery < 25) {
        acc.lowBat++
      } else if (drone.status === 'delivering') {
        acc.active++
      } else {
        acc.ready++
      }
      return acc
    }, { active: 0, ready: 0, lowBat: 0 })
  }, [dronesForCounts])

  // Sort: Active first, then Low Bat, then Ready
  const sortedDrones = useMemo(() => {
    return [...drones].sort((a, b) => {
      const getOrder = (drone) => {
        if (drone.status === 'delivering' && drone.battery >= 25) return 0 // Active
        if (drone.battery < 25) return 1 // Low Bat
        return 2 // Ready
      }
      return getOrder(a) - getOrder(b)
    })
  }, [drones])

  // Always render all drones - let CSS max-height handle visibility for smooth animations
  const visibleDrones = sortedDrones

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".fleet-table-drag-handle"
      cancel="button, input, a, [role='button']"
      defaultPosition={{ x: 0, y: 0 }}
      bounds={false}
      position={undefined}
    >
      <div ref={nodeRef} className={`fleet-table ${showTable ? 'visible' : ''} ${criticalBatteryFilter ? 'critical-battery-mode' : ''}`}>
        <div className="fleet-table-drag-handle modal-drag-handle" aria-label="Drag to move">
          <GripVertical size={18} />
          <h2 className="fleet-table-title">FLEET OVERVIEW</h2>
        </div>

      {/* Critical Battery Filter Toggle */}
      <button
        type="button"
        className={`fleet-filter-toggle ${criticalBatteryFilter ? 'active' : ''}`}
        onClick={() => onCriticalBatteryFilterChange?.(!criticalBatteryFilter)}
        aria-pressed={criticalBatteryFilter}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="filter-icon">
          <rect x="2" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M18 10H19C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14H18" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>Critical Battery (&lt;20%)</span>
        {criticalBatteryFilter && (
          <span className="filter-badge" aria-hidden>ON</span>
        )}
      </button>

      {/* Status Cards - clickable filters */}
      <div className="fleet-status-cards">
        <button
          type="button"
          className={`status-card status-card-active ${!categoryFilter.active ? 'status-card--inactive' : ''}`}
          onClick={() => onCategoryToggle?.('active')}
          aria-pressed={categoryFilter.active}
          title={categoryFilter.active ? 'Hide ACTIVE drones' : 'Show ACTIVE drones'}
        >
          <div className="status-card-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>ACTIVE</span>
          </div>
          <div className="status-card-count">
            {String(counts.active).padStart(2, '0')}
          </div>
        </button>

        <button
          type="button"
          className={`status-card status-card-ready ${!categoryFilter.ready ? 'status-card--inactive' : ''}`}
          onClick={() => onCategoryToggle?.('ready')}
          aria-pressed={categoryFilter.ready}
          title={categoryFilter.ready ? 'Hide READY drones' : 'Show READY drones'}
        >
          <div className="status-card-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>READY</span>
          </div>
          <div className="status-card-count">
            {String(counts.ready).padStart(2, '0')}
          </div>
        </button>

        <button
          type="button"
          className={`status-card status-card-lowbat ${!categoryFilter.lowBat ? 'status-card--inactive' : ''}`}
          onClick={() => onCategoryToggle?.('lowBat')}
          aria-pressed={categoryFilter.lowBat}
          title={categoryFilter.lowBat ? 'Hide LOW BAT drones' : 'Show LOW BAT drones'}
        >
          <div className="status-card-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M18 10H19C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14H18" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>LOW BAT</span>
          </div>
          <div className="status-card-count">
            {String(counts.lowBat).padStart(2, '0')}
          </div>
        </button>
      </div>

      {/* Table */}
      <div className={`fleet-table-wrapper ${isExpanded ? 'expanded' : ''}`}>
        <table className="fleet-drone-table">
          <thead>
            <tr>
              <th>MODEL</th>
              <th>STATUS</th>
              <th>BAT</th>
              <th>ETA</th>
            </tr>
          </thead>
          <tbody>
            {visibleDrones.map((drone) => {
              const status = getTableStatus(drone)
              const isSelected = drone.id === selectedDrone
              
              return (
                <tr
                  key={drone.id}
                  className={isSelected ? 'selected' : ''}
                  onClick={() => onDroneSelect(drone.id)}
                  onMouseEnter={() => handleMouseEnter(drone.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <td className="model-cell">
                    <span className="model-cell-content">
                      <span 
                        className="status-dot-table" 
                        style={{ backgroundColor: getMarkerColor(drone) }}
                      />
                      {drone.name}
                    </span>
                  </td>
                  <td>{status.text}</td>
                  <td className="battery-cell">
                    <span className="battery-cell-content">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="battery-icon-small">
                        <rect x="2" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M18 10H19C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14H18" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      {drone.battery}%
                    </span>
                  </td>
                  <td>{drone.eta || 'N/A'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {/* Fade-out gradient overlay (only visible when collapsed) */}
        {!isExpanded && (
          <div className="fleet-table-fade" />
        )}
      </div>

      {/* Expand/Collapse Button */}
      <button 
        className="fleet-table-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'COLLAPSE' : 'VIEW ALL'}
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none"
          className={isExpanded ? 'rotated' : ''}
        >
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      </div>
    </Draggable>
  )
}