import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Users, MapPin, Clock, CheckCircle } from 'lucide-react'
import ModeSwitcher from '../components/ModeSwitcher'
import { getCompletedRides, getTodayCompletedRides } from '../utils/driverRideStorage'

/**
 * DriverDashboard - Simple dashboard for drone taxi drivers.
 * Shows assigned rides, completed rides from localStorage, and summary.
 */
export default function DriverDashboard() {
  const [completedRides, setCompletedRides] = useState(getCompletedRides())
  const todayRides = getTodayCompletedRides()

  useEffect(() => {
    const handler = () => setCompletedRides(getCompletedRides())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return (
    <>
      <header className="app-header app-header-driver">
        <div className="driver-header-content">
          <h1 className="driver-header-title">Driver Dashboard</h1>
          <nav className="driver-nav">
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

      <div className="driver-dashboard">
        <section className="driver-section">
          <h2 className="driver-section-title">
            <Users size={20} />
            My Rides
          </h2>
          <div className="driver-card driver-card-empty">
            <p>No active rides assigned.</p>
            <p className="driver-card-hint">Rides will appear here when assigned.</p>
          </div>
        </section>

        <section className="driver-section">
          <h2 className="driver-section-title">
            <CheckCircle size={20} />
            Completed Rides
          </h2>
          {completedRides.length === 0 ? (
            <div className="driver-card driver-card-empty">
              <p>No completed rides yet.</p>
              <p className="driver-card-hint">Completed rides will appear here after you finish a trip.</p>
            </div>
          ) : (
            <div className="driver-completed-rides">
              {completedRides.map((ride) => (
                <div key={ride.id} className="driver-completed-ride-card">
                  <div className="driver-completed-ride-route">
                    <span className="driver-ride-origin">{ride.origin}</span>
                    <span className="driver-ride-arrow">→</span>
                    <span className="driver-ride-dest">{ride.destination}</span>
                  </div>
                  <div className="driver-completed-ride-meta">
                    <span>{ride.passengers} passenger{ride.passengers !== 1 ? 's' : ''}</span>
                    <span>{ride.droneName}</span>
                    <span className="driver-completed-ride-time">
                      {new Date(ride.completedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="driver-section">
          <h2 className="driver-section-title">
            <MapPin size={20} />
            Current Location
          </h2>
          <div className="driver-card">
            <p className="driver-card-label">Status</p>
            <p className="driver-card-value">Standby</p>
          </div>
        </section>

        <section className="driver-section">
          <h2 className="driver-section-title">
            <Clock size={20} />
            Today&apos;s Summary
          </h2>
          <div className="driver-card driver-card-stats">
            <div className="driver-stat">
              <span className="driver-stat-value">{todayRides.length}</span>
              <span className="driver-stat-label">Completed</span>
            </div>
            <div className="driver-stat">
              <span className="driver-stat-value">0</span>
              <span className="driver-stat-label">In Progress</span>
            </div>
            <div className="driver-stat">
              <span className="driver-stat-value">0</span>
              <span className="driver-stat-label">Pending</span>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
