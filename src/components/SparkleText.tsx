'use client'

// 4-pointed star SVG
function Star({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 0 L13.8 10.2 L24 12 L13.8 13.8 L12 24 L10.2 13.8 L0 12 L10.2 10.2 Z" />
    </svg>
  )
}

const SPARKLES = [
  { top: '-20px', left: '5%',   size: 16, delay: '0.0s', dur: '2.2s', color: '#60A5FA' },
  { top: '-16px', left: '42%',  size: 10, delay: '0.7s', dur: '2.6s', color: '#ffffff' },
  { top: '-18px', left: '80%',  size: 14, delay: '1.4s', dur: '2.0s', color: '#1D6EF5' },
  { top: '35%',   left: '-18px',size: 11, delay: '0.4s', dur: '2.8s', color: '#60A5FA' },
  { top: '105%',  left: '12%',  size: 13, delay: '1.0s', dur: '2.4s', color: '#ffffff' },
  { top: '100%',  left: '52%',  size: 8,  delay: '0.2s', dur: '3.0s', color: '#1D6EF5' },
  { top: '92%',   left: '88%',  size: 17, delay: '0.6s', dur: '2.2s', color: '#60A5FA' },
  { top: '30%',   left: '105%', size: 12, delay: '1.2s', dur: '2.6s', color: '#ffffff' },
  { top: '-8px',  left: '62%',  size: 7,  delay: '1.8s', dur: '2.0s', color: '#1D6EF5' },
  { top: '65%',   left: '-10px',size: 9,  delay: '0.9s', dur: '2.8s', color: '#60A5FA' },
]

export default function SparkleText({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="absolute pointer-events-none animate-sparkle"
          style={{
            top: s.top,
            left: s.left,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        >
          <Star size={s.size} color={s.color} />
        </span>
      ))}
      {children}
    </span>
  )
}
