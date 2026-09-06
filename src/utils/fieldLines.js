// Field-lines background options for a Playbook, modeled on the True "Add a
// Playbook" screen: 53.3 (standard sideline-to-sideline yard lines every 10),
// 53.3 College Hash (same width, hash marks drawn at the narrower college
// inset instead of the pro inset), 5 Yard Lines (a line every 5 yards instead
// of every 10), and None (a blank field with no interior markings).
export const FIELD_LINE_OPTIONS = [
  { key: '53.3', label: '53.3' },
  { key: 'collegeHash', label: 'College Hash' },
  { key: '5yard', label: '5 Yard Lines' },
  { key: 'none', label: 'None' },
]

export const PLAYERS_PER_SIDE_OPTIONS = [4, 5, 6, 7, 8, 9, 11, 12]

// Draws the field markings onto a canvas context sized (w, h), used by both
// the full-size FieldCanvas and the small option previews in PlaybookModal.
export function drawFieldLines(ctx, w, h, fieldLines) {
  ctx.fillStyle = '#2f7a3d'
  ctx.fillRect(0, 0, w, h)

  if (fieldLines === 'none') {
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = Math.max(1, w * 0.004)
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth)
    return
  }

  const ezHeight = h * 0.1
  ctx.fillStyle = 'rgba(11, 31, 63, 0.85)'
  ctx.fillRect(0, 0, w, ezHeight)
  ctx.fillRect(0, h - ezHeight, w, ezHeight)

  const playHeight = h - ezHeight * 2
  const step = fieldLines === '5yard' ? 20 : 10
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = Math.max(1, w * 0.002)
  for (let i = 1; i < step; i++) {
    const y = ezHeight + (playHeight * i) / step
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  if (fieldLines === 'collegeHash' || fieldLines === '53.3') {
    const inset = fieldLines === 'collegeHash' ? w * 0.29 : w * 0.38
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'
    ctx.lineWidth = Math.max(1, w * 0.0035)
    const tick = w * 0.02
    const hashStep = playHeight / 20
    for (let i = 0; i <= 20; i++) {
      const y = ezHeight + hashStep * i
      ;[inset, w - inset].forEach((x) => {
        ctx.beginPath()
        ctx.moveTo(x - tick / 2, y)
        ctx.lineTo(x + tick / 2, y)
        ctx.stroke()
      })
    }
  }

  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = Math.max(1, w * 0.0035)
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth)
}
