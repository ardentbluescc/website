import type { CollectionConfig } from 'payload'

const isAuth = ({ req }: any) => !!req.user

export const Committee: CollectionConfig = {
  slug: 'committee',
  access: { read: () => true, create: isAuth, update: isAuth, delete: isAuth },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'role', 'order'] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Chairman", "Secretary (Primary Contact)"' },
    },
    { name: 'phone', type: 'text', admin: { description: 'e.g. 07587412519' } },
    { name: 'photo', type: 'upload', relationTo: 'gallery' },
    {
      name: 'order',
      type: 'number',
      admin: { description: 'Controls display order on the Committee page (lower first)' },
    },
  ],
}
