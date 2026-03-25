import cozyApp from 'eslint-config-cozy-app/react'

export default [
  ...cozyApp,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'import/order': [
        'warn',
        {
          alphabetize: { order: 'asc' },
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index']
          ],
          pathGroups: [
            {
              pattern: '{cozy-*,cozy-*/**}',
              group: 'internal',
              position: 'after'
            },
            {
              pattern: '**/*.styl',
              group: 'index',
              position: 'after'
            },
            {
              pattern: 'test/**/*',
              group: 'index'
            },
            {
              pattern: 'lib/**/*',
              group: 'index'
            },
            {
              pattern: 'hooks/**/*',
              group: 'index'
            },
            {
              pattern: 'components/**/*',
              group: 'index'
            },
            {
              pattern: 'modules/**/*',
              group: 'index'
            },
            {
              pattern: 'assets/**/*',
              group: 'index'
            },
            {
              pattern: 'models/**/*',
              group: 'index'
            },
            {
              pattern: 'config/**/*',
              group: 'index'
            },
            {
              pattern: 'constants/**/*',
              group: 'index'
            },
            {
              pattern: 'config/**/*',
              group: 'index'
            },
            {
              pattern: 'locales/**/*',
              group: 'index'
            },
            {
              pattern: 'queries',
              group: 'index'
            }
          ],
          distinctGroup: true,
          pathGroupsExcludedImportTypes: ['{cozy-*,cozy-*/**}'],
          'newlines-between': 'always',
          warnOnUnassignedImports: true
        }
      ]
    },
    languageOptions: {
      globals: {
        fixture: false
      }
    }
  }
]
