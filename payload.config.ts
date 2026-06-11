import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './src/collections/Users'
import { Members } from './src/collections/Members'
import { News } from './src/collections/News'
import { Players } from './src/collections/Players'
import { Teams } from './src/collections/Teams'
import { Gallery } from './src/collections/Gallery'
import { Fixtures } from './src/collections/Fixtures'
import { Sponsors } from './src/collections/Sponsors'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Ardent Blues CC',
    },
    components: {
      views: {
        ScorecardImport: {
          Component: '@/components/admin/ScorecardImportView',
          path: '/scorecard-import',
          meta: {
            title: 'Scorecard Import',
            description: 'Import player stats from a match scorecard image',
          },
        },
      },
      afterNavLinks: ['@/components/admin/ScorecardNavLink'],
    },
  },
  collections: [Users, Members, News, Players, Teams, Gallery, Fixtures, Sponsors],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'ardent-blues-dev-secret',
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
})
