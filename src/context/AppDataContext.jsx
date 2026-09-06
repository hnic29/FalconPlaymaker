import { createContext, useContext, useEffect, useState } from 'react'
import { loadState, saveState } from '../utils/storage.js'
import { newId } from '../utils/id.js'

const AppDataContext = createContext(null)

export function AppDataProvider({ children }) {
  const [players, setPlayers] = useState(() => loadState('players', []))
  const [games, setGames] = useState(() => loadState('games', []))
  const [statLines, setStatLines] = useState(() => loadState('statLines', []))
  const [plays, setPlays] = useState(() => loadState('plays', []))
  const [playbooks, setPlaybooks] = useState(() => loadState('playbooks', []))

  useEffect(() => saveState('players', players), [players])
  useEffect(() => saveState('games', games), [games])
  useEffect(() => saveState('statLines', statLines), [statLines])
  useEffect(() => saveState('plays', plays), [plays])
  useEffect(() => saveState('playbooks', playbooks), [playbooks])

  const addPlayer = (player) => setPlayers((p) => [...p, { id: newId(), ...player }])
  const updatePlayer = (id, patch) =>
    setPlayers((p) => p.map((pl) => (pl.id === id ? { ...pl, ...patch } : pl)))
  const deletePlayer = (id) => {
    setPlayers((p) => p.filter((pl) => pl.id !== id))
    setStatLines((s) => s.filter((sl) => sl.playerId !== id))
  }

  const addGame = (game) => setGames((g) => [...g, { id: newId(), ...game }])
  const updateGame = (id, patch) =>
    setGames((g) => g.map((gm) => (gm.id === id ? { ...gm, ...patch } : gm)))
  const deleteGame = (id) => {
    setGames((g) => g.filter((gm) => gm.id !== id))
    setStatLines((s) => s.filter((sl) => sl.gameId !== id))
  }

  const addStatLine = (statLine) => setStatLines((s) => [...s, { id: newId(), ...statLine }])
  const updateStatLine = (id, patch) =>
    setStatLines((s) => s.map((sl) => (sl.id === id ? { ...sl, ...patch } : sl)))
  const deleteStatLine = (id) => setStatLines((s) => s.filter((sl) => sl.id !== id))

  const savePlay = (play) => {
    if (play.id) {
      setPlays((pl) => pl.map((p) => (p.id === play.id ? play : p)))
      return play.id
    }
    const id = newId()
    setPlays((pl) => [...pl, { ...play, id }])
    return id
  }
  const deletePlay = (id) => setPlays((pl) => pl.filter((p) => p.id !== id))
  const duplicatePlay = (id) => {
    const original = plays.find((p) => p.id === id)
    if (!original) return
    const copy = { ...JSON.parse(JSON.stringify(original)), id: newId(), name: `${original.name} (Copy)` }
    setPlays((pl) => [...pl, copy])
    return copy.id
  }

  const addPlaybook = (playbook) => {
    const id = newId()
    setPlaybooks((pb) => [...pb, { ...playbook, id }])
    return id
  }
  const updatePlaybook = (id, patch) =>
    setPlaybooks((pb) => pb.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  const deletePlaybook = (id) => {
    setPlaybooks((pb) => pb.filter((p) => p.id !== id))
    setPlays((pl) => pl.filter((p) => p.playbookId !== id))
  }

  const value = {
    players,
    addPlayer,
    updatePlayer,
    deletePlayer,
    games,
    addGame,
    updateGame,
    deleteGame,
    statLines,
    addStatLine,
    updateStatLine,
    deleteStatLine,
    plays,
    savePlay,
    deletePlay,
    duplicatePlay,
    playbooks,
    addPlaybook,
    updatePlaybook,
    deletePlaybook,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
