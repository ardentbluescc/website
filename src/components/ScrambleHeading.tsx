'use client'

import { useEffect, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

interface WordProps {
  text: string
  delay: number        // seconds before decode starts
  duration?: number    // ms to complete decode
  style?: React.CSSProperties
  className?: string
}

function ScrambleWord({ text, delay, duration = 900, style, className }: WordProps) {
  const [display, setDisplay] = useState(text)
  const [revealed, setRevealed] = useState(false)
  const rafRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const letters = text.split('')
    // Start scrambled
    const scrambled = letters.map(() => CHARS[Math.floor(Math.random() * 26)])
    setDisplay(scrambled.join(''))

    let startTime: number | null = null
    let lastScramble = 0

    timerRef.current = setTimeout(() => {
      function tick(now: number) {
        if (!startTime) startTime = now

        const elapsed = now - startTime
        const d = Math.min(1, elapsed / duration)
        // Smoothstep easing — same as vazgro
        const smooth = d * d * (3 - 2 * d)
        const decoded = Math.floor(smooth * letters.length)

        // Re-scramble undecoded portion every 110ms
        if (now - lastScramble > 110) {
          for (let i = decoded; i < letters.length; i++) {
            scrambled[i] = CHARS[Math.floor(Math.random() * 26)]
          }
          lastScramble = now
        }

        const current = letters.map((l, i) =>
          i < decoded || l === ' ' ? l : scrambled[i]
        )
        setDisplay(current.join(''))

        if (d < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setDisplay(text)
          setRevealed(true)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }, delay * 1000)

    return () => {
      clearTimeout(timerRef.current)
      cancelAnimationFrame(rafRef.current)
    }
  }, [text, delay, duration])

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        opacity: revealed ? 1 : 0.2,
        transition: 'opacity 0.8s ease',
        ...style,
      }}
    >
      {display}
    </span>
  )
}

export default function ScrambleHeading() {
  return (
    <h1 className="font-display text-[clamp(3.5rem,9vw,7rem)] font-normal leading-[0.9] mb-6 tracking-tight flex flex-col">
      {/* ARDENT — white, decodes first */}
      <ScrambleWord
        text="ARDENT"
        delay={0.3}
        duration={950}
        className="text-white"
      />
      {/* BLUES — outlined blue, decodes second */}
      <ScrambleWord
        text="BLUES"
        delay={0.85}
        duration={950}
        style={{ WebkitTextStroke: '2px #1D6EF5', color: 'transparent' }}
      />
    </h1>
  )
}
