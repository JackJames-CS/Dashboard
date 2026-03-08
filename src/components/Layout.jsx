import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import TopNav from './TopNav'
import Sidebar from './Sidebar'
import RightPanel from './RightPanel'

export default function Layout({ signOut }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-surface-100">
      <TopNav signOut={signOut} onMenuToggle={() => setSidebarOpen(o => !o)} />
      <div className="flex-1 flex min-h-0">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-14 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto min-w-0">
          <Outlet />
        </main>
        <RightPanel />
      </div>
    </div>
  )
}
