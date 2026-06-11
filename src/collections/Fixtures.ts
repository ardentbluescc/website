import type { CollectionConfig } from 'payload'

const isAuth = ({ req }: any) => !!req.user

export const Fixtures: CollectionConfig = {
  access: { read: () => true, create: isAuth, update: isAuth, delete: isAuth },
  slug: 'fixtures',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'competition', 'matchDate', 'result'],
  },
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'competition',
      type: 'select',
      options: [
        { label: 'Mercury Senior League', value: 'senior-league' },
        { label: 'Junior League', value: 'junior-league' },
        { label: 'T20 Bowl', value: 't20-bowl' },
        { label: 'Junior Cup', value: 'junior-cup' },
        { label: 'Friendly', value: 'friendly' },
      ],
    },
    { name: 'matchDate', type: 'date', required: true },
    { name: 'venue', type: 'text' },
    { name: 'homeTeam', type: 'text' },
    { name: 'awayTeam', type: 'text' },
    { name: 'homeScore', type: 'text' },
    { name: 'awayScore', type: 'text' },
    {
      name: 'result',
      type: 'select',
      defaultValue: 'upcoming',
      options: [
        { label: 'Win', value: 'win' },
        { label: 'Loss', value: 'loss' },
        { label: 'Draw', value: 'draw' },
        { label: 'No Result', value: 'no-result' },
        { label: 'Upcoming', value: 'upcoming' },
      ],
    },
    { name: 'report', type: 'richText' },
  ],
}
