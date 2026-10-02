import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Keeps Tab inside an open panel and closes it on Escape. Focus is not restored here:
// callers decide where it goes, because "Create another" targets a different element.
export default function useFocusTrap(containerRef, active, onEscape, initialFocusRef) {
  const escapeRef = useRef(onEscape)

  useEffect(() => {
    escapeRef.current = onEscape
  })

  useEffect(() => {
    if (!active) return undefined
    const container = containerRef.current
    if (!container) return undefined

    function focusables() {
      return [...container.querySelectorAll(FOCUSABLE)].filter((element) => element.getClientRects().length > 0)
    }

    const first = initialFocusRef?.current ?? focusables()[0] ?? container
    first.focus({ preventScroll: true })

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        escapeRef.current?.()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (event.shiftKey && (document.activeElement === firstItem || !container.contains(document.activeElement))) {
        event.preventDefault()
        lastItem.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === lastItem || !container.contains(document.activeElement))
      ) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [active, containerRef, initialFocusRef])
}
