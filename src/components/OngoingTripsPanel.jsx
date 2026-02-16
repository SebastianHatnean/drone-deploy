import { useState, useRef } from 'react'
import Draggable from 'react-draggable'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'

/**
 * OngoingTripsPanel - Collapsible panel listing delivering drones with route info and progress.
 */
export default function OngoingTripsPanel({
  deliveringDrones = [],
  progressMap = {},
  onFocusDrone,
  showPanel = true
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const nodeRef = useRef(null)

  if (deliveringDrones.length === 0) return null

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".ongoing-trips-drag-handle"
      cancel="button"
      defaultPosition={{ x: 0, y: 0 }}
      bounds={false}
      position={undefined}
    >
      <div ref={nodeRef} className={`ongoing-trips-panel ${showPanel ? 'visible' : ''}`}>
        <div className="ongoing-trips-header">
          <div className="ongoing-trips-drag-handle modal-drag-handle" aria-label="Drag to move">
            <GripVertical size={18} />
            <h2 className="ongoing-trips-title">ONGOING TRIPS</h2>
          </div>
          <button
            type="button"
            className="ongoing-trips-toggle"
            onClick={() => setIsExpanded((e) => !e)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronUp className="ongoing-trips-chevron" />
            ) : (
              <ChevronDown className="ongoing-trips-chevron" />
            )}
          </button>
        </div>

      {isExpanded && (
        <div className="ongoing-trips-list-wrapper">
          <div className="ongoing-trips-list">
            {deliveringDrones.map((drone) => {
            const progress = progressMap[drone.id] ?? 0
            const origin = drone.tripOrigin?.name ?? 'Origin'
            const destination = drone.tripDestination?.name ?? 'Destination'

            return (
              <button
                key={drone.id}
                type="button"
                className="ongoing-trip-item"
                onClick={() => onFocusDrone?.(drone.id)}
              >
                <div className="ongoing-trip-header">
                  <span className="ongoing-trip-name">{drone.name}</span>
                  {drone.eta && (
                    <span className="ongoing-trip-eta">{drone.eta} ETA</span>
                  )}
                </div>
                <div className="ongoing-trip-route">
                  {origin} → {destination}
                </div>
                <div className="ongoing-trip-progress">
                  <div
                    className="ongoing-trip-progress-fill"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </button>
            )
          })}
          </div>
        </div>
      )}
      </div>
    </Draggable>
  )
}
