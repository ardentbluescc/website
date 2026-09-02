import { getNews, getGallery, getSponsors } from '@/lib/payload'
import Hero from '@/components/Hero'
import MissionSection from '@/components/MissionSection'
import StatsSection from '@/components/StatsSection'
import Testimonials from '@/components/Testimonials'
import FAQ from '@/components/FAQ'
import LatestNews from '@/components/LatestNews'
import LiveScores from '@/components/LiveScores'
import NvPlayFixtures from '@/components/NvPlayFixtures'
import GalleryPreview from '@/components/GalleryPreview'
import SponsorsSection from '@/components/SponsorsSection'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [{ docs: news }, { docs: photos }, { docs: sponsors }] = await Promise.all([
    getNews(3),
    getGallery(undefined, 5),
    getSponsors(),
  ])

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
      <FAQ />
      <SponsorsSection sponsors={sponsors} />
    </>
  )
}
