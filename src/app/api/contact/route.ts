import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

const SUBJECT_LABELS: Record<string, string> = {
  membership: 'Membership Enquiry',
  training: 'Training & Coaching',
  sponsorship: 'Sponsorship',
  general: 'General Enquiry',
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, subject, message } = body as Record<string, string>

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    await payload.create({
      collection: 'contact-submissions',
      data: { firstName, lastName, email, subject, message },
    })

    const notifyAddress = process.env.CLUB_CONTACT_EMAIL
    if (notifyAddress) {
      try {
        await payload.sendEmail({
          to: notifyAddress,
          replyTo: email,
          subject: `New contact form submission: ${SUBJECT_LABELS[subject] ?? subject}`,
          text: `From: ${firstName} ${lastName} <${email}>\nSubject: ${SUBJECT_LABELS[subject] ?? subject}\n\n${message}`,
        })
      } catch (emailErr) {
        // Submission is already saved in the CMS even if the notification email fails to send
        payload.logger.error({ err: emailErr }, 'Failed to send contact form notification email')
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[contact]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
