import { useState } from 'react'

const SPEED_TIERS = [
  { key: 'slow', label: 'Slow' },
  { key: 'medium', label: 'Med' },
  { key: 'fast', label: 'Fast' },
]

export default function AnimationOverlay({
  isAnimating,
  onPlay,
  onPause,
  onResetToStart,
  onRestartAndReplay,
  onFinish,
  speed,
  setSpeed,
  players,
  onSetSpeedTier,
}) {
  const [pos, setPos] = useState({ x: 12, y: 12 })
  const [showSettings, setShowSettings] = useState(false)

  const handleDragStart = (e) => {
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const origX = pos.x
    const origY = pos.y

    const handleMove = (ev) => {
      setPos({ x: origX + (ev.clientX - startX), y: origY + (ev.clientY - startY) })
    }
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  return (
    <div
      className="absolute z-10 flex items-center gap-1 bg-navy-900/95 border border-navy-700 rounded-full pl-1 pr-2 py-1.5 shadow-xl"
      style={{ left: pos.x, top: pos.y }}
    >
      <button
        onMouseDown={handleDragStart}
        title="Drag to move"
        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-white cursor-grab active:cursor-grabbing text-sm"
      >
        ☰
      </button>

      <div className="relative">
        <button
          onClick={() => setShowSettings((s) => !s)}
          title="Speed"
          className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${
            showSettings ? 'bg-navy-700 text-gold-400' : 'text-slate-300 hover:bg-navy-800'
          }`}
        >
          ⚙
        </button>
        {showSettings && (
          <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-navy-900 border border-navy-700 rounded-lg p-3 w-72 shadow-xl max-h-80 overflow-y-auto">
            <label className="flex flex-col gap-1 text-xs text-slate-300 font-semibold">
              Overall Speed
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="accent-gold-500"
              />
              <span className="text-gold-400 self-end">{speed.toFixed(1)}x</span>
            </label>

            <p className="text-[11px] font-bold uppercase text-slate-400 mt-3 mb-1.5 border-t border-navy-700 pt-2">
              Per-Player Speed
            </p>
            {!players || players.length === 0 ? (
              <p className="text-xs text-slate-500">No players on the field yet.</p>
            ) : (
              <ul className="space-y-1">
                {players.map((p) => (
                  <li key={p.id} className="flex items-center gap-1.5">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-navy-950 shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.number}
                    </span>
                    <span className="text-xs text-slate-300 flex-1 truncate">{p.label}</span>
                    {SPEED_TIERS.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => onSetSpeedTier(p.id, t.key)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          (p.speedTier || 'medium') === t.key
                            ? 'bg-gold-500 text-navy-950'
                            : 'bg-navy-950 border border-navy-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onResetToStart}
        title="Stop and reset to start"
        className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:bg-navy-800 text-sm"
      >
        ⏮
      </button>

      <button
        onClick={isAnimating ? onPause : onPlay}
        title={isAnimating ? 'Pause' : 'Play'}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-500 text-navy-950 hover:bg-gold-400"
      >
        {isAnimating ? (
          <span className="text-lg leading-none">⏸</span>
        ) : (
          <span className="text-lg leading-none ml-0.5">▶</span>
        )}
      </button>

      <button
        onClick={onRestartAndReplay}
        title="Restart and immediately replay"
        className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:bg-navy-800 text-sm"
      >
        ↺
      </button>

      <button
        onClick={onFinish}
        title="Finish"
        className="w-7 h-7 flex items-center justify-center rounded-full text-green-400 border border-green-500/60 hover:bg-navy-800 text-sm ml-1"
      >
        ✓
      </button>
    </div>
  )
}
