let idCounter = 0

export function useId(prefix = 'id') {
  idCounter++
  return `${prefix}-${idCounter}`
}
