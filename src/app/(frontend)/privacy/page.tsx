import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Ardent Blues CC',
  description: 'How Ardent Blues Cricket Club collects, uses, and protects personal information.',
}

const CONTACT_EMAIL = 'ardentbluescc@gmail.com'

const sections = [
  {
    title: '1. Who we are',
    body: [
      'Ardent Blues Cricket Club (ABCC) is a cricket club affiliated to the Northern Cricket Union. For data protection purposes, the Club is the organisation responsible for deciding how personal information covered by this notice is used.',
    ],
  },
  {
    title: '2. Information we may collect',
    points: [
      'Identity and contact details, such as name, address, email address, telephone number, date of birth and emergency contact details.',
      'Membership, team, coaching, volunteering, attendance, competition and payment records.',
      'Safeguarding, accessibility or health information where necessary to protect participants or support safe participation. This may include more sensitive information and will be handled with additional care.',
      'Photographs, video or match/event content where appropriate and subject to applicable permissions, especially for children.',
      'Website information such as IP address, device/browser information, security logs, contact-form submissions and cookie/analytics information where the website uses these technologies.',
    ],
  },
  {
    title: '3. Why we use personal information',
    points: [
      'To administer membership, registrations, subscriptions, teams, coaching, fixtures, events and Club communications.',
      'To provide a safe sporting environment, manage emergencies, safeguarding and welfare concerns, and meet governing-body or legal obligations.',
      'To manage payments, accounts, insurance, disputes, complaints and Club governance.',
      'To operate, secure, maintain and improve the website and respond to enquiries.',
      'To promote the Club and cricket activities where we have an appropriate basis and any required permission.',
    ],
  },
  {
    title: '4. Lawful bases',
    body: [
      'Depending on the activity, ABCC may rely on performance of a contract or steps requested before a contract, legal obligations, legitimate interests in running and safeguarding the Club, consent, and — where sensitive information is involved — an additional lawful condition permitted by UK data protection law. Consent can be withdrawn where consent is the basis used, although this does not affect earlier lawful processing.',
    ],
  },
  {
    title: '5. Sharing information',
    body: [
      'We may share relevant information only where necessary with cricket governing bodies or leagues, competition organisers, insurers, professional advisers, IT/website service providers, payment providers, venues, coaches/officials, safeguarding or statutory bodies, and law-enforcement or emergency services where required or appropriate. Service providers should only use information for the agreed service and subject to suitable protections.',
    ],
  },
  {
    title: '6. International transfers',
    body: [
      "Some website, email, cloud, analytics or other technology providers may process information outside the UK. Where this applies, ABCC will use the safeguards required by applicable UK data protection law.",
    ],
  },
  {
    title: '7. Retention and security',
    body: [
      'We keep personal information only for as long as reasonably necessary for the purpose collected, including legal, safeguarding, insurance, accounting and dispute requirements. Retention periods may differ by record type. We use reasonable organisational and technical measures to protect information from unauthorised access, loss, misuse or disclosure.',
    ],
  },
  {
    title: '8. Your rights',
    body: [
      'Depending on the circumstances, you may have rights to access your personal information, ask for correction or deletion, restrict or object to processing, receive certain information in a portable format, and withdraw consent. You may contact ABCC using the details below. You may also complain to the UK Information Commissioner’s Office (ICO).',
    ],
  },
  {
    title: '9. Children and young people',
    body: [
      "ABCC recognises that information about children requires particular care. Parent/guardian details and permissions may be requested where appropriate. The Club will apply its safeguarding procedures when handling children's information and website content.",
    ],
  },
  {
    title: '10. Cookies and website technologies',
    body: [
      'Strictly necessary cookies may be used without optional-cookie consent where permitted. Non-essential cookies or similar technologies, including many analytics or advertising tools, are not activated until any required consent has been obtained.',
    ],
  },
  {
    title: '11. Changes to this notice',
    body: [
      'We may update this notice when Club activities, website technology or legal requirements change. The current version is published on this page with its effective date.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-gray-500 text-sm uppercase tracking-wide mb-3">Effective 2 September 2026</p>
        <h1 className="text-5xl font-normal text-white mb-5 leading-tight">Privacy Policy</h1>
        <p className="text-gray-400 text-lg mb-14 leading-relaxed">
          This policy explains how Ardent Blues Cricket Club (ABCC) collects, uses, and protects
          personal information for members, players, volunteers, and website visitors.
        </p>

        <div className="bg-ardent-card border border-ardent-border rounded-2xl p-6 mb-14">
          <p className="text-white font-bold text-sm mb-1">Privacy contact</p>
          <p className="text-gray-400 text-sm">Club Secretary / Management Committee</p>
          <p className="text-gray-400 text-sm">
            Email:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-ardent-bright hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>

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

        <div className="mt-14 bg-ardent/10 border border-ardent/30 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm">
            Questions about this Privacy Policy?{' '}
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
