import { useState } from 'react'
import { TEAM_COLORS } from '../../utils/teamColors.js'

export default function TeamInfoModal({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [abbreviation, setAbbreviation] = useState(initial?.abbreviation || '')
  const [color, setColor] = useState(initial?.color || TEAM_COLORS[6])
  const [logo, setLogo] = useState(initial?.logo || null)

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogo(reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSave = () => {
    onSave({ name: name.trim(), abbreviation: abbreviation.trim().toUpperCase().slice(0, 5), color, logo })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-navy-900 border border-navy-700 rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700">
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg p-2.5 -m-2.5" title="Cancel">
            ✕
          </button>
          <h2 className="text-sm font-bold uppercase text-slate-100">Team Info</h2>
          <button onClick={handleSave} className="text-green-400 hover:text-green-300 text-lg p-2.5 -m-2.5" title="Save">
            ✓
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <p className="text-xs font-bold text-gold-400 uppercase mb-1.5">Team Name</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cobras"
              className="w-full rounded bg-navy-950 border border-navy-700 px-3 py-3 text-sm text-slate-100 focus:outline-none focus:border-gold-500"
              autoFocus
            />
          </div>

          <div>
            <p className="text-xs font-bold text-gold-400 uppercase mb-1.5">Abbreviation</p>
            <input
              value={abbreviation}
              onChange={(e) => setAbbreviation(e.target.value.toUpperCase().slice(0, 5))}
              placeholder="e.g. CBRA"
              className="w-full rounded bg-navy-950 border border-navy-700 px-3 py-3 text-sm text-slate-100 focus:outline-none focus:border-gold-500 uppercase"
            />
            <p className="text-xs text-slate-500 mt-1">Shown on the end zones of the field in place of "END ZONE".</p>
          </div>

          <div>
            <p className="text-xs font-bold text-gold-400 uppercase mb-1.5">Team Color</p>
            <div className="grid grid-cols-8 gap-1.5">
              {TEAM_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  title={c}
                  className={`aspect-square rounded ${color === c ? 'ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gold-400 uppercase mb-1.5 text-center">Optional Logo</p>
            <div className="flex flex-col items-center gap-2">
              <label
                className="w-24 h-24 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border-2 border-navy-700"
                style={{ backgroundColor: color }}
              >
                {logo ? (
                  <img src={logo} alt="Team logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs font-bold text-navy-950/70 text-center px-2">Tap to add logo</span>
                )}
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
              {logo && (
                <button onClick={() => setLogo(null)} className="text-xs font-semibold text-red-400 hover:text-red-300 p-2 -m-2">
                  ⊖ Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
