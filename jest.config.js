module.exports = {
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'styl'],
  setupFilesAfterEnv: ['<rootDir>/test/jestLib/setup.js'],
  moduleDirectories: ['<rootDir>/src', 'node_modules'],
  moduleNameMapper: {
    '\\.(png|gif|jpe?g|svg)$': '<rootDir>/test/__mocks__/fileMock.js',
    // identity-obj-proxy module is installed by cozy-scripts
    '^styles': 'identity-obj-proxy',
    '\\.styl$': 'identity-obj-proxy',
    '\\.css$': 'identity-obj-proxy',
    '^cozy-ui/react(.*)$': '<rootDir>/node_modules/cozy-ui/transpiled/react$1',
    '^cozy-client$': 'cozy-client/dist/index.js',
    'test/(.*)$': '<rootDir>/test/$1',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transformIgnorePatterns: ['node_modules/(?!cozy-ui)/'],
  transform: {
    '\\.(js|jsx|mjs)$': [
      '@swc/jest',
      {
        jsc: {
          experimental: {
            plugins: [['@swc-contrib/mut-cjs-exports', {}]]
          },
          parser: {
            jsx: true
          }
        }
      }
    ],
    '\\.(ts|tsx)$': [
      '@swc/jest',
      {
        jsc: {
          experimental: {
            plugins: [['@swc-contrib/mut-cjs-exports', {}]]
          },
          parser: {
            syntax: 'typescript',
            tsx: true
          }
        }
      }
    ]
  },
  globals: {
    __ALLOW_HTTP__: false,
    __TARGET__: 'browser',
    cozy: {}
  },
  testEnvironment: 'jsdom',
  resolver: '<rootDir>/test/jestLib/resolver.js'
}
