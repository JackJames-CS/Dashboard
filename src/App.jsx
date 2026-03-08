import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import School from './pages/School'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Placeholder from './pages/Placeholder'
import Work from './pages/Work'
import Finances from './pages/Finances'
import Login from './pages/Login'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const { session, signIn, signOut, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-accent-indigo border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <Login signIn={signIn} />
  }

  return (
    <Routes>
      <Route path="/" element={<Layout signOut={signOut} />}>
        <Route index element={<Dashboard />} />
        <Route path="school" element={<School />} />
        <Route path="work" element={<Work />} />
        <Route path="projects" element={<Projects />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="finances" element={<Finances />} />
        <Route path="notes" element={<Placeholder title="Notes" subtitle="Quick notes & docs." />} />
        <Route path="automation" element={<Placeholder title="Automation" subtitle="Workflows & triggers." />} />
        <Route path="settings" element={<Placeholder title="Settings" subtitle="Preferences & account." />} />
      </Route>
    </Routes>
  )
}
