import { useState } from 'react'

export const POSITIONS = ['QB', 'C', 'WR', 'RB', 'Flex', 'Rusher', 'Defender']

const emptyForm = { name: '', number: '', position: POSITIONS[0], notes: '' }

export default function PlayerForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm)

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit({ ...form, number: form.number.toString().trim() })
    if (!initial) setForm(emptyForm)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-navy-900 border border-navy-700 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      <div>
        <label className="block text-xs font-semibold text-gold-400 mb-1">Name</label>
        <input
          value={form.name}
          onChange={handleChange('name')}
          required
          className="w-full rounded bg-navy-950 border border-navy-700 px-2 py-3 text-slate-100 focus:outline-none focus:border-gold-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gold-400 mb-1">Number</label>
        <input
          value={form.number}
          onChange={handleChange('number')}
          className="w-full rounded bg-navy-950 border border-navy-700 px-2 py-3 text-slate-100 focus:outline-none focus:border-gold-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gold-400 mb-1">Position</label>
        <select
          value={form.position}
          onChange={handleChange('position')}
          className="w-full rounded bg-navy-950 border border-navy-700 px-2 py-3 text-slate-100 focus:outline-none focus:border-gold-500"
        >
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gold-400 mb-1">Notes / Contact</label>
        <input
          value={form.notes}
          onChange={handleChange('notes')}
          className="w-full rounded bg-navy-950 border border-navy-700 px-2 py-3 text-slate-100 focus:outline-none focus:border-gold-500"
        />
      </div>
      <div className="sm:col-span-2 flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2.5 rounded text-sm font-semibold text-slate-300 hover:text-white"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2.5 rounded bg-gold-500 text-navy-950 text-sm font-bold hover:bg-gold-400"
        >
          {initial ? 'Save Changes' : 'Add Player'}
        </button>
      </div>
    </form>
  )
}
