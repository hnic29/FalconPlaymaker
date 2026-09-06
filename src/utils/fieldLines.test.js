import { describe, expect, it, vi } from 'vitest'
import { drawFieldLines } from './fieldLines.js'

function createFakeCtx() {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  }
}

// Hash-mark ticks are drawn as short segments centered on the inset (x +/- tick/2,
// where tick = w * 0.02), so allow enough slack to match either endpoint.
function calledWithXNear(mockFn, x, epsilon = 6) {
  return mockFn.mock.calls.some(([callX]) => Math.abs(callX - x) < epsilon)
}

const W = 500
const H = 800

describe('drawFieldLines', () => {
  it('draws only a background and a border for "none", no interior lines', () => {
    const ctx = createFakeCtx()
    drawFieldLines(ctx, W, H, 'none')
    expect(ctx.fillRect).toHaveBeenCalledTimes(1)
    expect(ctx.strokeRect).toHaveBeenCalledTimes(1)
    expect(ctx.stroke).not.toHaveBeenCalled()
  })

  it('draws end zones and 9 interior yard lines for the standard 53.3 field', () => {
    const ctx = createFakeCtx()
    drawFieldLines(ctx, W, H, '53.3')
    expect(ctx.fillRect).toHaveBeenCalledTimes(3) // background + 2 end zones
    expect(ctx.strokeRect).toHaveBeenCalledTimes(1) // border
  })

  it('draws twice as many yard lines for the 5-yard-line option as the default', () => {
    // '5yard' has no hash marks, so its stroke() calls are only yard lines (19 = every 5 yards
    // across 100 yards of play). The default draws fewer yard lines (9) but adds 42 hash-mark
    // strokes on top, so compare yard-line counts directly instead of raw stroke() totals.
    const ctxFiveYard = createFakeCtx()
    drawFieldLines(ctxFiveYard, W, H, '5yard')
    expect(ctxFiveYard.stroke).toHaveBeenCalledTimes(19)

    const ctxDefault = createFakeCtx()
    drawFieldLines(ctxDefault, W, H, '53.3')
    const hashMarkStrokes = 42 // 21 hash positions x 2 sidelines
    expect(ctxDefault.stroke).toHaveBeenCalledTimes(9 + hashMarkStrokes)
  })

  it('does not draw hash marks for the 5-yard-line option', () => {
    const ctx = createFakeCtx()
    drawFieldLines(ctx, W, H, '5yard')
    // hash marks sit at a fixed inset from the sideline; yard lines run edge to edge (x=0)
    expect(calledWithXNear(ctx.moveTo, W * 0.38)).toBe(false)
  })

  it('places college hash marks narrower than pro/53.3 hash marks', () => {
    const ctxCollege = createFakeCtx()
    drawFieldLines(ctxCollege, W, H, 'collegeHash')
    const ctxPro = createFakeCtx()
    drawFieldLines(ctxPro, W, H, '53.3')

    expect(calledWithXNear(ctxCollege.moveTo, W * 0.29)).toBe(true)
    expect(calledWithXNear(ctxPro.moveTo, W * 0.38)).toBe(true)
    // and they shouldn't be using each other's inset
    expect(calledWithXNear(ctxCollege.moveTo, W * 0.38)).toBe(false)
    expect(calledWithXNear(ctxPro.moveTo, W * 0.29)).toBe(false)
  })
})
