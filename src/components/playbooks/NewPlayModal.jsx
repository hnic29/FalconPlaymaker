import { useState } from 'react'

export default function NewPlayModal({ playbook, initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [formation, setFormation] = useState(initial?.formation || '')
  const [categories, setCategories] = useState(initial?.categories || [])
  const [notes, setNotes] = useState(initial?.notes || '')
  const [newFormation, setNewFormation] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [formations, setFormations] = useState(playbook.formations || [])
  const [categoryList, setCategoryList] = useState(playbook.categories || [])

  const addFormation = () => {
    const trimmed = newFormation.trim()
    if (!trimmed) return
    if (!formations.includes(trimmed)) setFormations((f) => [...f, trimmed])
    setFormation(trimmed)
    setNewFormation('')
  }

  const addCategory = () => {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    if (!categoryList.includes(trimmed)) setCategoryList((c) => [...c, trimmed])
    if (!categories.includes(trimmed)) setCategories((c) => [...c, trimmed])
    setNewCategory('')
  }

  const toggleCategory = (cat) => {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
  }

  const canSave = formation.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    onSave({ name: name.trim() || 'Untitled Play', formation: formation.trim(), categories, notes }, formations, categoryList)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-navy-900 border border-navy-700 rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700">
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg p-2.5 -m-2.5" title="Cancel">
            ✕
          </button>
          <h2 className="text-sm font-bold uppercase text-slate-100">{initial ? 'Edit Play' : 'New Play'}</h2>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="text-green-400 hover:text-green-300 text-lg disabled:opacity-30 disabled:hover:text-green-400 p-2.5 -m-2.5"
            title={canSave ? 'Save' : 'Choose a formation first'}
          >
            ✓
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-bold text-gold-400 uppercase mb-1.5">Play Name</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 26 Counter"
                className="w-full rounded bg-navy-950 border border-navy-700 px-3 py-3 text-sm text-slate-100 focus:outline-none focus:border-gold-500"
                autoFocus
              />
            </div>
            <div>
              <p className="text-xs font-bold text-gold-400 uppercase mb-1.5">Optional Play Notes</p>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Best vs. cover 2"
                className="w-full rounded bg-navy-950 border border-navy-700 px-3 py-3 text-sm text-slate-100 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-gold-400 uppercase mb-1.5">Formation (required)</p>
              <div className="rounded border border-navy-700 bg-navy-950 max-h-48 overflow-y-auto">
                {formations.length === 0 && <p className="text-xs text-slate-500 p-2">No formations yet — add one below.</p>}
                {formations.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormation(f)}
                    className={`w-full text-left px-3 py-3 text-sm ${
                      formation === f ? 'bg-navy-800 text-gold-400 font-semibold' : 'text-slate-300 hover:bg-navy-900'
                    }`}
                  >
                    {formation === f ? '✓ ' : ''}
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <input
                  value={newFormation}
                  onChange={(e) => setNewFormation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFormation()}
                  placeholder="New formation name"
                  className="flex-1 rounded bg-navy-950 border border-navy-700 px-2 py-3 text-sm text-slate-100 focus:outline-none focus:border-gold-500"
                />
                <button
                  onClick={addFormation}
                  className="px-4 rounded bg-navy-800 border border-navy-700 text-slate-200 text-sm font-bold hover:bg-navy-700"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gold-400 uppercase mb-1.5">Categories (optional)</p>
              <div className="rounded border border-navy-700 bg-navy-950 max-h-48 overflow-y-auto">
                {categoryList.length === 0 && <p className="text-xs text-slate-500 p-2">No categories yet — add one below.</p>}
                {categoryList.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCategory(c)}
                    className={`w-full text-left px-3 py-3 text-sm ${
                      categories.includes(c) ? 'bg-navy-800 text-gold-400 font-semibold' : 'text-slate-300 hover:bg-navy-900'
                    }`}
                  >
                    {categories.includes(c) ? '✓ ' : ''}
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                  placeholder="New category name"
                  className="flex-1 rounded bg-navy-950 border border-navy-700 px-2 py-3 text-sm text-slate-100 focus:outline-none focus:border-gold-500"
                />
                <button
                  onClick={addCategory}
                  className="px-4 rounded bg-navy-800 border border-navy-700 text-slate-200 text-sm font-bold hover:bg-navy-700"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
