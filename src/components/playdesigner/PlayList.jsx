export default function PlayList({ plays, currentPlayId, onLoad, onDuplicate, onDelete }) {
  if (plays.length === 0) {
    return <p className="text-slate-400 text-sm">No saved plays yet.</p>
  }
  return (
    <ul className="space-y-1">
      {plays.map((play) => (
        <li
          key={play.id}
          className={`flex items-center justify-between rounded px-3 py-2 border ${
            play.id === currentPlayId ? 'border-gold-500 bg-navy-800' : 'border-navy-700 bg-navy-900'
          }`}
        >
          <button
            onClick={() => onLoad(play)}
            className="text-sm font-semibold text-slate-100 hover:text-gold-400 text-left truncate"
          >
            {play.name}
          </button>
          <div className="flex items-center gap-2 ml-2 shrink-0">
            <button
              onClick={() => onDuplicate(play.id)}
              className="text-xs font-semibold text-slate-400 hover:text-gold-400"
              title="Duplicate this play"
            >
              Duplicate
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete "${play.name}"? This can't be undone.`)) onDelete(play.id)
              }}
              className="text-xs font-semibold text-slate-400 hover:text-red-400"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
