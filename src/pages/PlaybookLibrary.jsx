import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext.jsx'
import PlayThumbnail from '../components/playbooks/PlayThumbnail.jsx'
import NewPlayModal from '../components/playbooks/NewPlayModal.jsx'

const SIDES = [
  { key: 'offense', label: 'Offense' },
  { key: 'defense', label: 'Defense' },
  { key: 'specialTeams', label: 'Special Teams' },
]

export default function PlaybookLibrary() {
  const { playbookId } = useParams()
  const navigate = useNavigate()
  const { playbooks, updatePlaybook, plays: allPlays, savePlay, deletePlay } = useAppData()
  const playbook = playbooks.find((pb) => pb.id === playbookId)

  const [side, setSide] = useState('offense')
  const [formationFilter, setFormationFilter] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [editingPlay, setEditingPlay] = useState(null)
  const [newFormationInput, setNewFormationInput] = useState('')
  const [newCategoryInput, setNewCategoryInput] = useState('')

  if (!playbook) {
    return (
      <div>
        <p className="text-sm text-slate-400">Playbook not found.</p>
        <Link to="/playbooks" className="text-sm text-gold-400 hover:underline">
          ← Back to Playbooks
        </Link>
      </div>
    )
  }

  const formations = playbook.formations || []
  const categories = playbook.categories || []
  const sidePlays = allPlays.filter((p) => p.playbookId === playbookId && (p.side || 'offense') === side)
  const visiblePlays = sidePlays.filter(
    (p) => (!formationFilter || p.formation === formationFilter) && (!categoryFilter || (p.categories || []).includes(categoryFilter)),
  )

  const addFormation = () => {
    const trimmed = newFormationInput.trim()
    if (!trimmed || formations.includes(trimmed)) return
    updatePlaybook(playbookId, { formations: [...formations, trimmed] })
    setNewFormationInput('')
  }

  const addCategory = () => {
    const trimmed = newCategoryInput.trim()
    if (!trimmed || categories.includes(trimmed)) return
    updatePlaybook(playbookId, { categories: [...categories, trimmed] })
    setNewCategoryInput('')
  }

  const handleCreatePlay = (data, newFormations, newCategories) => {
    if (newFormations.length !== formations.length) updatePlaybook(playbookId, { formations: newFormations })
    if (newCategories.length !== categories.length) updatePlaybook(playbookId, { categories: newCategories })
    const id = savePlay({ playbookId, side, players: [], ball: null, ...data })
    setShowNewModal(false)
    navigate(`/playbooks/${playbookId}/plays/${id}`)
  }

  const handleEditPlayMeta = (data, newFormations, newCategories) => {
    if (newFormations.length !== formations.length) updatePlaybook(playbookId, { formations: newFormations })
    if (newCategories.length !== categories.length) updatePlaybook(playbookId, { categories: newCategories })
    savePlay({ ...editingPlay, ...data })
    setEditingPlay(null)
  }

  const handleDeletePlay = (play) => {
    if (window.confirm(`Delete "${play.name}"? This can't be undone.`)) deletePlay(play.id)
  }

  return (
    <div>
      <Link to="/playbooks" className="text-xs font-semibold text-slate-400 hover:text-gold-400">
        ← Playbooks
      </Link>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-2xl font-black text-slate-100">{playbook.name}</h1>
        <div className="flex rounded border border-navy-700 overflow-hidden">
          {SIDES.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setSide(s.key)
                setFormationFilter(null)
                setCategoryFilter(null)
              }}
              className={`px-3 py-1.5 text-sm font-bold ${
                side === s.key ? 'bg-gold-500 text-navy-950' : 'bg-navy-900 text-slate-300 hover:bg-navy-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        <div className="space-y-4">
          <div className="bg-navy-900 border border-navy-700 rounded-lg p-3">
            <p className="text-xs font-bold text-gold-400 uppercase mb-2">Formations</p>
            {formations.length === 0 && <p className="text-xs text-slate-500 mb-2">None yet.</p>}
            <ul className="space-y-0.5 mb-2">
              {formations.map((f) => (
                <li key={f}>
                  <button
                    onClick={() => setFormationFilter((cur) => (cur === f ? null : f))}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-sm ${
                      formationFilter === f ? 'bg-navy-800 text-gold-400 font-semibold' : 'text-slate-300 hover:bg-navy-800'
                    }`}
                  >
                    <span className="truncate">{f}</span>
                    <span className="text-xs text-slate-500">{sidePlays.filter((p) => p.formation === f).length}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-1">
              <input
                value={newFormationInput}
                onChange={(e) => setNewFormationInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFormation()}
                placeholder="Add formation"
                className="flex-1 min-w-0 rounded bg-navy-950 border border-navy-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-gold-500"
              />
              <button onClick={addFormation} className="px-2 rounded bg-navy-800 border border-navy-700 text-slate-200 text-xs font-bold hover:bg-navy-700">
                +
              </button>
            </div>
          </div>

          <div className="bg-navy-900 border border-navy-700 rounded-lg p-3">
            <p className="text-xs font-bold text-gold-400 uppercase mb-2">Categories</p>
            {categories.length === 0 && <p className="text-xs text-slate-500 mb-2">None yet.</p>}
            <ul className="space-y-0.5 mb-2">
              {categories.map((c) => (
                <li key={c}>
                  <button
                    onClick={() => setCategoryFilter((cur) => (cur === c ? null : c))}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-sm ${
                      categoryFilter === c ? 'bg-navy-800 text-gold-400 font-semibold' : 'text-slate-300 hover:bg-navy-800'
                    }`}
                  >
                    <span className="truncate">{c}</span>
                    <span className="text-xs text-slate-500">{sidePlays.filter((p) => (p.categories || []).includes(c)).length}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-1">
              <input
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                placeholder="Add category"
                className="flex-1 min-w-0 rounded bg-navy-950 border border-navy-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-gold-500"
              />
              <button onClick={addCategory} className="px-2 rounded bg-navy-800 border border-navy-700 text-slate-200 text-xs font-bold hover:bg-navy-700">
                +
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
          <button
            onClick={() => setShowNewModal(true)}
            className="aspect-[4/3] rounded-lg border-2 border-dashed border-navy-700 bg-navy-900 hover:bg-navy-800 flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-gold-400"
          >
            <span className="text-3xl leading-none">+</span>
            <span className="text-xs font-bold uppercase text-center px-2">New {SIDES.find((s) => s.key === side)?.label} Play</span>
          </button>

          {visiblePlays.map((play, i) => (
            <div key={play.id} className="rounded-lg border border-navy-700 bg-navy-900 overflow-hidden group relative">
              <button onClick={() => navigate(`/playbooks/${playbookId}/plays/${play.id}`)} className="block w-full text-left">
                <div className="aspect-[4/3] bg-navy-950">
                  <PlayThumbnail players={play.players} ball={play.ball} fieldLines={playbook.fieldLines} />
                </div>
                <div className="px-2 py-1.5">
                  <p className="text-[10px] text-slate-500 uppercase truncate">{play.formation || 'No formation'}</p>
                  <p className="text-sm font-semibold text-slate-100 truncate">{play.name}</p>
                </div>
              </button>
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingPlay(play)}
                  title="Edit play details"
                  className="w-6 h-6 rounded-full bg-navy-950/90 text-slate-300 hover:text-gold-400 flex items-center justify-center text-xs"
                >
                  ⓘ
                </button>
                <button
                  onClick={() => handleDeletePlay(play)}
                  title="Delete play"
                  className="w-6 h-6 rounded-full bg-navy-950/90 text-slate-300 hover:text-red-400 flex items-center justify-center text-xs"
                >
                  🗑
                </button>
              </div>
              <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-gold-500 text-navy-950 text-[10px] font-black flex items-center justify-center">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showNewModal && <NewPlayModal playbook={playbook} onSave={handleCreatePlay} onClose={() => setShowNewModal(false)} />}
      {editingPlay && (
        <NewPlayModal playbook={playbook} initial={editingPlay} onSave={handleEditPlayMeta} onClose={() => setEditingPlay(null)} />
      )}
    </div>
  )
}
