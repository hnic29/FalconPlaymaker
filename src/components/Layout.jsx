import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext.jsx'
import TeamInfoModal from './team/TeamInfoModal.jsx'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/roster', label: 'Roster' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/stats', label: 'Stats' },
  { to: '/playbooks', label: 'Playbooks' },
]

export default function Layout() {
  const { team, updateTeam } = useAppData()
  const [showTeamModal, setShowTeamModal] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy-900 border-b-4 border-gold-500 shadow-lg">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-black tracking-tight text-gold-400">Playmaker</span>
            <span className="text-xs uppercase tracking-widest text-navy-500 bg-slate-100 rounded px-1.5 py-0.5 font-bold">
              Flag Football
            </span>
          </div>
          <nav className="flex gap-1 overflow-x-auto max-w-full -mx-1 px-1 [-webkit-overflow-scrolling:touch]">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-md text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-gold-500 text-navy-950'
                      : 'text-slate-200 hover:bg-navy-800 hover:text-gold-400'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => setShowTeamModal(true)}
            title="Team info"
            className="flex items-center gap-2 px-2.5 py-2 rounded-md border border-navy-700 hover:bg-navy-800 shrink-0"
          >
            {team.logo ? (
              <img src={team.logo} alt="" className="w-7 h-7 rounded object-contain" style={{ backgroundColor: team.color }} />
            ) : (
              <span className="w-7 h-7 rounded flex items-center justify-center text-navy-950 text-xs font-black" style={{ backgroundColor: team.color }}>
                {team.abbreviation ? team.abbreviation.slice(0, 2) : 'ⓘ'}
              </span>
            )}
            <span className="text-sm font-semibold text-slate-200 whitespace-nowrap max-w-[8rem] truncate">
              {team.name || 'Team Info'}
            </span>
          </button>
        </div>
      </header>
      <main className="flex-1 bg-navy-950">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {showTeamModal && (
        <TeamInfoModal initial={team} onSave={(data) => { updateTeam(data); setShowTeamModal(false) }} onClose={() => setShowTeamModal(false)} />
      )}
    </div>
  )
}
