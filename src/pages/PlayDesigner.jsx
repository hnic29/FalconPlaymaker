import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext.jsx'
import FieldCanvas from '../components/playdesigner/FieldCanvas.jsx'
import AnimationOverlay from '../components/playdesigner/AnimationOverlay.jsx'
import BallPanel from '../components/playdesigner/BallPanel.jsx'
import PlayerToolbar from '../components/playdesigner/PlayerToolbar.jsx'
import NewPlayModal from '../components/playbooks/NewPlayModal.jsx'

const MODES = [
  { key: 'add', label: 'Add Player', hint: 'Click the field to place a player.' },
  { key: 'route', label: 'Draw Route', hint: 'Click a player, then click points to draw their route. Drag existing points to reshape it.' },
  { key: 'move', label: 'Move Player', hint: 'Drag a player token to reposition it.' },
  { key: 'erase', label: 'Erase', hint: 'Click a player to remove them.' },
  {
    key: 'ball',
    label: '🏈 Football',
    hint: 'Click the field to place the football. Click again to add path points, or drag the ball or its points to reshape the path.',
  },
]

const MAX_HISTORY = 100

export default function PlayDesigner() {
  const { playbookId, playId } = useParams()
  const { plays: allPlays, savePlay, playbooks, updatePlaybook } = useAppData()
  const playbook = playbooks.find((pb) => pb.id === playbookId) || null
  const [playMeta, setPlayMeta] = useState({ formation: '', categories: [], notes: '', side: 'offense' })
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [players, setPlayersRaw] = useState([])
  const [mode, setMode] = useState('add')
  const [selectedPlayerId, setSelectedPlayerId] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [resetTick, setResetTick] = useState(0)
  const [playName, setPlayName] = useState('')
  const [currentPlayId, setCurrentPlayId] = useState(null)
  const [ball, setBall] = useState(null)
  const [showAnimation, setShowAnimation] = useState(false)
  const [, setHistoryVersion] = useState(0)

  const playersRef = useRef(players)
  const pastRef = useRef([])
  const futureRef = useRef([])
  const dragSnapshotRef = useRef(null)

  useEffect(() => {
    playersRef.current = players
  }, [players])

  const bumpHistory = () => setHistoryVersion((v) => v + 1)

  const resetHistory = () => {
    pastRef.current = []
    futureRef.current = []
    dragSnapshotRef.current = null
    bumpHistory()
  }

  const setPlayers = (updater, opts = {}) => {
    setPlayersRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (!opts.transient) {
        pastRef.current.push(prev)
        if (pastRef.current.length > MAX_HISTORY) pastRef.current.shift()
        futureRef.current = []
        bumpHistory()
      }
      return next
    })
  }

  const beginTransientChange = () => {
    dragSnapshotRef.current = playersRef.current
  }

  const endTransientChange = ({ discard = false } = {}) => {
    if (discard) {
      dragSnapshotRef.current = null
      return
    }
    if (dragSnapshotRef.current) {
      pastRef.current.push(dragSnapshotRef.current)
      if (pastRef.current.length > MAX_HISTORY) pastRef.current.shift()
      futureRef.current = []
      dragSnapshotRef.current = null
      bumpHistory()
    }
  }

  const undo = () => {
    if (pastRef.current.length === 0) return
    const previous = pastRef.current.pop()
    futureRef.current.push(playersRef.current)
    bumpHistory()
    setPlayersRaw(previous)
  }

  const redo = () => {
    if (futureRef.current.length === 0) return
    const next = futureRef.current.pop()
    pastRef.current.push(playersRef.current)
    bumpHistory()
    setPlayersRaw(next)
  }

  useEffect(() => {
    function handleKeyDown(e) {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || isAnimating) return
      const key = e.key.toLowerCase()
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // undo/redo are recreated every render; omitted deliberately so the listener isn't rebound each time
  }, [isAnimating])

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId)

  const resetAnimation = () => {
    setIsAnimating(false)
    setResetTick((t) => t + 1)
  }

  const handleOpenAnimation = () => {
    setResetTick((t) => t + 1)
    setShowAnimation(true)
    setIsAnimating(true)
  }

  const handleRestartAndReplay = () => {
    setResetTick((t) => t + 1)
    setIsAnimating(true)
  }

  const handleFinishAnimation = () => {
    setIsAnimating(false)
    setShowAnimation(false)
    setResetTick((t) => t + 1)
  }

  const handleSave = () => {
    const id = savePlay({
      id: currentPlayId,
      name: playName.trim() || 'Untitled Play',
      playbookId,
      ...playMeta,
      players,
      ball,
    })
    setCurrentPlayId(id)
  }

  const handleLoad = (play) => {
    const validBall = play.ball && Array.isArray(play.ball.route) && typeof play.ball.x === 'number'
    setPlayers(JSON.parse(JSON.stringify(play.players)))
    setBall(validBall ? JSON.parse(JSON.stringify(play.ball)) : null)
    setPlayName(play.name)
    setCurrentPlayId(play.id)
    setSelectedPlayerId(null)
    setMode('move')
    resetAnimation()
    resetHistory()
  }

  useEffect(() => {
    if (!playId) return
    const play = allPlays.find((p) => p.id === playId)
    if (!play) return
    handleLoad(play)
    if (!play.players || play.players.length === 0) setMode('add')
    setPlayMeta({
      formation: play.formation || '',
      categories: play.categories || [],
      notes: play.notes || '',
      side: play.side || 'offense',
    })
    // intentionally only re-runs when playId changes, not when allPlays updates -
    // otherwise saving this play would reload it mid-edit and reset local state
  }, [playId])

  const handleSaveDetails = (data, newFormations, newCategories) => {
    if (playbook && newFormations.length !== (playbook.formations || []).length) {
      updatePlaybook(playbookId, { formations: newFormations })
    }
    if (playbook && newCategories.length !== (playbook.categories || []).length) {
      updatePlaybook(playbookId, { categories: newCategories })
    }
    setPlayName(data.name)
    setPlayMeta((prev) => ({ ...prev, formation: data.formation, categories: data.categories, notes: data.notes }))
    savePlay({
      id: currentPlayId,
      name: data.name,
      playbookId,
      side: playMeta.side,
      formation: data.formation,
      categories: data.categories,
      notes: data.notes,
      players,
      ball,
    })
    setShowDetailsModal(false)
  }

  const updateSelected = (patch) =>
    setPlayers((prev) => prev.map((p) => (p.id === selectedPlayerId ? { ...p, ...patch } : p)))

  const handleSetSpeedTier = (id, tier) =>
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, speedTier: tier } : p)))

  const canUndo = pastRef.current.length > 0
  const canRedo = futureRef.current.length > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <Link to={`/playbooks/${playbookId}`} className="text-xs font-semibold text-slate-400 hover:text-gold-400">
            ← {playbook?.name || 'Playbook'}
          </Link>
          <h1 className="text-2xl font-black text-slate-100">{playName || 'Untitled Play'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={playName}
            onChange={(e) => setPlayName(e.target.value)}
            placeholder="Play name"
            className="rounded bg-navy-900 border border-navy-700 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-gold-500"
          />
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-gold-500 text-navy-950 text-sm font-bold hover:bg-gold-400"
          >
            {currentPlayId ? 'Update Play' : 'Save Play'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => {
                  setMode(m.key)
                  if (m.key !== 'route') setSelectedPlayerId(null)
                }}
                className={`px-3 py-1.5 rounded text-sm font-semibold ${
                  mode === m.key
                    ? 'bg-gold-500 text-navy-950'
                    : 'bg-navy-900 text-slate-200 hover:bg-navy-800 border border-navy-700'
                }`}
              >
                {m.label}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              <button
                onClick={handleOpenAnimation}
                disabled={showAnimation}
                title="Animate this play"
                className="px-3 py-1.5 rounded text-sm font-semibold bg-gold-500 text-navy-950 hover:bg-gold-400 disabled:opacity-30"
              >
                ▶ Animate
              </button>
              <button
                onClick={undo}
                disabled={!canUndo || isAnimating}
                title="Undo (Ctrl+Z)"
                className="px-3 py-1.5 rounded text-sm font-semibold bg-navy-900 text-slate-200 hover:bg-navy-800 border border-navy-700 disabled:opacity-30 disabled:hover:bg-navy-900"
              >
                ↶ Undo
              </button>
              <button
                onClick={redo}
                disabled={!canRedo || isAnimating}
                title="Redo (Ctrl+Y)"
                className="px-3 py-1.5 rounded text-sm font-semibold bg-navy-900 text-slate-200 hover:bg-navy-800 border border-navy-700 disabled:opacity-30 disabled:hover:bg-navy-900"
              >
                ↷ Redo
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-2">{MODES.find((m) => m.key === mode)?.hint}</p>

          <div className="relative">
            <FieldCanvas
              players={players}
              setPlayers={setPlayers}
              onDragStart={beginTransientChange}
              onDragEnd={endTransientChange}
              mode={mode}
              fieldLines={playbook?.fieldLines || '53.3'}
              positionSide={playMeta.side || 'offense'}
              playersPerSide={playbook?.playersPerSide || 5}
              selectedPlayerId={selectedPlayerId}
              setSelectedPlayerId={setSelectedPlayerId}
              isAnimating={isAnimating}
              onAnimationDone={() => setIsAnimating(false)}
              speed={speed}
              resetKey={resetTick}
              ball={ball}
              setBall={setBall}
            />

            {showAnimation && (
              <AnimationOverlay
                isAnimating={isAnimating}
                onPlay={() => setIsAnimating(true)}
                onPause={() => setIsAnimating(false)}
                onResetToStart={resetAnimation}
                onRestartAndReplay={handleRestartAndReplay}
                onFinish={handleFinishAnimation}
                speed={speed}
                setSpeed={setSpeed}
                players={players}
                onSetSpeedTier={handleSetSpeedTier}
              />
            )}

            {selectedPlayer && (
              <PlayerToolbar
                player={selectedPlayer}
                onUpdate={updateSelected}
                onSetCenter={() =>
                  updateSelected({
                    label: selectedPlayer.label.trim().toUpperCase() === 'C' ? selectedPlayer.number : 'C',
                  })
                }
                onDone={() => setSelectedPlayerId(null)}
              />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-navy-900 border border-navy-700 rounded-lg p-3">
            <p className="text-xs font-bold text-gold-400 uppercase mb-2">Players On Field ({players.length})</p>
            {players.length === 0 ? (
              <p className="text-xs text-slate-400">Switch to "Add Player" and click the field.</p>
            ) : (
              <ul className="space-y-1">
                {players.map((p) => (
                  <li
                    key={p.id}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm ${
                      p.id === selectedPlayerId ? 'bg-navy-800 border border-gold-500' : 'bg-navy-950'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-navy-950 shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.number}
                    </span>
                    <span className="flex-1 truncate text-slate-200">{p.label}</span>
                    <button
                      onClick={() => {
                        setMode('route')
                        setSelectedPlayerId(p.id)
                      }}
                      className="text-xs font-semibold text-slate-400 hover:text-gold-400"
                    >
                      Route
                    </button>
                    <button
                      onClick={() => {
                        setPlayers((prev) => prev.filter((pl) => pl.id !== p.id))
                        if (selectedPlayerId === p.id) setSelectedPlayerId(null)
                      }}
                      className="text-xs font-semibold text-slate-400 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <BallPanel
            ball={ball}
            onAdd={() => setMode('ball')}
            onUpdate={(patch) => setBall((b) => (b ? { ...b, ...patch } : b))}
            onDelete={() => setBall(null)}
          />

          <div className="bg-navy-900 border border-navy-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gold-400 uppercase">Play Details</p>
              <button
                onClick={() => setShowDetailsModal(true)}
                className="text-xs font-semibold text-slate-400 hover:text-gold-400"
              >
                Edit Details
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-1">
              Formation: <span className="text-slate-200">{playMeta.formation || 'None'}</span>
            </p>
            {playMeta.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {playMeta.categories.map((c) => (
                  <span key={c} className="px-1.5 py-0.5 rounded bg-navy-800 text-[10px] text-slate-300">
                    {c}
                  </span>
                ))}
              </div>
            )}
            {playMeta.notes && <p className="text-xs text-slate-400 italic">"{playMeta.notes}"</p>}
          </div>
        </div>
      </div>

      {showDetailsModal && playbook && (
        <NewPlayModal
          playbook={playbook}
          initial={{ name: playName, formation: playMeta.formation, categories: playMeta.categories, notes: playMeta.notes }}
          onSave={handleSaveDetails}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  )
}
