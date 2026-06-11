import Link from 'next/link'
import Image from 'next/image'

const categoryLabel: Record<string, string> = {
  'club-news': 'News',
  'match-report': 'Match Report',
  announcement: 'Announcement',
  recruitment: 'Recruitment',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1d'
  if (days < 30) return `${days}d`
  const months = Math.floor(days / 30)
  return `${months}mo`
}

function CategoryBadge({ category }: { category?: string }) {
  if (!category) return null
  return (
    <span className="inline-block text-xs font-semibold text-white bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded mb-2">
      {categoryLabel[category] ?? category}
    </span>
  )
}

export default function LatestNews({ articles }: { articles: any[] }) {
  const [featured, ...rest] = articles
  const sidebar = rest.slice(0, 2)

  return (
    <section className="py-20 bg-navy-900">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl md:text-5xl font-normal text-white leading-none tracking-tight">
            Latest<br /><span className="text-ardent">News</span>
          </h2>
          <Link
            href="/news"
            className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-ardent-border hover:border-ardent/40 px-5 py-2.5 rounded-full transition-all"
          >
            All news
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Featured — takes up 2 cols */}
          {featured && (
            <Link
              href={`/news/${featured.slug}`}
              className="lg:col-span-2 relative rounded-2xl overflow-hidden group block min-h-[420px]"
            >
              {/* Background image / gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d2a5c] via-[#1a3f80] to-[#0f2248]">
                {featured.coverImage?.url && (
                  <Image
                    src={featured.coverImage.url}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                )}
                {/* Cricket pattern overlay when no image */}
                {!featured.coverImage?.url && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <span className="text-[12rem] select-none">🏏</span>
                  </div>
                )}
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <CategoryBadge category={featured.category} />
                <h3 className="text-white font-normal text-2xl md:text-3xl leading-tight mb-2 group-hover:text-ardent-bright transition-colors">
                  {featured.title}
                </h3>
                {featured.publishedAt && (
                  <span className="text-gray-300 text-sm">{timeAgo(featured.publishedAt)}</span>
                )}
              </div>
            </Link>
          )}

          {/* Sidebar — 2 stacked cards */}
          <div className="flex flex-col gap-4">
            {sidebar.map(article => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="relative rounded-2xl overflow-hidden group block flex-1 min-h-[196px]"
              >
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0d2a5c] to-[#122240]">
                  {article.coverImage?.url && (
                    <Image
                      src={article.coverImage.url}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  )}
                  {!article.coverImage?.url && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <span className="text-[5rem] select-none">🏏</span>
                    </div>
                  )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <CategoryBadge category={article.category} />
                  <h3 className="text-white font-bold text-base leading-snug group-hover:text-ardent-bright transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {article.publishedAt && (
                    <span className="text-gray-400 text-xs mt-1 block">{timeAgo(article.publishedAt)}</span>
                  )}
                </div>
              </Link>
            ))}

            {/* If only 1 sidebar item, show a "more news" card */}
            {sidebar.length < 2 && (
              <Link
                href="/news"
                className="flex-1 min-h-[196px] rounded-2xl border border-ardent-border hover:border-ardent/40 bg-ardent-card flex flex-col items-center justify-center gap-3 transition-all group"
              >
                <div className="w-10 h-10 rounded-full border border-ardent/40 flex items-center justify-center group-hover:bg-ardent transition-colors">
                  <svg className="w-4 h-4 text-ardent-bright group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <span className="text-ardent-bright text-xs font-semibold">View all news</span>
              </Link>
            )}
          </div>

        </div>

        {/* Mobile CTA */}
        <div className="mt-6 sm:hidden text-center">
          <Link href="/news" className="text-sm text-ardent-bright font-medium">
            All news →
          </Link>
        </div>

      </div>
    </section>
  )
}
