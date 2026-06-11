import type { CollectionConfig } from 'payload'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  admin: { useAsTitle: 'alt' },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'public/media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 500, position: 'centre' },
      { name: 'hero', width: 1600, height: 900, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'caption', type: 'text' },
    {
      name: 'showInGallery',
      type: 'checkbox',
      label: 'Show in Gallery',
      defaultValue: false,
      admin: { description: 'Only checked images appear on the public gallery page' },
    },
    {
      name: 'year',
      type: 'number',
      label: 'Year',
      admin: { description: 'e.g. 2025 — used for year tabs on the gallery page' },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Match Day', value: 'match-day' },
        { label: 'Training', value: 'training' },
        { label: 'Team Photo', value: 'team-photo' },
        { label: 'Event', value: 'event' },
      ],
    },
  ],
}
