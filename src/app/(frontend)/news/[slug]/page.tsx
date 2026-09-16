import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getNewsArticle } from '@/lib/payload'
import { getNCUArticle, isNCUSlug, ncuSlugToId } from '@/lib/ncu-news'

export const dynamic = 'force-dynamic'

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (isNCUSlug(slug)) {
    const article = await getNCUArticle(ncuSlugToId(slug))
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

          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4 bg-blue-500/15 text-blue-300">
            {article.categoryLabel}
          </span>

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

          <div
            className="prose prose-invert prose-lg max-w-none text-gray-300 prose-headings:text-white prose-a:text-ardent-bright prose-strong:text-white prose-blockquote:border-ardent prose-blockquote:text-gray-400"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          <p className="mt-10 text-gray-500 text-xs">
            Originally published on{' '}
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ardent-bright hover:underline"
            >
              northerncricketunion.org
            </a>
            .
          </p>
        </div>
      </div>
    )
  }

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

        {article.content && (
          <div className="prose prose-invert prose-lg max-w-none text-gray-300 prose-headings:text-white prose-a:text-ardent-bright prose-strong:text-white prose-blockquote:border-ardent prose-blockquote:text-gray-400">
            <RichText data={article.content} />
          </div>
        )}
      </div>
    </div>
  )
}
