import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getNewsArticle } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getNewsArticle(slug)

  if (!article) notFound()

  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-ardent-bright text-sm font-medium mb-8 hover:text-ardent-light transition-colors"
        >
          ← Back to News
        </Link>

        {article.category && (
          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4 bg-ardent/15 text-ardent-bright">
            {article.category.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </span>
        )}

        <h1 className="font-display text-3xl md:text-5xl font-normal text-white leading-none tracking-tight mb-6">
          {article.title}
        </h1>

        {article.publishedAt && (
          <p className="text-gray-500 text-sm mb-8">
            {new Date(article.publishedAt).toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}

        {article.excerpt && (
          <p className="text-gray-200 text-xl leading-relaxed mb-8 bg-ardent/10 rounded-xl px-6 py-5">
            {article.excerpt}
          </p>
        )}

        {/* Rich text content placeholder — Payload lexical renderer needed for full rich text */}
        {article.content && (
          <div className="prose prose-invert prose-blue max-w-none text-gray-300">
            <p className="text-gray-400 text-sm bg-ardent-card border border-ardent-border rounded-xl p-4">
              Full article content renders here. Install <code>@payloadcms/richtext-lexical</code> JSX renderer for formatted output.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
