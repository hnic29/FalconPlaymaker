import { useEffect, useRef, useState } from 'react'
import { FIELD_LINE_OPTIONS, PLAYERS_PER_SIDE_OPTIONS, drawFieldLines } from '../../utils/fieldLines.js'

function FieldLinesPreview({ fieldLines, selected, onClick, label }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawFieldLines(canvas.getContext('2d'), canvas.width, canvas.height, fieldLines)
  }, [fieldLines])

  return (
    <button
      onClick={onClick}
      className={`rounded-lg p-2 border text-center ${
        selected ? 'border-gold-500 bg-navy-800' : 'border-navy-700 bg-navy-950 hover:bg-navy-900'
      }`}
    >
      <canvas ref={canvasRef} width={70} height={110} className="mx-auto rounded" />
      <p className="text-[11px] font-semibold text-slate-300 mt-1">{label}</p>
    </button>
  )
}

export default function PlaybookModal({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [playersPerSide, setPlayersPerSide] = useState(initial?.playersPerSide || 11)
  const [fieldLines, setFieldLines] = useState(initial?.fieldLines || '53.3')

  const handleSave = () => {
    onSave({ name: name.trim() || 'Untitled Playbook', playersPerSide, fieldLines })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-navy-900 border border-navy-700 rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700">
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg p-2.5 -m-2.5" title="Cancel">
            ✕
          </button>
          <h2 className="text-sm font-bold uppercase text-slate-100">{initial?.id ? 'Edit Playbook' : 'New Playbook'}</h2>
          <button onClick={handleSave} className="text-green-400 hover:text-green-300 text-lg p-2.5 -m-2.5" title="Save">
            ✓
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <p className="text-xs font-bold text-gold-400 uppercase mb-1.5">Playbook Name</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cobras Playbook"
              className="w-full rounded bg-navy-950 border border-navy-700 px-3 py-3 text-sm text-slate-100 focus:outline-none focus:border-gold-500"
              autoFocus
            />
          </div>

          <div>
            <p className="text-xs font-bold text-gold-400 uppercase mb-1.5">Players Per Side</p>
            <div className="flex flex-wrap gap-2">
              {PLAYERS_PER_SIDE_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setPlayersPerSide(n)}
                  className={`w-11 h-11 rounded text-sm font-bold ${
                    playersPerSide === n
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-navy-950 border border-navy-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gold-400 uppercase mb-1.5">Field Lines</p>
            <div className="grid grid-cols-4 gap-2">
              {FIELD_LINE_OPTIONS.map((opt) => (
                <FieldLinesPreview
                  key={opt.key}
                  fieldLines={opt.key}
                  label={opt.label}
                  selected={fieldLines === opt.key}
                  onClick={() => setFieldLines(opt.key)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
