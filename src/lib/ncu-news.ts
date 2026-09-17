// Pulls news from the Northern Cricket Union's public WordPress REST API.
// Their content field contains raw Divi page-builder shortcodes (e.g. "[et_pb_section ...]")
// left unprocessed by the REST API, so we strip those before rendering.

const NCU_API = 'https://northerncricketunion.org/wp-json/wp/v2/posts'
const NCU_SLUG_PREFIX = 'ncu-'

export interface NewsCardData {
  id: string
  slug: string
  title: string
  excerpt?: string
  coverImageUrl?: string
  category?: string
  categoryLabel?: string
  publishedAt?: string
  source: 'club' | 'ncu'
}

// Club-authored news always ranks above the NCU feed, newest first within each group.
export function sortNewsFeed(items: NewsCardData[]): NewsCardData[] {
  return [...items].sort((a, b) => {
    if (a.source !== b.source) return a.source === 'club' ? -1 : 1
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return dateB - dateA
  })
}

function stripDiviShortcodes(html: string): string {
  return html
    .replace(/\[\/?et_pb_[^\]]*\]/g, '')
    .replace(/<p>\s*<\/p>/g, '')
    .trim()
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim()
}

function toCardData(post: any): NewsCardData {
  const media = post._embedded?.['wp:featuredmedia']?.[0]?.source_url
  const term = post._embedded?.['wp:term']?.[0]?.[0]?.name

  return {
    id: String(post.id),
    slug: `${NCU_SLUG_PREFIX}${post.id}`,
    title: stripTags(post.title?.rendered ?? ''),
    excerpt: post.excerpt?.rendered ? stripTags(post.excerpt.rendered) : undefined,
    coverImageUrl: media,
    category: 'ncu-news',
    categoryLabel: term ?? 'NCU News',
    publishedAt: post.date,
    source: 'ncu',
  }
}

export function isNCUSlug(slug: string): boolean {
  return slug.startsWith(NCU_SLUG_PREFIX)
}

export function ncuSlugToId(slug: string): string {
  return slug.replace(NCU_SLUG_PREFIX, '')
}

export async function getNCUNews(limit = 6): Promise<NewsCardData[]> {
  try {
    const res = await fetch(`${NCU_API}?per_page=${limit}&_embed=1`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const posts = await res.json()
    return (posts as any[]).map(toCardData)
  } catch {
    return []
  }
}

export interface NCUArticle extends NewsCardData {
  contentHtml: string
  sourceUrl: string
}

export async function getNCUArticle(id: string): Promise<NCUArticle | null> {
  try {
    const res = await fetch(`${NCU_API}/${id}?_embed=1`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const post = await res.json()
    return {
      ...toCardData(post),
      contentHtml: stripDiviShortcodes(post.content?.rendered ?? ''),
      sourceUrl: post.link,
    }
  } catch {
    return null
  }
}
