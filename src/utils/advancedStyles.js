// Options for the Advanced Play Diagram panel: per-segment route line style
// and end cap, and per-position icon shading. Modeled on the True "Advanced
// Play Diagram" tools panel (symbol color/shading + per-segment style grid).
export const LINE_STYLES = [
  { key: 'dashed', label: '- - -' },
  { key: 'solid', label: '—' },
  { key: 'dotted', label: '···' },
  { key: 'zigzag', label: '⌇⌇' },
]

export const SEGMENT_END_CAPS = [
  { key: 'none', label: 'None' },
  { key: 'arrow', label: '➔ Arrow' },
  { key: 't', label: '⊤ Block' },
  { key: 'dot', label: '● Dot' },
]

export const SHADING_OPTIONS = [
  { key: 'solid', label: 'Solid' },
  { key: '75', label: '75%' },
  { key: '50', label: '50%' },
  { key: '25', label: '25%' },
  { key: 'striped', label: 'Striped' },
  { key: 'hollow', label: 'Hollow' },
]
