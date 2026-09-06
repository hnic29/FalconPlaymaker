import { useState } from 'react'

const emptyForm = {
  date: '',
  time: '',
  opponent: '',
  location: '',
  type: 'game',
  played: false,
  teamScore: '',
  oppScore: '',
}

export default function GameForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm)

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.date || !form.opponent.trim()) return
    onSubmit({
      ...form,
      teamScore: form.teamScore === '' ? null : Number(form.teamScore),
      oppScore: form.oppScore === '' ? null : Number(form.oppScore),
    })
    if (!initial) setForm(emptyForm)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-navy-900 border border-navy-700 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
    >
      <div>
        <label className="block text-xs font-semibold text-gold-400 mb-1">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={handleChange('date')}
          required
          className="w-full rounded bg-navy-950 border border-navy-700 px-2 py-3 text-slate-100 focus:outline-none focus:border-gold-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gold-400 mb-1">Time</label>
        <input
          type="time"
          value={form.time}
          onChange={handleChange('time')}
          className="w-full rounded bg-navy-950 border border-navy-700 px-2 py-3 text-slate-100 focus:outline-none focus:border-gold-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gold-400 mb-1">Type</label>
        <select
          value={form.type}
          onChange={handleChange('type')}
          className="w-full rounded bg-navy-950 border border-navy-700 px-2 py-3 text-slate-100 focus:outline-none focus:border-gold-500"
        >
          <option value="game">Game</option>
          <option value="practice">Practice</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gold-400 mb-1">Opponent</label>
        <input
          value={form.opponent}
          onChange={handleChange('opponent')}
          required={form.type === 'game'}
          placeholder={form.type === 'practice' ? 'Practice' : ''}
          className="w-full rounded bg-navy-950 border border-navy-700 px-2 py-3 text-slate-100 focus:outline-none focus:border-gold-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gold-400 mb-1">Location</label>
        <input
          value={form.location}
          onChange={handleChange('location')}
          className="w-full rounded bg-navy-950 border border-navy-700 px-2 py-3 text-slate-100 focus:outline-none focus:border-gold-500"
        />
      </div>
      {form.type === 'game' && (
        <>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-300 font-semibold py-2.5">
              <input type="checkbox" checked={form.played} onChange={handleChange('played')} className="w-5 h-5 accent-gold-500" />
              Final
            </label>
          </div>
          {form.played && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gold-400 mb-1">Team Score</label>
                <input
                  type="number"
                  min="0"
                  value={form.teamScore}
                  onChange={handleChange('teamScore')}
                  className="w-full rounded bg-navy-950 border border-navy-700 px-2 py-3 text-slate-100 focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gold-400 mb-1">Opp Score</label>
                <input
                  type="number"
                  min="0"
                  value={form.oppScore}
                  onChange={handleChange('oppScore')}
                  className="w-full rounded bg-navy-950 border border-navy-700 px-2 py-3 text-slate-100 focus:outline-none focus:border-gold-500"
                />
              </div>
            </>
          )}
        </>
      )}
      <div className="sm:col-span-3 flex gap-2 justify-end">
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
          {initial ? 'Save Changes' : 'Add to Schedule'}
        </button>
      </div>
    </form>
  )
}
