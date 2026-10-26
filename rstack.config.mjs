import { define } from 'rstack'
import { importOrderOptions } from 'rslint-config-cozy-app/basics'
import fmt from 'rslint-config-cozy-app/fmt'
import react from 'rslint-config-cozy-app/react'

define.lint(lint => [
  ...react(lint),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'import/order': [
        'warn',
        {
          ...importOrderOptions,
          pathGroups: [
            { pattern: '**/*.styl', group: 'index', position: 'after' },
            {
              pattern: '{cozy-*,cozy-*/**}',
              group: 'internal',
              position: 'after'
            },
            { pattern: 'test/**/*', group: 'index' },
            { pattern: 'lib/**/*', group: 'index' },
            { pattern: 'hooks/**/*', group: 'index' },
            { pattern: 'components/**/*', group: 'index' },
            { pattern: 'modules/**/*', group: 'index' },
            { pattern: 'assets/**/*', group: 'index' },
            { pattern: 'models/**/*', group: 'index' },
            { pattern: 'config/**/*', group: 'index' },
            { pattern: 'constants/**/*', group: 'index' },
            { pattern: 'locales/**/*', group: 'index' },
            { pattern: 'queries', group: 'index' },
            // ESLint could not resolve the @/ alias and sorted it last
            { pattern: '@/**', group: 'index', position: 'after' }
          ],
          pathGroupsExcludedImportTypes: ['{cozy-*,cozy-*/**}']
        }
      ]
    },
    languageOptions: {
      globals: {
        fixture: false
      }
    }
  }
])

define.fmt(fmt)
