import { useEffect, useRef } from 'react'

const injected = new Set<string>()

export function useKeyframes() {
  const ref = useRef(false)

  useEffect(() => {
    if (ref.current || injected.has('aether-shimmer')) return
    ref.current = true
    injected.add('aether-shimmer')

    const style = document.createElement('style')
    style.textContent = `
@keyframes aether-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes aether-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`
    document.head.appendChild(style)
  }, [])
}
