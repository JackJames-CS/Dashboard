import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import School from './pages/School'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="school" element={<School />} />
        <Route path="work" element={<Placeholder title="Work" subtitle="Shifts, income & schedule." />} />
        <Route path="projects" element={<Projects />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="finances" element={<Placeholder title="Finances" subtitle="Spending, income & bills." />} />
        <Route path="notes" element={<Placeholder title="Notes" subtitle="Quick notes & docs." />} />
        <Route path="ai-agents" element={<Placeholder title="AI Agents" subtitle="Configure AI assistants." />} />
        <Route path="automation" element={<Placeholder title="Automation" subtitle="Workflows & triggers." />} />
        <Route path="settings" element={<Placeholder title="Settings" subtitle="Preferences & account." />} />
      </Route>
    </Routes>
  )
}
