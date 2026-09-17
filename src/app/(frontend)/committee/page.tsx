import type { Metadata } from 'next'
import Image from 'next/image'
import { getCommittee } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Committee | Ardent Blues CC',
  description: 'Meet the Management Committee of Ardent Blues Cricket Club.',
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default async function CommitteePage() {
  const { docs: members } = await getCommittee()

  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="font-display text-4xl md:text-5xl font-normal text-white leading-none tracking-tight mb-4">
          Committee
        </h1>
        <p className="text-gray-400 text-lg mb-12">
          The Management Committee running Ardent Blues Cricket Club.
        </p>

        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-ardent-card rounded-2xl border border-ardent-border gap-2">
            <p className="text-gray-400 text-sm font-semibold">No committee members added yet</p>
            <p className="text-gray-600 text-xs text-center max-w-xs">
              Go to <span className="text-ardent-bright">/admin → Committee</span> to add members.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {members.map((member: any) => (
              <div
                key={member.id}
                className="bg-ardent-card border border-ardent-border rounded-2xl overflow-hidden"
              >
                <div className="relative w-full aspect-square bg-ardent/15 flex items-center justify-center">
                  {member.photo?.url ? (
                    <Image
                      src={member.photo.url}
                      alt={member.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-ardent-bright font-bold text-4xl">{initials(member.name)}</span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-white font-bold text-xl mb-1">{member.name}</h3>
                  {member.role && <p className="text-gray-400 text-base mb-2">{member.role}</p>}
                  {member.phone && (
                    <a
                      href={`tel:${member.phone.replace(/\s+/g, '')}`}
                      className="text-gray-500 text-sm hover:text-white transition-colors"
                    >
                      {member.phone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
