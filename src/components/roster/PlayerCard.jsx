export default function PlayerCard({ player, onEdit, onDelete }) {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-lg p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-gold-500 text-navy-950 font-black flex items-center justify-center text-lg shrink-0">
        {player.number || '–'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-100 truncate">{player.name}</p>
        <p className="text-xs text-gold-400 font-bold uppercase tracking-wide">{player.position}</p>
        {player.notes && <p className="text-xs text-slate-400 truncate mt-0.5">{player.notes}</p>}
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="text-xs font-semibold text-slate-300 hover:text-gold-400 px-2.5 py-2"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-xs font-semibold text-slate-400 hover:text-red-400 px-2.5 py-2"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
