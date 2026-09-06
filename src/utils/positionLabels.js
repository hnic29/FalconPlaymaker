// Position-letter labels for newly added players, in the order players get
// placed. Below 5 players per side we use flag-football vocabulary (a
// snapper and a rusher instead of a full line); at 5 or more we switch to
// standard football position letters, extending the line/backfield/secondary
// as the roster size grows.
const OFFENSE_BASE5 = ['Q', 'C', 'X', 'Y', 'Z']
const OFFENSE_LARGE = ['Q', 'C', 'X', 'Y', 'Z', 'H', 'F', 'LT', 'RT', 'LG', 'RG']

const DEFENSE_BASE5 = ['R', 'CB', 'CB', 'S', 'S']
const DEFENSE_LARGE = ['DE', 'DT', 'DE', 'MIKE', 'CB', 'CB', 'FS', 'DT', 'WILL', 'SAM', 'SS']

// Special teams: kicker/punter, long snapper, holder, returner, then gunners
// and wings/personal-protectors for larger units.
const SPECIAL_BASE5 = ['K', 'LS', 'H', 'R', 'G']
const SPECIAL_LARGE = ['K', 'LS', 'H', 'R', 'G', 'G', 'W', 'W', 'PP', 'S', 'S']

const FALLBACK_PREFIX = { offense: 'P', defense: 'D', specialTeams: 'ST' }

function getLabelTable(side, playersPerSide) {
  const n = playersPerSide || 5
  const base5 = side === 'defense' ? DEFENSE_BASE5 : side === 'specialTeams' ? SPECIAL_BASE5 : OFFENSE_BASE5
  const large = side === 'defense' ? DEFENSE_LARGE : side === 'specialTeams' ? SPECIAL_LARGE : OFFENSE_LARGE
  return n <= 5 ? base5.slice(0, n) : large
}

export function getPositionLabel(index, side, playersPerSide) {
  const table = getLabelTable(side, playersPerSide)
  if (index < table.length) return table[index]
  const base = table[index % table.length] || FALLBACK_PREFIX[side] || 'P'
  return `${base}${Math.floor(index / table.length) + 1}`
}
