import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

/**
 * ModeSwitcher - Admin / Driver / User radio-style switch in the top menu bar.
 * Always visible on the right side of the header.
 */
export default function ModeSwitcher() {
  return (
    <nav className="mode-switcher" aria-label="View mode">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          cn('mode-switcher-option', isActive && 'mode-switcher-option-active')
        }
      >
        Admin
      </NavLink>
      <NavLink
        to="/driver"
        className={({ isActive }) =>
          cn('mode-switcher-option', isActive && 'mode-switcher-option-active')
        }
      >
        Driver
      </NavLink>
      <NavLink
        to="/user"
        className={({ isActive }) =>
          cn('mode-switcher-option', isActive && 'mode-switcher-option-active')
        }
      >
        User
      </NavLink>
    </nav>
  )
}
