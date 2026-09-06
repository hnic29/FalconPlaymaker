// Position-letter labels for newly added players, in the order players get
// placed. Below 5 players per side we use flag-football vocabulary (a
// snapper and a rusher instead of a full line); at 5 or more we switch to
// standard football position letters, extending the line/backfield/secondary
// as the roster size grows.
const OFFENSE_BASE5 = ['Q', 'C', 'X', 'Y', 'Z']
const OFFENSE_LARGE = ['Q', 'C', 'X', 'Y', 'Z', 'H', 'F', 'LT', 'RT', 'LG', 'RG']

const DEFENSE_BASE5 = ['R', 'CB', 'CB', 'S', 'S']
const DEFENSE_LARGE = ['DE', 'DT', 'DE', 'MIKE', 'CB', 'CB', 'FS', 'DT', 'WILL', 'SAM', 'SS']

function getLabelTable(side, playersPerSide) {
  const n = playersPerSide || 5
  const isDefense = side === 'defense'
  if (n <= 5) return (isDefense ? DEFENSE_BASE5 : OFFENSE_BASE5).slice(0, n)
  return isDefense ? DEFENSE_LARGE : OFFENSE_LARGE
}

export function getPositionLabel(index, side, playersPerSide) {
  const table = getLabelTable(side, playersPerSide)
  if (index < table.length) return table[index]
  const base = table[index % table.length] || (side === 'defense' ? 'D' : 'P')
  return `${base}${Math.floor(index / table.length) + 1}`
}
