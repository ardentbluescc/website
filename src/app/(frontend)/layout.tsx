import type { Metadata } from 'next'
import { Inter, Barlow_Condensed } from 'next/font/google'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'Ardent Blues Cricket Club | Belfast',
  description:
    "Belfast's rising cricket club — serious cricket, genuine community. Competing in the NCU across Belfast since 2023.",
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${barlowCondensed.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
