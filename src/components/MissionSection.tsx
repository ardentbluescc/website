export default function MissionSection() {
  return (
    <section id="about" className="py-28 bg-ardent">
      <div className="max-w-5xl mx-auto px-6">
        <p className="font-display text-[clamp(2.8rem,7vw,5.5rem)] font-normal text-white leading-[1.0] tracking-tight text-balance">
          Cricket is more than a sport.
          It's discipline, passion, and the club you bleed for.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-white/20 pt-10">
          {[
            { stat: 'Est. 2023', label: 'Belfast\'s newest challenger club' },
            { stat: 'NCU', label: 'Competing across multiple divisions' },
            { stat: '50+', label: 'Active members and growing' },
          ].map(({ stat, label }) => (
            <div key={stat}>
              <p className="font-display text-5xl font-normal text-white leading-none tracking-tight">{stat}</p>
              <p className="text-blue-100 text-sm mt-2 leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
