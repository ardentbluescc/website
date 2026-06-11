const photos = [
  { label: 'Match Day', gradient: 'from-[#0d2b5e] to-[#1a4080]', tall: true },
  { label: 'Training', gradient: 'from-[#0f3460] to-[#16213e]', tall: false },
  { label: 'Bowling', gradient: 'from-[#1a3a6b] to-[#0d1f3c]', tall: false },
  { label: 'Batting', gradient: 'from-[#162040] to-[#1d3060]', tall: false },
  { label: 'Team', gradient: 'from-[#0d2040] to-[#1a4080]', tall: true },
]

export default function PhotoStrip() {
  return (
    <section className="py-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-3 items-end">
          {photos.map((p, i) => (
            <div
              key={i}
              className={`relative flex-1 rounded-2xl overflow-hidden bg-gradient-to-br ${p.gradient} flex items-end p-4 ${
                p.tall ? 'h-72' : 'h-48'
              }`}
            >
              {/* Cricket bat watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] select-none pointer-events-none">
                <span className="text-8xl">🏏</span>
              </div>
              <span className="text-white/50 text-xs font-medium relative z-10">{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
