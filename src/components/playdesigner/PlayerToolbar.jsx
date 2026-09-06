import { useState } from 'react'

const END_CAPS = [
  { key: 'arrow', label: '➤ Arrow' },
  { key: 't', label: '⊤ Block' },
  { key: 'dot', label: '● Dot' },
]

export default function PlayerToolbar({ player, onUpdate, onSetCenter, onDone }) {
  const [pos, setPos] = useState({ x: 12, y: 60 })

  const handleDragStart = (e) => {
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const origX = pos.x
    const origY = pos.y
    const handleMove = (ev) => setPos({ x: origX + (ev.clientX - startX), y: origY + (ev.clientY - startY) })
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  const isCenter = player.label.trim().toUpperCase() === 'C'

  return (
    <div
      className="absolute z-10 w-64 bg-navy-900/95 border border-gold-500 rounded-lg shadow-xl"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        onMouseDown={handleDragStart}
        className="flex items-center justify-between px-3 py-1.5 border-b border-navy-700 cursor-grab active:cursor-grabbing"
      >
        <span className="text-xs font-bold text-gold-400 uppercase">☰ Selected Player</span>
        <button onClick={onDone} className="text-xs font-semibold text-slate-400 hover:text-white">
          ✕
        </button>
      </div>

      <div className="p-3">
        <div className="flex gap-2 mb-2">
          <input
            value={player.number}
            onChange={(e) => onUpdate({ number: e.target.value })}
            className="w-14 rounded bg-navy-950 border border-navy-700 px-2 py-1 text-sm text-slate-100"
            placeholder="#"
          />
          <input
            value={player.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="flex-1 rounded bg-navy-950 border border-navy-700 px-2 py-1 text-sm text-slate-100"
            placeholder="Label"
          />
        </div>

        <input
          value={player.note || ''}
          onChange={(e) => onUpdate({ note: e.target.value })}
          className="w-full mb-2 rounded bg-navy-950 border border-navy-700 px-2 py-1 text-xs text-slate-100"
          placeholder="Position note (e.g. block backside DE)"
        />

        <button
          onClick={onSetCenter}
          className={`w-full mb-2 px-2 py-1.5 rounded text-xs font-bold ${
            isCenter ? 'bg-gold-500 text-navy-950' : 'bg-navy-950 border border-navy-700 text-slate-300 hover:text-white'
          }`}
        >
          {isCenter ? '✓ Marked as Center' : 'Mark as Center'}
        </button>

        <p className="text-xs text-slate-400 mb-1">{player.route.length} route point(s)</p>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1.5">
          <input
            type="checkbox"
            checked={!!player.curved}
            onChange={(e) => onUpdate({ curved: e.target.checked })}
            className="accent-gold-500"
          />
          Smooth route (line smoothing)
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1.5">
          <input
            type="checkbox"
            checked={!!player.preSnapMotion}
            onChange={(e) => onUpdate({ preSnapMotion: e.target.checked })}
            className="accent-gold-500"
          />
          Pre-snap motion (zigzag start)
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1.5">
          <input
            type="checkbox"
            checked={!!player.pitchEnd}
            onChange={(e) => onUpdate({ pitchEnd: e.target.checked })}
            className="accent-gold-500"
          />
          Pitch / pass (dotted end)
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
          <input
            type="checkbox"
            checked={!!player.isReceiver}
            onChange={(e) => onUpdate({ isReceiver: e.target.checked })}
            className="accent-gold-500"
          />
          Intended receiver
        </label>

        <p className="text-xs font-semibold text-slate-300 mb-1">Route end cap</p>
        <div className="flex gap-1 mb-2">
          {END_CAPS.map((c) => (
            <button
              key={c.key}
              onClick={() => onUpdate({ endCap: c.key })}
              className={`flex-1 px-1.5 py-1 rounded text-[11px] font-bold ${
                (player.endCap || 'arrow') === c.key
                  ? 'bg-gold-500 text-navy-950'
                  : 'bg-navy-950 border border-navy-700 text-slate-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ route: player.route.slice(0, -1) })}
            disabled={player.route.length === 0}
            className="px-2 py-1 rounded text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
          >
            Undo Point
          </button>
          <button
            onClick={() => onUpdate({ route: [] })}
            disabled={player.route.length === 0}
            className="px-2 py-1 rounded text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
          >
            Clear Route
          </button>
          <button onClick={onDone} className="px-2 py-1 rounded text-xs font-semibold text-slate-300 hover:text-white ml-auto">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
