import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadState, saveState } from './storage.js'

// storage.js only touches the global `localStorage`, so a minimal in-memory
// stand-in is enough - no need to pull in a full DOM environment like jsdom
// just for this one API (which has also proven flaky across platforms in CI).
function createMemoryLocalStorage() {
  let store = new Map()
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  }
}

beforeEach(() => {
  globalThis.localStorage = createMemoryLocalStorage()
})

describe('loadState / saveState', () => {
  it('round-trips a value through localStorage under the playmaker: prefix', () => {
    saveState('plays', [{ id: 'p1', name: 'Test Play' }])
    expect(localStorage.getItem('playmaker:plays')).not.toBeNull()
    expect(loadState('plays', [])).toEqual([{ id: 'p1', name: 'Test Play' }])
  })

  it('returns the fallback when the key is missing', () => {
    expect(loadState('nonexistent', 'fallback-value')).toBe('fallback-value')
  })

  it('returns the fallback when stored JSON is corrupted', () => {
    localStorage.setItem('playmaker:broken', '{not valid json')
    expect(loadState('broken', 'fallback-value')).toBe('fallback-value')
  })

  it('fails silently instead of throwing when storage is unavailable', () => {
    const original = localStorage.setItem
    localStorage.setItem = vi.fn(() => {
      throw new Error('quota exceeded')
    })
    expect(() => saveState('plays', [1, 2, 3])).not.toThrow()
    localStorage.setItem = original
  })
})
