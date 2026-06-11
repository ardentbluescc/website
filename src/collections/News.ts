import type { CollectionConfig } from 'payload'

const isAuth = ({ req }: any) => !!req.user

export const News: CollectionConfig = {
  slug: 'news',
  access: { read: () => true, create: isAuth, update: isAuth, delete: isAuth },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'status'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Club News', value: 'club-news' },
        { label: 'Match Report', value: 'match-report' },
        { label: 'Announcement', value: 'announcement' },
        { label: 'Recruitment', value: 'recruitment' },
      ],
    },
    { name: 'excerpt', type: 'textarea' },
    { name: 'content', type: 'richText' },
    { name: 'coverImage', type: 'upload', relationTo: 'gallery' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
    { name: 'publishedAt', type: 'date' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
}
