import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Ardent Blues CC',
  description: 'The terms and conditions governing use of the Ardent Blues Cricket Club website.',
}

const CONTACT_EMAIL = 'ardentbluescc@gmail.com'

const sections = [
  {
    title: '1. About these terms',
    body: [
      'These Terms govern use of the Ardent Blues Cricket Club (ABCC) website. By using the website, you agree to these Terms. If you do not agree, please do not use the website. These website Terms are separate from the Club Constitution, membership rules, Code of Conduct, safeguarding policies and any specific terms applying to membership, events, bookings or payments.',
    ],
  },
  {
    title: '2. Website information',
    body: [
      'We aim to keep website information accurate and current, but cricket fixtures, teams, venues, fees, events, availability and other information can change. Unless expressly stated otherwise, website content is general information and should not be treated as professional, legal, medical or financial advice.',
    ],
  },
  {
    title: '3. Acceptable use',
    points: [
      'Do not use the website unlawfully, fraudulently or in a way that harms, disrupts, overloads or compromises the website or other users.',
      'Do not attempt unauthorised access to accounts, systems, data or security features, introduce malicious code, scrape or harvest personal information unlawfully, or impersonate another person.',
      'Do not submit or publish abusive, discriminatory, defamatory, threatening, obscene, infringing or otherwise unlawful material through Club forms or interactive features.',
    ],
  },
  {
    title: '4. Accounts, forms and submissions',
    body: [
      'If the website later provides accounts, registrations, bookings or online membership, users must provide accurate information and keep login details secure. ABCC may suspend or restrict access where reasonably necessary for security, misuse, legal compliance or breach of applicable Club rules.',
      'If you submit an enquiry, registration, application or other information, our Privacy Policy explains how personal information is handled.',
    ],
  },
  {
    title: '5. Membership, fees and refunds',
    body: [
      'Website publication of membership information does not replace the Club Constitution or decisions properly made by the Management Committee or AGM. Membership fees are set in accordance with Club governance. The Constitution states that cancellation/refund requests made before the cricket season may be considered by the Management Committee and that, after the season starts, refunds are generally not issued except in exceptional circumstances determined by the Management Committee.',
    ],
  },
  {
    title: '6. Intellectual property',
    body: [
      'Unless otherwise stated, website text, Club branding, graphics and original materials are owned by or licensed to ABCC. You may view and print reasonable extracts for personal, non-commercial use. You must not reproduce, commercially exploit or misrepresent Club materials without permission, except where law permits.',
    ],
  },
  {
    title: '7. Photos, scores and third-party material',
    body: [
      'Some photographs, logos, scores, fixtures, embedded media or links may belong to third parties and remain subject to their rights and terms. Links to third-party websites are provided for convenience; ABCC does not control those websites and is not responsible for their content, availability or privacy practices.',
    ],
  },
  {
    title: '8. Availability and security',
    body: [
      'We may change, suspend or withdraw website features without notice where reasonably necessary. We do not guarantee uninterrupted or error-free access. Users are responsible for using suitable devices, software and security precautions.',
    ],
  },
  {
    title: '9. Liability',
    body: [
      "Nothing in these Terms excludes liability that cannot lawfully be excluded. To the extent permitted by law, ABCC is not responsible for losses arising solely from reliance on general website information, temporary unavailability, third-party websites or events outside the Club's reasonable control. Any additional consumer-facing paid services should have specific terms reviewed before launch.",
    ],
  },
  {
    title: '10. Privacy and cookies',
    body: [
      'Use of personal information is governed by the ABCC Privacy Policy. The website provides cookie information and obtains any consent required for non-essential cookies or similar technologies.',
    ],
  },
  {
    title: '11. Changes to these Terms',
    body: [
      'We may update these Terms to reflect changes to the website, Club activities or legal requirements. The current version is published on this page with its effective date.',
    ],
  },
  {
    title: '12. Governing law and contact',
    body: [
      'These Terms are governed by the law applicable in Northern Ireland, and disputes will be subject to the jurisdiction of the courts competent to hear them, subject to any mandatory rights that apply.',
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-gray-500 text-sm uppercase tracking-wide mb-3">Effective 2 September 2026</p>
        <h1 className="text-5xl font-normal text-white mb-5 leading-tight">Terms & Conditions</h1>
        <p className="text-gray-400 text-lg mb-14 leading-relaxed">
          These Terms govern use of the Ardent Blues Cricket Club website.
        </p>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-white font-bold text-xl mb-4">{section.title}</h2>
              {section.body?.map((paragraph) => (
                <p key={paragraph} className="text-gray-400 text-sm leading-relaxed mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
              {section.points && (
                <ul className="space-y-3">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-3 text-gray-400 text-sm leading-relaxed">
                      <span className="text-ardent-bright mt-1">&bull;</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 bg-ardent-card border border-ardent-border rounded-2xl p-6">
          <p className="text-white font-bold text-sm mb-1">Website/terms contact</p>
          <p className="text-gray-400 text-sm">Club Secretary / Management Committee</p>
          <p className="text-gray-400 text-sm">
            Email:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-ardent-bright hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>

        <div className="mt-6 bg-ardent/10 border border-ardent/30 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm">
            Questions about these Terms?{' '}
            <Link href="/contact" className="text-ardent-bright hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
