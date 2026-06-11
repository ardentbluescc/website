import type { CollectionConfig } from 'payload'

export const Teams: CollectionConfig = {
  slug: 'teams',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'division', type: 'text' },
    { name: 'season', type: 'text' },
    { name: 'captain', type: 'relationship', relationTo: 'players' },
    { name: 'description', type: 'textarea' },
  ],
}
