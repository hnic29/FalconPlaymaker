import { useEffect, useState } from 'react'

export default function FootballToolbar({ ball, onUpdate, onDelete, onDone }) {
  const [pos, setPos] = useState({ x: 12, y: 60 })
  const [isCompact, setIsCompact] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
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
        <span className="text-xs font-bold text-gold-400 uppercase truncate">🏈 Animated Football</span>
        <div className="flex items-center gap-1 shrink-0">
          {isCompact && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-xs font-semibold text-gold-400 hover:text-gold-300 p-2.5 -m-2.5 whitespace-nowrap"
            >
              {expanded ? '▾ Hide options' : '▴ Edit'}
            </button>
          )}
          <button onClick={onDone} title="Finish" className="text-sm font-semibold text-green-400 hover:text-green-300 p-2.5 -m-2.5">
            ✓
          </button>
        </div>
      </div>

      {(!isCompact || expanded) && (
        <div className="p-3">
          <p className="text-xs text-slate-400 mb-2">
            {ball.route.length} path point(s) — will not appear on printed playbooks
          </p>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 py-2 mb-2">
            <input
              type="checkbox"
              checked={!!ball.curved}
              onChange={(e) => onUpdate({ curved: e.target.checked })}
              className="accent-gold-500 w-5 h-5"
            />
            Smooth this path (line smoothing)
          </label>

          <div className="flex flex-wrap gap-2 mb-2">
            <button
              onClick={() => onUpdate({ route: ball.route.slice(0, -1) })}
              disabled={ball.route.length === 0}
              className="px-2.5 py-2.5 rounded text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
            >
              Undo Point
            </button>
            <button
              onClick={() => onUpdate({ route: [] })}
              disabled={ball.route.length === 0}
              className="px-2.5 py-2.5 rounded text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-40"
            >
              Clear Path
            </button>
            <button onClick={onDelete} className="px-2.5 py-2.5 rounded text-xs font-semibold text-slate-400 hover:text-red-400 ml-auto">
              🗑 Remove Ball
            </button>
          </div>

          <button onClick={onDone} className="w-full px-2.5 py-2.5 rounded text-xs font-semibold text-slate-300 hover:text-white border border-navy-700">
            ✓ Done
          </button>
        </div>
      )}
    </div>
  )
}
