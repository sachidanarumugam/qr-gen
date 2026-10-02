export const TAP_GOAL = 8
export const TAP_LIMIT_MS = 20000
export const TAP_MOVE_MS = 900
export const TAP_MOVE_SLOW_MS = 1400

// Always a different cell. `random` returns 0 to 1.
export function otherCell(current, random = Math.random) {
  const roll = Math.min(7, Math.floor(random() * 8))
  return roll >= current ? roll + 1 : roll
}

export function scoreHit(score, cell, lit) {
  return cell === lit ? score + 1 : score
}

export function tapWon(score) {
  return score >= TAP_GOAL
}
