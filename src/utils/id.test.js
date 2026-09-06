import { describe, expect, it } from 'vitest'
import { newId } from './id.js'

describe('newId', () => {
  it('returns a non-empty string', () => {
    const id = newId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('does not collide across many calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => newId()))
    expect(ids.size).toBe(1000)
  })
})
