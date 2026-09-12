'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollReady } from '@/lib/scroll'

/**
 * The vision statement is revealed word by word as it is scrolled through —
 * the copy is short and load-bearing, so making the reader pass over each
 * word is the point rather than an effect.
 */
export function VisionStatement({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLQuoteElement>(null)
  const ready = useScrollReady()

  useEffect(() => {
    const el = ref.current
    if (!el || !ready) return
    const words = el.querySelectorAll<HTMLElement>('[data-word]')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      words.forEach((w) => (w.style.opacity = '1'))
      return
    }
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.to(words, {
        opacity: 1,
        stagger: 0.06,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 55%', scrub: 0.4 },
      })
    }, el)
    return () => ctx.revert()
  }, [text, ready])

  const words = text.split(' ')

  return (
    <blockquote ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} data-word className="opacity-15 transition-opacity">
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </blockquote>
  )
}
