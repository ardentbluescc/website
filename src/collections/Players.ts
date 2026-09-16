import type { CollectionConfig } from 'payload'

const isAuth = ({ req }: any) => !!req.user

export const Players: CollectionConfig = {
  slug: 'players',
  access: { read: () => true, create: isAuth, update: isAuth, delete: isAuth },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'group', 'jerseyNumber', 'role', 'battingStyle'],
    components: {
      beforeListTable: ['@/components/admin/RecentFormFetchAllButton', '@/components/admin/ExportPlayersButton'],
    },
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { description: 'URL identifier — auto-filled from name on create, e.g. "upanish-anil"' },
      hooks: {
        beforeChange: [
          (args: any) => {
            const { value, data } = args
            if (!value && data?.name) {
              return data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    { name: 'jerseyNumber', type: 'number', admin: { description: 'Shown on the jersey in the player card' } },
    {
      name: 'group',
      type: 'select',
      options: [
        { label: 'Group 1', value: 'group-1' },
        { label: 'Group 2', value: 'group-2' },
        { label: 'Group 3', value: 'group-3' },
        { label: 'Group 4', value: 'group-4' },
        { label: 'Group 5', value: 'group-5' },
      ],
      admin: { description: 'Squad group / team tier' },
    },
    { name: 'photo', type: 'upload', relationTo: 'gallery' },
    { name: 'team', type: 'relationship', relationTo: 'teams' },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Batsman', value: 'batsman' },
        { label: 'Bowler', value: 'bowler' },
        { label: 'All-Rounder', value: 'all-rounder' },
        { label: 'Wicket-Keeper', value: 'keeper' },
      ],
    },
    {
      name: 'battingStyle',
      type: 'select',
      options: [
        { label: 'Right-hand bat', value: 'rhb' },
        { label: 'Left-hand bat', value: 'lhb' },
      ],
    },
    { name: 'age', type: 'number' },
    { name: 'dob', type: 'date', admin: { description: 'Date of birth' } },
    { name: 'bowlingStyle', type: 'text', admin: { description: 'e.g. Right-arm fast, Left-arm spin' } },
    { name: 'bio', type: 'textarea' },
    { name: 'isCaptain', type: 'checkbox', defaultValue: false },
    {
      name: 'recentFormFetch',
      type: 'ui',
      label: 'Match History',
      admin: {
        position: 'sidebar',
        components: { Field: '@/components/admin/RecentFormFetchButton' },
      },
    },
    {
      name: 'exportPlayer',
      type: 'ui',
      label: 'Export',
      admin: {
        position: 'sidebar',
        components: { Field: '@/components/admin/ExportPlayerButton' },
      },
    },

    // Batting & Fielding stats per league/format
    {
      name: 'battingStats',
      type: 'array',
      label: 'Batting & Fielding Stats',
      admin: { description: 'Add one row per league or format' },
      fields: [
        { name: 'format', type: 'text', required: true, admin: { description: 'e.g. "NCU Junior League 5 · 2026" — matches from same competition+year are merged automatically' } },
        { name: 'matches', type: 'number' },
        { name: 'innings', type: 'number' },
        { name: 'notOut', type: 'number', label: 'Not Out' },
        { name: 'runs', type: 'number' },
        { name: 'balls', type: 'number', label: 'Balls faced', admin: { description: 'Used to recompute SR across merged matches' } },
        { name: 'highScore', type: 'text', label: 'High Score', admin: { description: 'e.g. 149 or 149*' } },
        { name: 'average', type: 'number' },
        { name: 'strikeRate', type: 'number', label: 'Strike Rate' },
        { name: 'hundreds', type: 'number', label: "100's" },
        { name: 'fifties', type: 'number', label: "50's" },
        { name: 'fours', type: 'number', label: '4s' },
        { name: 'sixes', type: 'number', label: '6s' },
        { name: 'catches', type: 'number', label: 'Catches' },
        { name: 'stumpings', type: 'number', label: 'Stumpings' },
        { name: 'runOuts', type: 'number', label: 'Run Outs', admin: { description: 'Run outs effected as a fielder' } },
        {
          name: 'importedMatchIds', type: 'text', hasMany: true,
          admin: { hidden: true, description: 'NV Play match IDs already merged into this row — prevents double-import' },
        },
      ],
    },

    // Bowling stats per league/format
    {
      name: 'bowlingStats',
      type: 'array',
      label: 'Bowling Stats',
      admin: { description: 'Add one row per league or format' },
      fields: [
        { name: 'format', type: 'text', required: true, admin: { description: 'e.g. Senior League 2, T20 Bowl' } },
        { name: 'matches', type: 'number' },
        { name: 'innings', type: 'number' },
        { name: 'balls', type: 'number' },
        { name: 'runs', type: 'number' },
        { name: 'wickets', type: 'number', label: 'Wickets' },
        { name: 'bestBowling', type: 'text', label: 'Best Bowling', admin: { description: 'e.g. 4/23' } },
        { name: 'average', type: 'number' },
        { name: 'economy', type: 'number', label: 'Economy' },
        { name: 'strikeRate', type: 'number', label: 'Strike Rate' },
        { name: 'fourWickets', type: 'number', label: '4W' },
        { name: 'fiveWickets', type: 'number', label: '5W' },
        {
          name: 'importedMatchIds', type: 'text', hasMany: true,
          admin: { hidden: true, description: 'NV Play match IDs already merged into this row — prevents double-import' },
        },
      ],
    },

    // Per-match log — powers the "Recent Form" list on the player page.
    // Purely additive: independent of battingStats/bowlingStats, one row per match played.
    {
      name: 'matchLog',
      type: 'array',
      label: 'Match Log (Recent Form)',
      admin: { description: 'One row per match — auto-filled by the NV Play importer, powers the Recent Form list on the player page' },
      fields: [
        { name: 'matchId', type: 'text', required: true, admin: { description: 'NV Play match ID — used to dedupe and link out to the full scorecard' } },
        { name: 'date', type: 'date' },
        { name: 'competition', type: 'text' },
        { name: 'teamLabel', type: 'text', admin: { description: 'Ardent Blues side, e.g. "Ardent Blues 3rd XI"' } },
        { name: 'opponent', type: 'text' },
        { name: 'result', type: 'text' },
        { name: 'didBat', type: 'checkbox', defaultValue: false },
        { name: 'runs', type: 'number' },
        { name: 'balls', type: 'number' },
        { name: 'notOut', type: 'checkbox', defaultValue: false },
        { name: 'didBowl', type: 'checkbox', defaultValue: false },
        { name: 'overs', type: 'number' },
        { name: 'maidens', type: 'number' },
        { name: 'runsConceded', type: 'number' },
        { name: 'wickets', type: 'number' },
        { name: 'catches', type: 'number' },
        { name: 'stumpings', type: 'number' },
        { name: 'runOuts', type: 'number' },
      ],
    },
  ],
}
