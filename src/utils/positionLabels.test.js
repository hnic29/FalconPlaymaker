import { describe, expect, it } from 'vitest'
import { getPositionLabel } from './positionLabels.js'

function placeAll(side, playersPerSide, count) {
  return Array.from({ length: count }, (_, i) => getPositionLabel(i, side, playersPerSide))
}

describe('getPositionLabel', () => {
  it('uses flag vocabulary for 5-a-side offense', () => {
    expect(placeAll('offense', 5, 5)).toEqual(['Q', 'C', 'X', 'Y', 'Z'])
  })

  it('uses flag vocabulary for 5-a-side defense', () => {
    expect(placeAll('defense', 5, 5)).toEqual(['R', 'CB', 'CB', 'S', 'S'])
  })

  it('drops the last position when the roster is smaller than 5', () => {
    expect(placeAll('offense', 4, 4)).toEqual(['Q', 'C', 'X', 'Y'])
    expect(placeAll('defense', 4, 4)).toEqual(['R', 'CB', 'CB', 'S'])
  })

  it('builds a full 11-man offense with standard position letters', () => {
    expect(placeAll('offense', 11, 11)).toEqual(['Q', 'C', 'X', 'Y', 'Z', 'H', 'F', 'LT', 'RT', 'LG', 'RG'])
  })

  it('builds a full 11-man defense with standard position letters, no Center collision', () => {
    const labels = placeAll('defense', 11, 11)
    expect(labels).toEqual(['DE', 'DT', 'DE', 'MIKE', 'CB', 'CB', 'FS', 'DT', 'WILL', 'SAM', 'SS'])
    // 'C' is reserved for the offensive center square token; defense must never use it.
    expect(labels).not.toContain('C')
  })

  it('gives special teams its own vocabulary instead of falling back to offense labels', () => {
    expect(placeAll('specialTeams', 5, 5)).toEqual(['K', 'LS', 'H', 'R', 'G'])
    expect(placeAll('specialTeams', 5, 5)).not.toContain('Q')
  })

  it('scales an intermediate roster size (7) progressively, not just truncating 11', () => {
    expect(placeAll('offense', 7, 7)).toEqual(['Q', 'C', 'X', 'Y', 'Z', 'H', 'F'])
    expect(placeAll('defense', 7, 7)).toEqual(['DE', 'DT', 'DE', 'MIKE', 'CB', 'CB', 'FS'])
  })

  it('falls back to numbered suffixes once the roster exceeds the position table', () => {
    // 7 players on a 5-a-side offense: table only has 5 entries (Q,C,X,Y,Z)
    expect(placeAll('offense', 5, 7)).toEqual(['Q', 'C', 'X', 'Y', 'Z', 'Q2', 'C2'])
  })

  it('defaults to 5-a-side when playersPerSide is not provided', () => {
    expect(getPositionLabel(0, 'offense', undefined)).toBe('Q')
    expect(getPositionLabel(0, 'offense', 0)).toBe('Q')
  })
})
