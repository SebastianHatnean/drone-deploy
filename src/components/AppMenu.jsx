import { NavLink } from 'react-router-dom'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  MenubarCheckboxItem,
} from '@/components/ui/menubar'
import { MapPin, FileText, Eye, HelpCircle, LayoutDashboard, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * AppMenu - Top application menu bar (shadcn menubar).
 */
export default function AppMenu({
  cities = [],
  activeCityId,
  onCityChange,
  onResetBatteries,
  criticalBatteryFilter,
  onCriticalBatteryFilterChange,
}) {
  return (
    <Menubar className="app-menubar">
      <MenubarMenu>
        <MenubarTrigger className="gap-2">
          <FileText className="size-4" />
          File
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => window.location.reload()}>
            Refresh
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={() => onResetBatteries?.()}>
            Reset batteries
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="gap-2">
          <MapPin className="size-4" />
          City
        </MenubarTrigger>
        <MenubarContent>
          {cities.map((city) => {
            const isSelected = activeCityId === city.id
            return (
              <MenubarItem
                key={city.id}
                onClick={() => onCityChange?.(city.id)}
              >
                <span className={cn('flex size-4 items-center justify-center shrink-0', !isSelected && 'invisible')}>
                  <Check className="size-3 text-muted-foreground" />
                </span>
                {city.name}
              </MenubarItem>
            )
          })}
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="gap-2">
          <Eye className="size-4" />
          View
        </MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem
            checked={criticalBatteryFilter}
            onCheckedChange={(checked) => onCriticalBatteryFilterChange?.(!!checked)}
          >
            Critical battery only
          </MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="gap-2">
          <LayoutDashboard className="size-4" />
          Dashboard
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem asChild>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn('block w-full', isActive && 'menubar-item-active')
              }
            >
              Admin
            </NavLink>
          </MenubarItem>
          <MenubarItem asChild>
            <NavLink
              to="/user"
              className={({ isActive }) =>
                cn('block w-full', isActive && 'menubar-item-active')
              }
            >
              User
            </NavLink>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="gap-2">
          <HelpCircle className="size-4" />
          Help
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem
            onClick={() => alert('Drone Fleet Dashboard\nManage and monitor your drone fleet.')}
          >
            About
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
