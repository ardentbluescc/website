import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getNews } from '@/lib/payload'
import { getNCUNews, sortNewsFeed, type NewsCardData } from '@/lib/ncu-news'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'News | Ardent Blues CC',
  description: 'Latest news, match reports, and announcements from Ardent Blues Cricket Club and the Northern Cricket Union.',
}

const categoryColour: Record<string, string> = {
  'club-news': 'bg-ardent/15 text-ardent-bright',
  'match-report': 'bg-green-500/15 text-green-400',
  announcement: 'bg-yellow-500/15 text-yellow-300',
  recruitment: 'bg-purple-500/15 text-purple-300',
  'ncu-news': 'bg-blue-500/15 text-blue-300',
}

const categoryLabel: Record<string, string> = {
  'club-news': 'Club News',
  'match-report': 'Match Report',
  announcement: 'Announcement',
  recruitment: 'Recruitment',
}

export default async function NewsPage() {
  const [{ docs: clubDocs }, ncuArticles] = await Promise.all([getNews(12), getNCUNews(6)])

  const clubArticles: NewsCardData[] = clubDocs.map((article: any) => ({
    id: String(article.id),
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImageUrl: article.coverImage?.url,
    category: article.category,
    categoryLabel: categoryLabel[article.category] ?? article.category,
    publishedAt: article.publishedAt,
    source: 'club',
  }))

  const articles = sortNewsFeed([...clubArticles, ...ncuArticles])

  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="font-display text-4xl md:text-5xl font-normal text-white leading-none tracking-tight mb-4">News &amp; Announcements</h1>
        <p className="text-gray-400 text-lg mb-12">
          Latest updates, match reports, and club announcements — plus news from the Northern Cricket Union.
        </p>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-ardent-card rounded-2xl border border-ardent-border gap-2">
            <p className="text-gray-400 text-sm font-semibold">No published articles yet</p>
            <p className="text-gray-600 text-xs text-center max-w-xs">
              Go to <span className="text-ardent-bright">/admin → News</span>, open each article and set{' '}
              <span className="text-ardent-bright">Status → Published</span>, then save.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={`${article.source}-${article.id}`}
                className="bg-ardent-card border border-ardent-border rounded-2xl overflow-hidden hover:border-ardent/40 transition-all group"
              >
                <div className="relative h-44 bg-gradient-to-br from-[#0d2b5e] to-[#1a4080] overflow-hidden">
                  {article.coverImageUrl ? (
                    <Image
                      src={article.coverImageUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl select-none opacity-30">🏏</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  {article.category && (
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${
                        categoryColour[article.category] ?? 'bg-ardent-border text-gray-400'
                      }`}
                    >
                      {article.categoryLabel ?? article.category}
                    </span>
                  )}
                  <h2 className="text-white font-bold text-lg leading-snug mb-2 group-hover:text-ardent-bright transition-colors">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed mb-4">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    {article.publishedAt && (
                      <span className="text-gray-500 text-xs">
                        {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    <Link
                      href={`/news/${article.slug}`}
                      className="text-ardent-bright text-xs font-medium hover:text-ardent-light transition-colors"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
