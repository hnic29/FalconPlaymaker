import { useEffect, useRef } from 'react'

export const CANVAS_W = 562
export const CANVAS_H = 1000
const TOKEN_RADIUS = 20
const HANDLE_RADIUS = 8
const HANDLE_HIT_RADIUS = 14
const BASE_SPEED = 200 // canvas px/sec at multiplier 1
const SPEED_TIERS = { slow: 0.6, medium: 1, fast: 1.6 }

function tierMultiplier(player) {
  return SPEED_TIERS[player.speedTier] ?? 1
}

function drawField(ctx) {
  ctx.fillStyle = '#2f7a3d'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  const ezHeight = CANVAS_H * 0.1
  ctx.fillStyle = 'rgba(11, 31, 63, 0.85)'
  ctx.fillRect(0, 0, CANVAS_W, ezHeight)
  ctx.fillRect(0, CANVAS_H - ezHeight, CANVAS_W, ezHeight)

  ctx.fillStyle = '#facc15'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('END ZONE', CANVAS_W / 2, ezHeight / 2)
  ctx.fillText('END ZONE', CANVAS_W / 2, CANVAS_H - ezHeight / 2)

  const playHeight = CANVAS_H - ezHeight * 2
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = 1
  for (let i = 1; i < 10; i++) {
    const y = ezHeight + (playHeight * i) / 10
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(CANVAS_W, y)
    ctx.stroke()
  }

  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, CANVAS_W - 2, CANVAS_H - 2)
}

function fullPath(player) {
  return [{ x: player.x, y: player.y }, ...player.route]
}

function pathPixelPoints(player) {
  return fullPath(player).map((p) => ({ x: p.x * CANVAS_W, y: p.y * CANVAS_H }))
}

function catmullRomPoints(points, samplesPerSegment = 16) {
  if (points.length < 3) return points
  const result = [points[0]]
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    for (let t = 1; t <= samplesPerSegment; t++) {
      const s = t / samplesPerSegment
      const s2 = s * s
      const s3 = s2 * s
      const x =
        0.5 *
        (2 * p1.x + (-p0.x + p2.x) * s + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * s2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s3)
      const y =
        0.5 *
        (2 * p1.y + (-p0.y + p2.y) * s + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s3)
      result.push({ x, y })
    }
  }
  return result
}

function renderPathPoints(player) {
  const raw = pathPixelPoints(player)
  return player.curved ? catmullRomPoints(raw) : raw
}

function pointAtDistance(points, dist) {
  let remaining = dist
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const segLen = Math.hypot(b.x - a.x, b.y - a.y)
    if (remaining <= segLen || i === points.length - 2) {
      const t = segLen === 0 ? 0 : Math.min(remaining, segLen) / segLen
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
    }
    remaining -= segLen
  }
  return points[0]
}

function pathLength(points) {
  let len = 0
  for (let i = 0; i < points.length - 1; i++) {
    len += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y)
  }
  return len
}

function computeMaxDuration(entities, speed) {
  return (
    Math.max(
      0,
      ...entities.map((p) => {
        const points = renderPathPoints(p)
        return points.length > 1 ? (pathLength(points) / (BASE_SPEED * speed * tierMultiplier(p))) * 1000 : 0
      }),
    ) || 0
  )
}

function computeAnimationDuration(players, ball, speed) {
  const entities = ball ? [...players, ball] : players
  return computeMaxDuration(entities, speed)
}

function getEntityPositionAtTime(entity, tMs, speed) {
  const points = renderPathPoints(entity)
  if (points.length <= 1) return { x: entity.x * CANVAS_W, y: entity.y * CANVAS_H }
  const dist = (tMs / 1000) * BASE_SPEED * speed * tierMultiplier(entity)
  return pointAtDistance(points, dist)
}

function drawSquare(ctx, cx, cy, half) {
  ctx.beginPath()
  ctx.rect(cx - half, cy - half, half * 2, half * 2)
}

function drawBall(ctx, x, y, angle) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.ellipse(0, 0, 11, 6.5, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#7a4626'
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = '#2b1608'
  ctx.stroke()
  ctx.strokeStyle = '#f2e8d5'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(-6, 0)
  ctx.lineTo(6, 0)
  ctx.stroke()
  ;[-3, 0, 3].forEach((dx) => {
    ctx.beginPath()
    ctx.moveTo(dx, -2)
    ctx.lineTo(dx, 2)
    ctx.stroke()
  })
  ctx.restore()
}

function drawZigzag(ctx, a, b, color, segments = 6, amplitude = 6) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy)
  if (len === 0) return
  const px = -dy / len
  const py = dx / len
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.moveTo(a.x, a.y)
  for (let i = 1; i <= segments; i++) {
    const t = i / segments
    const baseX = a.x + dx * t
    const baseY = a.y + dy * t
    const side = i % 2 === 0 ? 1 : -1
    const offset = i === segments ? 0 : side * amplitude
    ctx.lineTo(baseX + px * offset, baseY + py * offset)
  }
  ctx.stroke()
}

function drawEndCap(ctx, last, prev, color, style) {
  const angle = Math.atan2(last.y - prev.y, last.x - prev.x)
  if (style === 't') {
    const px = -Math.sin(angle)
    const py = Math.cos(angle)
    const len = 9
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.moveTo(last.x - px * len, last.y - py * len)
    ctx.lineTo(last.x + px * len, last.y + py * len)
    ctx.stroke()
  } else if (style === 'dot') {
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(last.x, last.y, 4.5, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(last.x - 10 * Math.cos(angle - Math.PI / 6), last.y - 10 * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(last.x - 10 * Math.cos(angle + Math.PI / 6), last.y - 10 * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fill()
  }
}

function drawRoute(ctx, player) {
  const rawPoints = pathPixelPoints(player)
  if (rawPoints.length < 2) return
  const n = rawPoints.length - 1
  const preSnap = !!player.preSnapMotion && n >= 1
  const pitch = !!player.pitchEnd && n >= 1 && !(preSnap && n === 1)
  const midStartIdx = preSnap ? 1 : 0
  const midEndIdx = pitch ? rawPoints.length - 1 : rawPoints.length
  const midRaw = rawPoints.slice(midStartIdx, midEndIdx)
  const midPoints = player.curved ? catmullRomPoints(midRaw) : midRaw

  ctx.lineWidth = 3
  ctx.strokeStyle = player.color
  ctx.setLineDash([8, 6])

  if (preSnap) drawZigzag(ctx, rawPoints[0], rawPoints[1], player.color)

  if (midPoints.length > 1) {
    ctx.beginPath()
    ctx.setLineDash([8, 6])
    ctx.strokeStyle = player.color
    ctx.lineWidth = 3
    ctx.moveTo(midPoints[0].x, midPoints[0].y)
    for (let i = 1; i < midPoints.length; i++) ctx.lineTo(midPoints[i].x, midPoints[i].y)
    ctx.stroke()
  }

  let lastSegA = null
  let lastSegB = null
  if (pitch) {
    const a = rawPoints[rawPoints.length - 2]
    const b = rawPoints[rawPoints.length - 1]
    ctx.beginPath()
    ctx.setLineDash([3, 5])
    ctx.strokeStyle = player.color
    ctx.lineWidth = 3
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
    lastSegA = a
    lastSegB = b
  } else if (midPoints.length > 1) {
    lastSegA = midPoints[midPoints.length - 2]
    lastSegB = midPoints[midPoints.length - 1]
  } else if (preSnap) {
    lastSegA = rawPoints[0]
    lastSegB = rawPoints[1]
  }
  ctx.setLineDash([])

  if (lastSegA && lastSegB) drawEndCap(ctx, lastSegB, lastSegA, player.color, player.endCap || 'arrow')
}

function drawPlayer(ctx, px, py, player, isSelected, points) {
  if (points.length > 1) drawRoute(ctx, player)

  const isCenter = (player.label || '').trim().toUpperCase() === 'C'

  if (isCenter) {
    drawSquare(ctx, px, py, TOKEN_RADIUS * 0.9)
  } else {
    ctx.beginPath()
    ctx.arc(px, py, TOKEN_RADIUS, 0, Math.PI * 2)
  }
  ctx.fillStyle = player.color
  ctx.fill()
  ctx.lineWidth = isSelected ? 3 : 1.5
  ctx.strokeStyle = isSelected ? '#ffffff' : '#0b1f3f'
  ctx.stroke()

  if (player.isReceiver) {
    ctx.beginPath()
    ctx.setLineDash([4, 3])
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2.5
    ctx.arc(px, py, TOKEN_RADIUS + 5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.fillStyle = '#0b1f3f'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(player.number || '', px, py)
}

export default function FieldCanvas({
  players,
  setPlayers,
  onDragStart,
  onDragEnd,
  mode,
  selectedPlayerId,
  setSelectedPlayerId,
  isAnimating,
  onAnimationDone,
  speed,
  resetKey,
  ball,
  setBall,
}) {
  const canvasRef = useRef(null)
  const playersRef = useRef(players)
  const ballRef = useRef(ball)
  const modeRef = useRef(mode)
  const selectedRef = useRef(selectedPlayerId)
  const elapsedRef = useRef(0)
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)
  const draggingIdRef = useRef(null)
  const draggingRoutePointRef = useRef(null)
  const draggingBallOriginRef = useRef(false)
  const draggingBallPointRef = useRef(null)
  const didDragRef = useRef(false)
  const nextColorIndexRef = useRef(players.length)

  const PALETTE = ['#facc15', '#ffffff', '#38bdf8', '#fb923c', '#f472b6', '#a3e635', '#e2e8f0', '#fca5a5']

  useEffect(() => {
    playersRef.current = players
  }, [players])
  useEffect(() => {
    ballRef.current = ball
  }, [ball])
  useEffect(() => {
    modeRef.current = mode
  }, [mode])
  useEffect(() => {
    selectedRef.current = selectedPlayerId
  }, [selectedPlayerId])

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    drawField(ctx)
    const list = playersRef.current
    const ball = ballRef.current
    const elapsed = elapsedRef.current

    list.forEach((player) => {
      let px = player.x * CANVAS_W
      let py = player.y * CANVAS_H
      const points = renderPathPoints(player)
      if (points.length > 1 && elapsed > 0) {
        const pos = getEntityPositionAtTime(player, elapsed, speed)
        px = pos.x
        py = pos.y
      }
      drawPlayer(ctx, px, py, player, player.id === selectedRef.current, points)
    })

    if (ball) {
      const ballPoints = renderPathPoints(ball)
      let bx = ball.x * CANVAS_W
      let by = ball.y * CANVAS_H
      if (ballPoints.length > 1 && elapsed > 0) {
        const pos = getEntityPositionAtTime(ball, elapsed, speed)
        bx = pos.x
        by = pos.y
      }
      if (ballPoints.length > 1) {
        ctx.beginPath()
        ctx.setLineDash([6, 5])
        ctx.strokeStyle = '#d9a441'
        ctx.lineWidth = 2.5
        ctx.moveTo(ballPoints[0].x, ballPoints[0].y)
        for (let i = 1; i < ballPoints.length; i++) ctx.lineTo(ballPoints[i].x, ballPoints[i].y)
        ctx.stroke()
        ctx.setLineDash([])
      }
      drawBall(ctx, bx, by, -Math.PI / 4)

      if (modeRef.current === 'ball' && elapsed === 0) {
        ball.route.forEach((pt) => {
          const hx = pt.x * CANVAS_W
          const hy = pt.y * CANVAS_H
          ctx.beginPath()
          ctx.arc(hx, hy, HANDLE_RADIUS, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
          ctx.lineWidth = 2
          ctx.strokeStyle = '#d9a441'
          ctx.stroke()
        })
      }
    }

    if (modeRef.current === 'route' && elapsed === 0) {
      const selectedPlayer = list.find((p) => p.id === selectedRef.current)
      if (selectedPlayer) {
        selectedPlayer.route.forEach((pt) => {
          const hx = pt.x * CANVAS_W
          const hy = pt.y * CANVAS_H
          ctx.beginPath()
          ctx.arc(hx, hy, HANDLE_RADIUS, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
          ctx.lineWidth = 2
          ctx.strokeStyle = selectedPlayer.color
          ctx.stroke()
        })
      }
    }
  }

  useEffect(() => {
    draw()
  }, [players, selectedPlayerId, speed, ball])

  useEffect(() => {
    elapsedRef.current = 0
    draw()
  }, [resetKey])

  useEffect(() => {
    if (!isAnimating) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
      return
    }

    const maxDuration = computeAnimationDuration(playersRef.current, ballRef.current, speed)

    function step(time) {
      if (lastTimeRef.current == null) lastTimeRef.current = time
      const dt = time - lastTimeRef.current
      lastTimeRef.current = time
      elapsedRef.current += dt
      draw()
      if (elapsedRef.current >= maxDuration) {
        onAnimationDone()
        return
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating, speed])

  function toCanvasCoords(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = CANVAS_W / rect.width
    const scaleY = CANVAS_H / rect.height
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  function hitTest(x, y) {
    return playersRef.current.find((p) => Math.hypot(p.x * CANVAS_W - x, p.y * CANVAS_H - y) <= TOKEN_RADIUS)
  }

  function hitTestRoutePoint(player, x, y) {
    if (!player) return null
    for (let i = 0; i < player.route.length; i++) {
      const pt = player.route[i]
      if (Math.hypot(pt.x * CANVAS_W - x, pt.y * CANVAS_H - y) <= HANDLE_HIT_RADIUS) return i
    }
    return null
  }

  function hitTestEntity(entity, x, y) {
    if (!entity) return false
    return Math.hypot(entity.x * CANVAS_W - x, entity.y * CANVAS_H - y) <= TOKEN_RADIUS
  }

  function handleMouseDown(e) {
    if (isAnimating) return
    didDragRef.current = false
    const { x, y } = toCanvasCoords(e)
    if (modeRef.current === 'move') {
      const hit = hitTest(x, y)
      if (hit) {
        onDragStart?.()
        draggingIdRef.current = hit.id
      }
      return
    }
    if (modeRef.current === 'route' && selectedRef.current) {
      const selectedPlayer = playersRef.current.find((p) => p.id === selectedRef.current)
      const idx = hitTestRoutePoint(selectedPlayer, x, y)
      if (idx !== null) {
        onDragStart?.()
        draggingRoutePointRef.current = { playerId: selectedPlayer.id, index: idx }
      }
      return
    }
    if (modeRef.current === 'ball' && ballRef.current) {
      const idx = hitTestRoutePoint(ballRef.current, x, y)
      if (idx !== null) {
        draggingBallPointRef.current = idx
        return
      }
      if (hitTestEntity(ballRef.current, x, y)) {
        draggingBallOriginRef.current = true
      }
    }
  }

  function handleMouseMove(e) {
    if (draggingIdRef.current && modeRef.current === 'move') {
      const { x, y } = toCanvasCoords(e)
      const nx = Math.min(1, Math.max(0, x / CANVAS_W))
      const ny = Math.min(1, Math.max(0, y / CANVAS_H))
      didDragRef.current = true
      setPlayers(
        (prev) =>
          prev.map((p) => {
            if (p.id !== draggingIdRef.current) return p
            const dx = nx - p.x
            const dy = ny - p.y
            return { ...p, x: nx, y: ny, route: p.route.map((pt) => ({ x: pt.x + dx, y: pt.y + dy })) }
          }),
        { transient: true },
      )
      return
    }
    if (draggingRoutePointRef.current && modeRef.current === 'route') {
      const { x, y } = toCanvasCoords(e)
      const nx = Math.min(1, Math.max(0, x / CANVAS_W))
      const ny = Math.min(1, Math.max(0, y / CANVAS_H))
      const { playerId, index } = draggingRoutePointRef.current
      didDragRef.current = true
      setPlayers(
        (prev) =>
          prev.map((p) => {
            if (p.id !== playerId) return p
            const route = p.route.slice()
            route[index] = { x: nx, y: ny }
            return { ...p, route }
          }),
        { transient: true },
      )
      return
    }
    if (draggingBallOriginRef.current && modeRef.current === 'ball') {
      const { x, y } = toCanvasCoords(e)
      const nx = Math.min(1, Math.max(0, x / CANVAS_W))
      const ny = Math.min(1, Math.max(0, y / CANVAS_H))
      didDragRef.current = true
      setBall((b) => (b ? { ...b, x: nx, y: ny } : b))
      return
    }
    if (draggingBallPointRef.current !== null && modeRef.current === 'ball') {
      const { x, y } = toCanvasCoords(e)
      const nx = Math.min(1, Math.max(0, x / CANVAS_W))
      const ny = Math.min(1, Math.max(0, y / CANVAS_H))
      const index = draggingBallPointRef.current
      didDragRef.current = true
      setBall((b) => {
        if (!b) return b
        const route = b.route.slice()
        route[index] = { x: nx, y: ny }
        return { ...b, route }
      })
    }
  }

  function handleMouseUp() {
    const wasDragging = draggingIdRef.current != null || draggingRoutePointRef.current != null
    draggingBallOriginRef.current = false
    draggingBallPointRef.current = null
    draggingIdRef.current = null
    draggingRoutePointRef.current = null
    if (wasDragging) onDragEnd?.({ discard: !didDragRef.current })
  }

  function handleClick(e) {
    if (isAnimating) return
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    const { x, y } = toCanvasCoords(e)
    const hit = hitTest(x, y)

    if (modeRef.current === 'add') {
      if (hit) return
      const number = String(playersRef.current.length + 1)
      const color = PALETTE[nextColorIndexRef.current % PALETTE.length]
      nextColorIndexRef.current += 1
      setPlayers((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          number,
          label: `P${number}`,
          color,
          x: x / CANVAS_W,
          y: y / CANVAS_H,
          route: [],
          curved: false,
          speedTier: 'medium',
          isReceiver: false,
          preSnapMotion: false,
          pitchEnd: false,
          endCap: 'arrow',
        },
      ])
      return
    }

    if (modeRef.current === 'erase') {
      if (hit) {
        setPlayers((prev) => prev.filter((p) => p.id !== hit.id))
        if (selectedRef.current === hit.id) setSelectedPlayerId(null)
      }
      return
    }

    if (modeRef.current === 'route') {
      if (hit) {
        setSelectedPlayerId(hit.id)
        return
      }
      if (selectedRef.current) {
        const nx = x / CANVAS_W
        const ny = y / CANVAS_H
        setPlayers((prev) =>
          prev.map((p) => (p.id === selectedRef.current ? { ...p, route: [...p.route, { x: nx, y: ny }] } : p)),
        )
      }
      return
    }

    if (modeRef.current === 'ball') {
      const currentBall = ballRef.current
      if (!currentBall) {
        setBall({ x: x / CANVAS_W, y: y / CANVAS_H, route: [], curved: false })
        return
      }
      if (hitTestEntity(currentBall, x, y) || hitTestRoutePoint(currentBall, x, y) !== null) return
      const nx = x / CANVAS_W
      const ny = y / CANVAS_H
      setBall((b) => (b ? { ...b, route: [...b.route, { x: nx, y: ny }] } : b))
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      className="mx-auto block h-auto max-h-[75vh] w-auto max-w-full rounded-lg border-2 border-navy-700 cursor-crosshair touch-none"
    />
  )
}
