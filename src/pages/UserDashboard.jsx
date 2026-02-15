import DashboardNav from '../components/DashboardNav'

/**
 * UserDashboard - View for non-admin users.
 * Placeholder - will be implemented with a different setup.
 */
export default function UserDashboard() {
  return (
    <>
      <header className="app-header app-header-user">
        <DashboardNav />
      </header>
      <div className="user-dashboard">
        <h1>User Dashboard</h1>
        <p>Non-admin view coming soon.</p>
      </div>
    </>
  )
}
