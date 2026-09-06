function resultBadge(game) {
  if (game.type !== 'game' || !game.played || game.teamScore == null || game.oppScore == null) {
    return null
  }
  const win = game.teamScore > game.oppScore
  const tie = game.teamScore === game.oppScore
  return (
    <span
      className={`text-xs font-black px-2 py-0.5 rounded ${
        tie ? 'bg-slate-500 text-white' : win ? 'bg-gold-500 text-navy-950' : 'bg-red-500/80 text-white'
      }`}
    >
      {tie ? 'T' : win ? 'W' : 'L'} {game.teamScore}-{game.oppScore}
    </span>
  )
}

export default function GameCard({ game, onEdit, onDelete }) {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-lg p-4 flex items-center gap-4">
      <div className="w-16 shrink-0 text-center">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {new Date(game.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short' })}
        </p>
        <p className="text-xl font-black text-gold-400">
          {new Date(game.date + 'T00:00:00').getDate()}
        </p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
              game.type === 'game' ? 'bg-navy-700 text-gold-400' : 'bg-navy-800 text-slate-300'
            }`}
          >
            {game.type}
          </span>
          <p className="font-semibold text-slate-100 truncate">
            {game.type === 'game' ? `vs ${game.opponent}` : game.opponent || 'Practice'}
          </p>
          {resultBadge(game)}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {game.time && `${game.time} · `}
          {game.location || 'Location TBD'}
        </p>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button onClick={onEdit} className="text-xs font-semibold text-slate-300 hover:text-gold-400 px-2.5 py-2">
          Edit
        </button>
        <button onClick={onDelete} className="text-xs font-semibold text-slate-400 hover:text-red-400 px-2.5 py-2">
          Delete
        </button>
      </div>
    </div>
  )
}
