import { useEffect, useState } from 'react'
import { PALETTE } from './FieldCanvas.jsx'
import { LINE_STYLES, SEGMENT_END_CAPS } from '../../utils/advancedStyles.js'

export default function StaticBallToolbar({ staticBall, onUpdate, onDelete, onDone }) {
  const [pos, setPos] = useState({ x: 12, y: 60 })
  const [isCompact, setIsCompact] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  const [expanded, setExpanded] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

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

  const setSegment = (index, patch) =>
    onUpdate({ route: staticBall.route.map((pt, i) => (i === index ? { ...pt, ...patch } : pt)) })

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
        <span className="text-xs font-bold text-gold-400 uppercase truncate">🏈 Static Ball selected</span>
        <div className="flex items-center gap-1 shrink-0">
          {isCompact && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-xs font-semibold text-gold-400 hover:text-gold-300 p-2.5 -m-2.5 whitespace-nowrap"
            >
              {expanded ? '▾ Hide options' : '▴ Edit'}
            </button>
          )}
          <button onClick={onDone} className="text-sm font-semibold text-slate-400 hover:text-white p-2.5 -m-2.5">
            ✕
          </button>
        </div>
      </div>

      {(!isCompact || expanded) && (
        <div className="p-3">
          <p className="text-xs font-bold text-gold-400 uppercase mb-1.5">Label</p>
          <input
            value={staticBall.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="e.g. leave a space for blank"
            className="w-full mb-3 rounded bg-navy-950 border border-navy-700 px-2 py-2.5 text-sm text-slate-100"
          />

          <p className="text-xs text-slate-400 mb-2">{staticBall.route.length} point(s) on the pass line</p>

          <div className="flex flex-wrap gap-2 mb-2">
            <button
              onClick={() => onUpdate({ route: staticBall.route.slice(0, -1) })}
              disabled={staticBall.route.length === 0}
              className="px-2.5 py-2.5 rounded text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
            >
              Undo Point
            </button>
            <button
              onClick={() => onUpdate({ route: [] })}
              disabled={staticBall.route.length === 0}
              className="px-2.5 py-2.5 rounded text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
            >
              Clear Line
            </button>
            <button onClick={onDelete} className="px-2.5 py-2.5 rounded text-xs font-semibold text-red-400 hover:text-red-300 ml-auto">
              🗑 Remove Ball
            </button>
          </div>

          <button
            onClick={() => setShowAdvanced((s) => !s)}
            className="w-full mb-2 px-2 py-2.5 rounded text-xs font-bold bg-navy-950 border border-navy-700 text-gold-400 hover:text-gold-300"
          >
            {showAdvanced ? '▾ Hide advanced tools' : '▸ Advanced tools'}
          </button>

          {showAdvanced && (
            <div className="mb-2 rounded border border-navy-700 bg-navy-950/60 p-2.5">
              <p className="text-[11px] font-bold uppercase text-slate-400 mb-1.5">Line Color</p>
              <div className="grid grid-cols-8 gap-1.5 mb-3">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdate({ color: c })}
                    title={c}
                    className={`aspect-square rounded ${staticBall.color === c ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 py-2 mb-2">
                <input
                  type="checkbox"
                  checked={!!staticBall.curved}
                  onChange={(e) => onUpdate({ curved: e.target.checked })}
                  className="accent-gold-500 w-5 h-5"
                />
                Smooth this pass line (line smoothing)
              </label>

              {staticBall.route.length === 0 ? (
                <p className="text-xs text-slate-500">Draw the pass line first, then style each segment here.</p>
              ) : (
                <ul className="space-y-2.5 max-h-56 overflow-y-auto">
                  {staticBall.route.map((pt, i) => (
                    <li key={i} className="border-b border-navy-800 pb-2 last:border-0">
                      <p className="text-[11px] font-bold text-slate-400 mb-1">Segment {i + 1}</p>
                      <div className="flex gap-1 mb-1">
                        {LINE_STYLES.map((s) => (
                          <button
                            key={s.key}
                            onClick={() => setSegment(i, { style: s.key })}
                            className={`flex-1 py-2 rounded text-[11px] font-bold ${
                              (pt.style || 'dashed') === s.key ? 'bg-gold-500 text-navy-950' : 'bg-navy-900 border border-navy-700 text-slate-400'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        {SEGMENT_END_CAPS.map((c) => (
                          <button
                            key={c.key}
                            onClick={() => setSegment(i, { endCap: c.key })}
                            className={`flex-1 py-2 rounded text-[10px] font-bold ${
                              (pt.endCap || 'none') === c.key ? 'bg-gold-500 text-navy-950' : 'bg-navy-900 border border-navy-700 text-slate-400'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button onClick={onDone} className="w-full px-2.5 py-2.5 rounded text-xs font-semibold text-slate-300 hover:text-white border border-navy-700">
            Done
          </button>
        </div>
      )}
    </div>
  )
}
