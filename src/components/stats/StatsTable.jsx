import { useState } from 'react'

export default function StatsTable({ columns, rows, defaultSortKey }) {
  const [sortKey, setSortKey] = useState(defaultSortKey || columns[0].key)
  const [desc, setDesc] = useState(true)

  const sorted = [...rows].sort((a, b) => {
    const diff = (a[sortKey] ?? 0) - (b[sortKey] ?? 0)
    return desc ? -diff : diff
  })

  const toggleSort = (key) => {
    if (key === sortKey) setDesc((d) => !d)
    else {
      setSortKey(key)
      setDesc(true)
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-navy-700">
      <table className="w-full text-sm">
        <thead className="bg-navy-900">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className="px-3 py-3.5 text-left font-bold text-gold-400 uppercase text-xs tracking-wide cursor-pointer select-none whitespace-nowrap"
              >
                {col.label}
                {sortKey === col.key && <span className="ml-1">{desc ? '▼' : '▲'}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={row.id} className={i % 2 === 0 ? 'bg-navy-950' : 'bg-navy-900/50'}>
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2 text-slate-200 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-4 text-center text-slate-400">
                No data yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
