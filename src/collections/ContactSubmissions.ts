import type { CollectionConfig } from 'payload'

const isAuth = ({ req }: any) => !!req.user

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: { singular: 'Contact Submission', plural: 'Contact Submissions' },
  access: {
    read: isAuth,
    create: () => true,
    update: isAuth,
    delete: isAuth,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'subject', 'createdAt'],
  },
  fields: [
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    {
      name: 'subject',
      type: 'select',
      required: true,
      options: [
        { label: 'Membership Enquiry', value: 'membership' },
        { label: 'Training & Coaching', value: 'training' },
        { label: 'Sponsorship', value: 'sponsorship' },
        { label: 'General Enquiry', value: 'general' },
      ],
    },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Responded', value: 'responded' },
        { label: 'Closed', value: 'closed' },
      ],
    },
  ],
}
