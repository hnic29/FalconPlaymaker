import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Roster from './pages/Roster.jsx'
import Schedule from './pages/Schedule.jsx'
import Stats from './pages/Stats.jsx'
import PlayDesigner from './pages/PlayDesigner.jsx'
import Playbooks from './pages/Playbooks.jsx'
import PlaybookLibrary from './pages/PlaybookLibrary.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="roster" element={<Roster />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="stats" element={<Stats />} />
        <Route path="playbooks" element={<Playbooks />} />
        <Route path="playbooks/:playbookId" element={<PlaybookLibrary />} />
        <Route path="playbooks/:playbookId/plays/:playId" element={<PlayDesigner />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
