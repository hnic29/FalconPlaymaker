import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext.jsx'

export default function Dashboard() {
  const { players, games } = useAppData()

  const today = new Date().toISOString().slice(0, 10)
  const nextGame = [...games]
    .filter((g) => g.type === 'game' && g.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  const record = games.reduce(
    (acc, g) => {
      if (g.type === 'game' && g.played && g.teamScore != null && g.oppScore != null) {
        if (g.teamScore > g.oppScore) acc.wins++
        else if (g.teamScore < g.oppScore) acc.losses++
        else acc.ties++
      }
      return acc
    },
    { wins: 0, losses: 0, ties: 0 },
  )

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-100 mb-6">Team Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          to="/roster"
          className="bg-navy-900 border border-navy-700 rounded-lg p-5 hover:border-gold-500 transition-colors"
        >
          <p className="text-3xl font-black text-gold-400">{players.length}</p>
          <p className="text-sm text-slate-300 mt-1">Players on Roster</p>
        </Link>
        <Link
          to="/stats"
          className="bg-navy-900 border border-navy-700 rounded-lg p-5 hover:border-gold-500 transition-colors"
        >
          <p className="text-3xl font-black text-gold-400">
            {record.wins}-{record.losses}
            {record.ties ? `-${record.ties}` : ''}
          </p>
          <p className="text-sm text-slate-300 mt-1">Season Record</p>
        </Link>
        <Link
          to="/schedule"
          className="bg-navy-900 border border-navy-700 rounded-lg p-5 hover:border-gold-500 transition-colors"
        >
          {nextGame ? (
            <>
              <p className="text-lg font-black text-gold-400">vs {nextGame.opponent}</p>
              <p className="text-sm text-slate-300 mt-1">
                {nextGame.date} {nextGame.time && `· ${nextGame.time}`}
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-black text-gold-400">No game scheduled</p>
              <p className="text-sm text-slate-300 mt-1">Add one to the schedule</p>
            </>
          )}
        </Link>
      </div>

      <div className="bg-navy-900 border border-navy-700 rounded-lg p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Ready to install a new play?</h2>
          <p className="text-sm text-slate-400 mt-1">
            Draw routes on the field and animate them to walk your team through it.
          </p>
        </div>
        <Link
          to="/play-designer"
          className="px-4 py-2 rounded bg-gold-500 text-navy-950 text-sm font-bold hover:bg-gold-400 whitespace-nowrap"
        >
          Open Play Designer
        </Link>
      </div>
    </div>
  )
}
