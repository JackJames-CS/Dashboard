import { Outlet } from 'react-router-dom'
import TopNav from './TopNav'
import Sidebar from './Sidebar'
import RightPanel from './RightPanel'

export default function Layout({ signOut }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-100">
      <TopNav signOut={signOut} />
      <div className="flex-1 flex min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-auto min-w-0">
          <Outlet />
        </main>
        <RightPanel />
      </div>
    </div>
  )
}
