import { useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext.jsx'
import StatsTable from '../components/stats/StatsTable.jsx'

const STAT_FIELDS = [
  { key: 'passYds', label: 'Pass Yds' },
  { key: 'passTD', label: 'Pass TD' },
  { key: 'recYds', label: 'Rec Yds' },
  { key: 'recTD', label: 'Rec TD' },
  { key: 'rushYds', label: 'Rush Yds' },
  { key: 'rushTD', label: 'Rush TD' },
  { key: 'flagsPulled', label: 'Flags Pulled' },
  { key: 'interceptions', label: 'INT' },
]

const emptyForm = { gameId: '', playerId: '', passYds: '', passTD: '', recYds: '', recTD: '', rushYds: '', rushTD: '', flagsPulled: '', interceptions: '' }

export default function Stats() {
  const { players, games, statLines, addStatLine, deleteStatLine } = useAppData()
  const [form, setForm] = useState(emptyForm)
  const [showAdd, setShowAdd] = useState(false)

  const record = useMemo(() => {
    let wins = 0,
      losses = 0,
      ties = 0
    games.forEach((g) => {
      if (g.type === 'game' && g.played && g.teamScore != null && g.oppScore != null) {
        if (g.teamScore > g.oppScore) wins++
        else if (g.teamScore < g.oppScore) losses++
        else ties++
      }
    })
    return { wins, losses, ties }
  }, [games])

  const leaderboard = useMemo(() => {
    return players.map((p) => {
      const lines = statLines.filter((s) => s.playerId === p.id)
      const totals = STAT_FIELDS.reduce((acc, f) => {
        acc[f.key] = lines.reduce((sum, l) => sum + (Number(l[f.key]) || 0), 0)
        return acc
      }, {})
      return { id: p.id, name: p.name, number: p.number, ...totals }
    })
  }, [players, statLines])

  const columns = [
    { key: 'name', label: 'Player', render: (r) => `#${r.number || '-'} ${r.name}` },
    ...STAT_FIELDS.map((f) => ({ key: f.key, label: f.label })),
  ]

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.gameId || !form.playerId) return
    const numericForm = { ...form }
    STAT_FIELDS.forEach((f) => {
      numericForm[f.key] = Number(form[f.key]) || 0
    })
    addStatLine(numericForm)
    setForm(emptyForm)
    setShowAdd(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-slate-100">Stats</h1>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="px-4 py-2.5 rounded bg-gold-500 text-navy-950 text-sm font-bold hover:bg-gold-400"
        >
          {showAdd ? 'Close' : '+ Log Stat Line'}
        </button>
      </div>

      <div className="mb-6 flex gap-3">
        <div className="bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-black text-gold-400">{record.wins}</p>
          <p className="text-xs uppercase text-slate-400">Wins</p>
        </div>
        <div className="bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-black text-slate-200">{record.losses}</p>
          <p className="text-xs uppercase text-slate-400">Losses</p>
        </div>
        <div className="bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-black text-slate-200">{record.ties}</p>
          <p className="text-xs uppercase text-slate-400">Ties</p>
        </div>
      </div>

      {showAdd && (
        <form
          onSubmit={handleSubmit}
          className="bg-navy-900 border border-navy-700 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gold-400 mb-1">Game</label>
            <select
              value={form.gameId}
              onChange={handleChange('gameId')}
              required
              className="w-full rounded bg-navy-950 border border-navy-700 px-2 py-3 text-slate-100 focus:outline-none focus:border-gold-500"
            >
              <option value="">Select game…</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.date} {g.type === 'game' ? `vs ${g.opponent}` : g.opponent || 'Practice'}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gold-400 mb-1">Player</label>
            <select
              value={form.playerId}
              onChange={handleChange('playerId')}
              required
              className="w-full rounded bg-navy-950 border border-navy-700 px-2 py-3 text-slate-100 focus:outline-none focus:border-gold-500"
            >
              <option value="">Select player…</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.number || '-'} {p.name}
                </option>
              ))}
            </select>
          </div>
          {STAT_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gold-400 mb-1">{f.label}</label>
              <input
                type="number"
                min="0"
                value={form[f.key]}
                onChange={handleChange(f.key)}
                className="w-full rounded bg-navy-950 border border-navy-700 px-2 py-3 text-slate-100 focus:outline-none focus:border-gold-500"
              />
            </div>
          ))}
          <div className="col-span-2 sm:col-span-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-2.5 rounded text-sm font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded bg-gold-500 text-navy-950 text-sm font-bold hover:bg-gold-400"
            >
              Save Stat Line
            </button>
          </div>
        </form>
      )}

      <h2 className="text-lg font-bold text-gold-400 mb-2">Leaderboard</h2>
      <StatsTable columns={columns} rows={leaderboard} defaultSortKey="passYds" />

      {statLines.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-slate-400 mb-2">Logged Stat Lines</h2>
          <ul className="space-y-1 text-sm text-slate-300">
            {statLines.map((sl) => {
              const player = players.find((p) => p.id === sl.playerId)
              const game = games.find((g) => g.id === sl.gameId)
              return (
                <li
                  key={sl.id}
                  className="flex items-center justify-between bg-navy-900 border border-navy-700 rounded px-3 py-1.5"
                >
                  <span>
                    {player ? player.name : 'Unknown player'} — {game ? game.date : 'Unknown game'}
                  </span>
                  <button
                    onClick={() => deleteStatLine(sl.id)}
                    className="text-xs font-semibold text-slate-400 hover:text-red-400 px-2.5 py-2"
                  >
                    Delete
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
