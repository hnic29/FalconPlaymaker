import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext.jsx'
import PlaybookModal from '../components/playbooks/PlaybookModal.jsx'

export default function Playbooks() {
  const { playbooks, addPlaybook, updatePlaybook, deletePlaybook, plays } = useAppData()
  const [modalPlaybook, setModalPlaybook] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const handleNew = () => {
    setModalPlaybook(null)
    setShowModal(true)
  }

  const handleEdit = (playbook) => {
    setModalPlaybook(playbook)
    setShowModal(true)
  }

  const handleSave = (data) => {
    if (modalPlaybook?.id) updatePlaybook(modalPlaybook.id, data)
    else addPlaybook(data)
    setShowModal(false)
  }

  const handleDelete = (playbook) => {
    const count = plays.filter((p) => p.playbookId === playbook.id).length
    const warning =
      count > 0
        ? `Delete "${playbook.name}" and its ${count} play(s)? This can't be undone.`
        : `Delete "${playbook.name}"? This can't be undone.`
    if (window.confirm(warning)) deletePlaybook(playbook.id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-slate-100">Playbooks</h1>
        <button
          onClick={handleNew}
          className="px-4 py-2.5 rounded bg-gold-500 text-navy-950 text-sm font-bold hover:bg-gold-400"
        >
          + New Playbook
        </button>
      </div>

      {playbooks.length === 0 ? (
        <p className="text-sm text-slate-400">No playbooks yet. Create one to start organizing your plays.</p>
      ) : (
        <ul className="space-y-1.5">
          {playbooks.map((pb, i) => (
            <li key={pb.id} className="flex items-center gap-1 rounded-lg pl-3 pr-1.5 border border-navy-700 bg-navy-900">
              <span className="w-7 h-7 rounded bg-gold-500 text-navy-950 text-xs font-black flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <Link
                to={`/playbooks/${pb.id}`}
                className="flex-1 min-w-0 py-3.5 px-2 text-sm font-semibold text-slate-100 hover:text-gold-400 truncate"
              >
                {pb.name}
              </Link>
              <span className="text-xs text-slate-500 hidden sm:inline shrink-0">
                {pb.playersPerSide}v{pb.playersPerSide} &middot; {plays.filter((p) => p.playbookId === pb.id).length} play(s)
              </span>
              <button
                onClick={() => handleEdit(pb)}
                title="Edit playbook settings"
                className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:text-gold-400 hover:bg-navy-800"
              >
                ⓘ
              </button>
              <button
                onClick={() => handleDelete(pb)}
                title="Delete playbook"
                className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:text-red-400 hover:bg-navy-800"
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <PlaybookModal initial={modalPlaybook} onSave={handleSave} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
