import type { CollectionConfig } from 'payload'

const isAuth = ({ req }: any) => !!req.user

export const Teams: CollectionConfig = {
  access: { read: () => true, create: isAuth, update: isAuth, delete: isAuth },
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
