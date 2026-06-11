import type { CollectionConfig } from 'payload'

export const Sponsors: CollectionConfig = {
  slug: 'sponsors',
  admin: { useAsTitle: 'name' },
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
