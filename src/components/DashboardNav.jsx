import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

/**
 * DashboardNav - Route switcher for Admin and User dashboards.
 * Shows active state for the current route.
 */
export default function DashboardNav() {
  return (
    <nav className="dashboard-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          cn('dashboard-nav-link', isActive && 'dashboard-nav-link-active')
        }
      >
        Admin
      </NavLink>
      <NavLink
        to="/user"
        className={({ isActive }) =>
          cn('dashboard-nav-link', isActive && 'dashboard-nav-link-active')
        }
      >
        User
      </NavLink>
    </nav>
  )
}
