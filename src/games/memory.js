export const MEMORY_SHAPES = ['circle', 'square', 'plus', 'star', 'triangle', 'diamond']

export function createDeck(random = Math.random) {
  const deck = MEMORY_SHAPES.flatMap((shape) => [shape, shape])
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swap = Math.min(deck.length - 1, Math.floor(random() * (index + 1)))
    const current = deck[index]
    deck[index] = deck[swap]
    deck[swap] = current
  }
  return deck
}

export function newMemory(random = Math.random) {
  return { deck: createDeck(random), up: [], matched: [], moves: 0, locked: false }
}

export function flipMemory(state, index) {
  if (state.locked) return state
  if (index < 0 || index >= state.deck.length) return state
  if (state.up.includes(index)) return state
  if (state.matched.includes(state.deck[index])) return state
  const up = [...state.up, index]
  if (up.length < 2) return { ...state, up }
  const same = state.deck[up[0]] === state.deck[up[1]]
  if (same) {
    return {
      ...state,
      up: [],
      moves: state.moves + 1,
      matched: [...state.matched, state.deck[up[0]]],
      locked: false,
    }
  }
  return { ...state, up, moves: state.moves + 1, locked: true }
}

export function releaseMismatch(state) {
  if (!state.locked) return state
  return { ...state, up: [], locked: false }
}

export function memoryWon(state) {
  return state.matched.length === MEMORY_SHAPES.length
}
