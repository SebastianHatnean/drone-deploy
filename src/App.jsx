import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import DriverMapPage from './pages/DriverMapPage'
import DriverDashboard from './pages/DriverDashboard'

/**
 * App - Root component with routing.
 * / - Admin dashboard (full fleet management)
 * /driver - Driver map (only driver's drone and ride)
 * /driver/dashboard - Driver dashboard (My Rides, stats)
 * /user - User/Client dashboard
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/driver" element={<DriverMapPage />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
