export default function BallPanel({ ball, onAdd, onUpdate, onDelete }) {
  if (!ball) {
    return (
      <div className="bg-navy-900 border border-navy-700 rounded-lg p-3">
        <p className="text-xs font-bold text-gold-400 uppercase mb-2">Football</p>
        <p className="text-xs text-slate-400 mb-2">
          Add an animated football, then draw its path across the field like a route.
        </p>
        <button
          onClick={onAdd}
          className="w-full px-2 py-3 rounded bg-gold-500 text-navy-950 text-xs font-bold hover:bg-gold-400"
        >
          🏈 Add Football to Play
        </button>
      </div>
    )
  }

  return (
    <div className="bg-navy-900 border border-navy-700 rounded-lg p-3">
      <p className="text-xs font-bold text-gold-400 uppercase mb-2">Football</p>
      <p className="text-xs text-slate-400 mb-2">{ball.route.length} path point(s)</p>
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 py-2 mb-1">
        <input
          type="checkbox"
          checked={!!ball.curved}
          onChange={(e) => onUpdate({ curved: e.target.checked })}
          className="accent-gold-500 w-5 h-5"
        />
        Smooth this path
      </label>
      <div className="flex flex-wrap gap-2">
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
          className="px-2.5 py-2.5 rounded text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
        >
          Clear Path
        </button>
        <button onClick={onDelete} className="px-2.5 py-2.5 rounded text-xs font-semibold text-slate-400 hover:text-red-400 ml-auto">
          🗑 Remove
        </button>
      </div>
    </div>
  )
}
