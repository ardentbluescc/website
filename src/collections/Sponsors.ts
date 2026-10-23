import type { CollectionConfig } from 'payload'

const isAuth = ({ req }: any) => !!req.user

export const Sponsors: CollectionConfig = {
  access: { read: () => true, create: isAuth, update: isAuth, delete: isAuth },
  slug: 'sponsors',
  // Drag-and-drop ordering in /admin → Sponsors. The site groups sponsors by tier and shows each
  // tier in this order.
  orderable: true,
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'tier', 'website'] },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'gallery' },
    { name: 'website', type: 'text' },
    {
      name: 'tier',
      type: 'select',
      options: [
        { label: 'Title Sponsor', value: 'title' },
        { label: 'Gold', value: 'gold' },
        { label: 'Silver', value: 'silver' },
        { label: 'Bronze', value: 'bronze' },
      ],
    },
    { name: 'description', type: 'textarea' },
  ],
}
