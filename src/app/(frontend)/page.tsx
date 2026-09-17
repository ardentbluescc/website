import { getNews, getGallery, getSponsors } from '@/lib/payload'
import { getNCUNews, type NewsCardData } from '@/lib/ncu-news'
import Hero from '@/components/Hero'
import MissionSection from '@/components/MissionSection'
import StatsSection from '@/components/StatsSection'
import Testimonials from '@/components/Testimonials'
import LatestNews from '@/components/LatestNews'
import LiveScores from '@/components/LiveScores'
import NvPlayFixtures from '@/components/NvPlayFixtures'
import GalleryPreview from '@/components/GalleryPreview'
import SponsorsSection from '@/components/SponsorsSection'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [{ docs: clubNews }, { docs: photos }, { docs: sponsors }, ncuNews] = await Promise.all([
    getNews(4),
    getGallery(undefined, 5),
    getSponsors(),
    getNCUNews(4),
  ])

  const clubNewsCards: NewsCardData[] = clubNews.map((article: any) => ({
    id: String(article.id),
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImageUrl: article.coverImage?.url,
    category: article.category,
    categoryLabel: article.category,
    publishedAt: article.publishedAt,
    source: 'club',
  }))

  const news = [...clubNewsCards, ...ncuNews]
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 4)

  return (
    <>
      <Hero />
      <LiveScores />
      <MissionSection />
      <StatsSection />
      <NvPlayFixtures />
      <GalleryPreview photos={photos} />
      {news.length > 0 && <LatestNews articles={news} />}
      <Testimonials />
      <SponsorsSection sponsors={sponsors} />
    </>
  )
}
