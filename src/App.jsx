import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'

/**
 * App - Root component with routing.
 * /admin - Admin dashboard (full fleet management)
 * / - User dashboard (non-admin view)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<UserDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
