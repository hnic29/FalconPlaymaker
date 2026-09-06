import { useState } from 'react'
import { useAppData } from '../context/AppDataContext.jsx'
import GameForm from '../components/schedule/GameForm.jsx'
import GameCard from '../components/schedule/GameCard.jsx'

export default function Schedule() {
  const { games, addGame, updateGame, deleteGame } = useAppData()
  const [editingId, setEditingId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const sorted = [...games].sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
  const upcoming = sorted.filter((g) => g.date >= today)
  const past = sorted.filter((g) => g.date < today).reverse()

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-slate-100">Schedule</h1>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="px-4 py-2.5 rounded bg-gold-500 text-navy-950 text-sm font-bold hover:bg-gold-400"
        >
          {showAdd ? 'Close' : '+ Add to Schedule'}
        </button>
      </div>

      {showAdd && (
        <div className="mb-6">
          <GameForm
            onSubmit={(g) => {
              addGame(g)
              setShowAdd(false)
            }}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-bold text-gold-400 mb-2">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="text-slate-400 text-sm">Nothing scheduled yet.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((g) =>
              editingId === g.id ? (
                <GameForm
                  key={g.id}
                  initial={g}
                  onSubmit={(patch) => {
                    updateGame(g.id, patch)
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <GameCard key={g.id} game={g} onEdit={() => setEditingId(g.id)} onDelete={() => deleteGame(g.id)} />
              ),
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-400 mb-2">Past</h2>
        {past.length === 0 ? (
          <p className="text-slate-400 text-sm">No past games or practices yet.</p>
        ) : (
          <div className="space-y-2">
            {past.map((g) =>
              editingId === g.id ? (
                <GameForm
                  key={g.id}
                  initial={g}
                  onSubmit={(patch) => {
                    updateGame(g.id, patch)
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <GameCard key={g.id} game={g} onEdit={() => setEditingId(g.id)} onDelete={() => deleteGame(g.id)} />
              ),
            )}
          </div>
        )}
      </section>
    </div>
  )
}
