import { useEffect, useState } from 'react'

const END_CAPS = [
  { key: 'arrow', label: '➤ Arrow' },
  { key: 't', label: '⊤ Block' },
  { key: 'dot', label: '● Dot' },
]

export default function PlayerToolbar({ player, onUpdate, onSetCenter, onDone }) {
  const [pos, setPos] = useState({ x: 12, y: 60 })
  // Below this width the floating panel is nearly as wide as the field itself,
  // which blocks route-point taps underneath it - dock it as a bottom sheet instead.
  const [isCompact, setIsCompact] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  // On phones, start collapsed to a slim header so the field stays tappable for
  // route points right after selecting a player; expand on demand to style the route.
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const handler = (e) => setIsCompact(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleDragStart = (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const startX = e.clientX
    const startY = e.clientY
    const origX = pos.x
    const origY = pos.y
    const handleMove = (ev) => setPos({ x: origX + (ev.clientX - startX), y: origY + (ev.clientY - startY) })
    const handleUp = (ev) => {
      ev.currentTarget?.releasePointerCapture?.(ev.pointerId)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  const isCenter = player.label.trim().toUpperCase() === 'C'

  return (
    <div
      className={
        isCompact
          ? 'fixed inset-x-0 bottom-0 z-20 max-h-[45vh] overflow-y-auto bg-navy-900/95 border-t border-gold-500 rounded-t-lg shadow-xl'
          : 'absolute z-10 w-72 bg-navy-900/95 border border-gold-500 rounded-lg shadow-xl'
      }
      style={isCompact ? undefined : { left: pos.x, top: pos.y }}
    >
      <div
        onPointerDown={isCompact ? undefined : handleDragStart}
        className={`flex items-center justify-between px-3 py-2.5 ${!isCompact || expanded ? 'border-b border-navy-700' : ''} ${
          isCompact ? '' : 'cursor-grab active:cursor-grabbing touch-none'
        }`}
      >
        <span className="text-xs font-bold text-gold-400 uppercase truncate">
          {isCompact ? `${player.label} selected` : '☰ Selected Player'}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {isCompact && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-xs font-semibold text-gold-400 hover:text-gold-300 p-2.5 -m-2.5 whitespace-nowrap"
            >
              {expanded ? '▾ Hide route options' : '▴ Route options'}
            </button>
          )}
          <button onClick={onDone} className="text-sm font-semibold text-slate-400 hover:text-white p-2.5 -m-2.5">
            ✕
          </button>
        </div>
      </div>

      {(!isCompact || expanded) && <div className="p-3">
        <div className="flex gap-2 mb-2">
          <input
            value={player.number}
            onChange={(e) => onUpdate({ number: e.target.value })}
            className="w-16 rounded bg-navy-950 border border-navy-700 px-2 py-2.5 text-sm text-slate-100"
            placeholder="#"
          />
          <input
            value={player.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="flex-1 rounded bg-navy-950 border border-navy-700 px-2 py-2.5 text-sm text-slate-100"
            placeholder="Label"
          />
        </div>

        <input
          value={player.note || ''}
          onChange={(e) => onUpdate({ note: e.target.value })}
          className="w-full mb-2 rounded bg-navy-950 border border-navy-700 px-2 py-2.5 text-xs text-slate-100"
          placeholder="Position note (e.g. block backside DE)"
        />

        <button
          onClick={onSetCenter}
          className={`w-full mb-2 px-2 py-3 rounded text-xs font-bold ${
            isCenter ? 'bg-gold-500 text-navy-950' : 'bg-navy-950 border border-navy-700 text-slate-300 hover:text-white'
          }`}
        >
          {isCenter ? '✓ Marked as Center' : 'Mark as Center'}
        </button>

        <p className="text-xs text-slate-400 mb-1">{player.route.length} route point(s)</p>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 py-2">
          <input
            type="checkbox"
            checked={!!player.curved}
            onChange={(e) => onUpdate({ curved: e.target.checked })}
            className="accent-gold-500 w-5 h-5"
          />
          Smooth route (line smoothing)
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 py-2">
          <input
            type="checkbox"
            checked={!!player.preSnapMotion}
            onChange={(e) => onUpdate({ preSnapMotion: e.target.checked })}
            className="accent-gold-500 w-5 h-5"
          />
          Pre-snap motion (zigzag start)
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 py-2">
          <input
            type="checkbox"
            checked={!!player.pitchEnd}
            onChange={(e) => onUpdate({ pitchEnd: e.target.checked })}
            className="accent-gold-500 w-5 h-5"
          />
          Pitch / pass (dotted end)
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 py-2 mb-1">
          <input
            type="checkbox"
            checked={!!player.isReceiver}
            onChange={(e) => onUpdate({ isReceiver: e.target.checked })}
            className="accent-gold-500 w-5 h-5"
          />
          Intended receiver
        </label>

        <p className="text-xs font-semibold text-slate-300 mb-1">Route end cap</p>
        <div className="flex gap-1.5 mb-2">
          {END_CAPS.map((c) => (
            <button
              key={c.key}
              onClick={() => onUpdate({ endCap: c.key })}
              className={`flex-1 px-1.5 py-2.5 rounded text-[11px] font-bold ${
                (player.endCap || 'arrow') === c.key
                  ? 'bg-gold-500 text-navy-950'
                  : 'bg-navy-950 border border-navy-700 text-slate-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdate({ route: player.route.slice(0, -1) })}
            disabled={player.route.length === 0}
            className="px-2.5 py-2.5 rounded text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
          >
            Undo Point
          </button>
          <button
            onClick={() => onUpdate({ route: [] })}
            disabled={player.route.length === 0}
            className="px-2.5 py-2.5 rounded text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
          >
            Clear Route
          </button>
          <button onClick={onDone} className="px-2.5 py-2.5 rounded text-xs font-semibold text-slate-300 hover:text-white ml-auto">
            Done
          </button>
        </div>
      </div>}
    </div>
  )
}
