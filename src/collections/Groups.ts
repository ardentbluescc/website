import type { CollectionConfig } from 'payload'

const isAuth = ({ req }: any) => !!req.user

export const Groups: CollectionConfig = {
  slug: 'groups',
  access: { read: () => true, create: isAuth, update: isAuth, delete: isAuth },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'order'] },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'e.g. "Group 6" — shown as a tab on the Squad page' },
    },
    {
      name: 'order',
      type: 'number',
      admin: { description: 'Controls tab order on the Squad page (lower first)' },
    },
  ],
}
