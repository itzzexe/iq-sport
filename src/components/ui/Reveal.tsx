'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Adds `is-revealed` when the element scrolls into view. Children opt in with
 * the `.js-reveal` class (and `--i` for stagger); CSS owns the animation, so
 * reduced-motion users get the final state immediately.
 */
export function Reveal({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-revealed')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} id={id} className={className}>
      {children}
    </div>
  )
}
