import type { CollectionConfig } from 'payload'

const isAuth = ({ req }: any) => !!req.user

export const Committee: CollectionConfig = {
  slug: 'committee',
  // Drag-and-drop ordering in /admin → Committee controls the order on the Committee page.
  orderable: true,
  access: { read: () => true, create: isAuth, update: isAuth, delete: isAuth },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'role', 'phone'] },
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
      // Superseded by drag-and-drop; still used as a tiebreak until members have been dragged once
      admin: { hidden: true },
    },
  ],
}
