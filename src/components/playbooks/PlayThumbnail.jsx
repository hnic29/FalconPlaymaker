import { useEffect, useRef } from 'react'
import { renderThumbnail } from '../playdesigner/FieldCanvas.jsx'

export default function PlayThumbnail({ players, ball, fieldLines, team, width = 160, height = 120 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    renderThumbnail(canvas.getContext('2d'), canvas.width, canvas.height, players || [], ball || null, fieldLines, team)
  }, [players, ball, fieldLines, team])

  return <canvas ref={canvasRef} width={width} height={height} className="w-full h-full rounded" />
}
