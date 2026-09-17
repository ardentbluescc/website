import type { Metadata } from 'next'
import FAQ from '@/components/FAQ'

export const metadata: Metadata = {
  title: 'Help Centre | Ardent Blues CC',
  description: 'Frequently asked questions about membership, conduct, and safeguarding at Ardent Blues Cricket Club.',
}

export default function FAQPage() {
  return <FAQ />
}
