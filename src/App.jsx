import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'

/**
 * App - Root component with routing.
 * / - Admin dashboard (default, full fleet management)
 * /user - User dashboard (non-admin view)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
