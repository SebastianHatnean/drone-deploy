import { forwardRef } from 'react'
import Map, { Marker, Popup } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getMarkerColor } from '../utils/droneHelpers'
import DronePopup from './DronePopup'

/**
 * DroneMap - Mapbox map displaying drone markers with hover popups.
 *
 * @param {Object} props
 * @param {Array} props.drones - List of drone objects to display as markers
 * @param {Object} props.viewState - { longitude, latitude, zoom } for map position
 * @param {function(Object): void} props.onMove - Called when map moves, receives evt.viewState
 * @param {function(): void} props.onLoad - Called when map finishes loading
 * @param {string|null} props.selectedDroneId - ID of currently selected drone (for highlight)
 * @param {Object|null} props.hoveredDrone - Drone object being hovered (for popup)
 * @param {function(string): void} props.onDroneSelect - Called when marker clicked, receives drone ID
 * @param {function(Object|null): void} props.onDroneHover - Called when hovering marker, receives drone or null
 * @param {string} [props.mapStyle] - Mapbox style URL
 * @param {string} [props.mapboxToken] - Mapbox access token (env var)
 */
const DroneMap = forwardRef(function DroneMap(
  {
    drones,
    viewState,
    onMove,
    onLoad,
    selectedDroneId,
    hoveredDrone,
    onDroneSelect,
    onDroneHover,
    mapStyle = 'mapbox://styles/mapbox/dark-v11',
    mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
  },
  ref
) {
  return (
    <div className="map-container">
      <Map
        ref={ref}
        {...viewState}
        onMove={(evt) => onMove(evt.viewState)}
        onLoad={onLoad}
        mapStyle={mapStyle}
        mapboxAccessToken={mapboxToken}
      >
        {drones.map((drone) => {
          const isSelected = selectedDroneId === drone.id
          const markerColor = getMarkerColor(drone)

          return (
            <Marker
              key={drone.id}
              longitude={drone.coordinates.lng}
              latitude={drone.coordinates.lat}
            >
              <div
                className={`marker ${isSelected ? 'radar-effect' : ''}`}
                style={{ backgroundColor: markerColor, color: markerColor }}
                onClick={(e) => {
                  e.stopPropagation()
                  onDroneSelect(drone.id)
                }}
                onMouseEnter={() => onDroneHover(drone)}
                onMouseLeave={() => onDroneHover(null)}
                title={`${drone.name} - ${drone.id}`}
              />
            </Marker>
          )
        })}

        {/* Hover popup - only show when not the selected drone */}
        {hoveredDrone && hoveredDrone.id !== selectedDroneId && (
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
  )
})

export default DroneMap
