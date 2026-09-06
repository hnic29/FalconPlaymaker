import { useState } from 'react'
import { useAppData } from '../context/AppDataContext.jsx'
import PlayerForm from '../components/roster/PlayerForm.jsx'
import PlayerCard from '../components/roster/PlayerCard.jsx'

export default function Roster() {
  const { players, addPlayer, updatePlayer, deletePlayer } = useAppData()
  const [editingId, setEditingId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-slate-100">
          Roster <span className="text-gold-400">({players.length})</span>
        </h1>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="px-4 py-2 rounded bg-gold-500 text-navy-950 text-sm font-bold hover:bg-gold-400"
        >
          {showAdd ? 'Close' : '+ Add Player'}
        </button>
      </div>

      {showAdd && (
        <div className="mb-4">
          <PlayerForm
            onSubmit={(p) => {
              addPlayer(p)
              setShowAdd(false)
            }}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}

      {players.length === 0 ? (
        <p className="text-slate-400">No players yet. Add your first player to get started.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {players.map((p) =>
            editingId === p.id ? (
              <div key={p.id} className="sm:col-span-2 lg:col-span-3">
                <PlayerForm
                  initial={p}
                  onSubmit={(patch) => {
                    updatePlayer(p.id, patch)
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <PlayerCard
                key={p.id}
                player={p}
                onEdit={() => setEditingId(p.id)}
                onDelete={() => deletePlayer(p.id)}
              />
            ),
          )}
        </div>
      )}
    </div>
  )
}
