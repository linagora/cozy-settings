import { render } from '@testing-library/react'
import React from 'react'

import { useQuery, isQueryLoading, hasQueryBeenLoaded } from 'cozy-client'

import DataPermissions from './DataPermissions'

jest.mock('twake-i18n/dist/withLocales', () => {
  return () => Component => {
    const t = text => text
    const match = { params: { permission: 'io.cozy.apps' } }
    return () => <Component match={match} t={t} />
  }
})

jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ permissionType: 'io.cozy.files' }),
    useNavigate: jest.fn()
  }
})

jest.mock('cozy-client')

jest.mock('@/components/Page', () => {
  return ({ narrow, children }) => (
    <div data-testid="page" data-narrow={narrow}>
      {children}
    </div>
  )
})

jest.mock('@/components/PageTitle', () => ({ children }) => (
  <div data-testid="page-title">{children}</div>
))

jest.mock('cozy-ui/transpiled/react/NavigationList', () => {
  return {
    __esModule: true,
    default: ({ children }) => (
      <div data-testid="NavigationList">{children}</div>
    ),
    NavigationListSection: ({ children }) => (
      <div data-testid="NavigationListSection">{children}</div>
    )
  }
})

jest.mock('cozy-ui/transpiled/react/Icon', () => ({ icon, size }) => (
  <div data-size={size} data-testid="Icon">
    {icon()}
  </div>
))

jest.mock('cozy-ui/transpiled/react/ListItemText', () => {
  return ({ primary }) => (
    <div data-testid="ListItemText" data-primary={primary}></div>
  )
})
jest.mock('cozy-ui/transpiled/react/Spinner', () => {
  return ({ size }) => <div data-testid="Spinner" data-size={size}></div>
})

jest.mock('cozy-ui-plus/dist/AppIcon', () => {
  // eslint-disable-next-line react/display-name
  return () => <div data-testid="AppIcon"></div>
})
jest.mock('cozy-ui/transpiled/react/Spinner', () => {
  return ({ size }) => <div data-testid="Spinner" data-size={size}></div>
})

describe('DataPermissions', () => {
  beforeEach(() => {
    const queryResultApps = {
      fetchStatus: 'loaded',
      data: [
        {
          permissions: {
            files: {
              type: 'io.cozy.files',
              description: 'Required to access the files'
            },
            allFiles: {
              type: 'io.cozy.files.*',
              description: 'Required to access the files'
            },
            apps: {
              type: 'io.cozy.apps',
              description:
                'Required by the cozy-bar to display the icons of the apps',
              verbs: ['GET']
            }
          },
          slug: 'contacts',
          name: 'Contacts'
        },
        {
          permissions: {
            files: {
              type: 'io.cozy.files',
              description: 'Required to access the files'
            },
            apps: {
              type: 'io.cozy.apps',
              description:
                'Required by the cozy-bar to display the icons of the apps',
              verbs: ['GET']
            }
          },
          slug: 'home',
          name: 'Home'
        },
        {
          permissions: {
            files: {
              type: 'io.cozy.files',
              description: 'Required to access the files'
            }
          },
          slug: 'settings',
          name: 'Settings'
        },
        {
          permissions: {},
          slug: 'store',
          name: 'Store'
        }
      ]
    }
    const queryResultKonnectors = {
      fetchStatus: 'loaded',
      data: [
        {
          permissions: {
            files: {
              type: 'io.cozy.files',
              description: 'Required to access the files'
            }
          },
          slug: 'alan',
          name: 'Alan'
        }
      ]
    }
    useQuery.mockReturnValueOnce(queryResultApps)
    useQuery.mockReturnValueOnce(queryResultKonnectors)
    isQueryLoading.mockReturnValue(false)
    hasQueryBeenLoaded.mockReturnValue(true)
  })

  it('should display DataPermissions', () => {
    const { container } = render(<DataPermissions />)
    expect(container).toMatchSnapshot()
  })

  it('should display Contacts permissions because it matches the route param', () => {
    const { container } = render(<DataPermissions />)
    expect(container.querySelectorAll('[data-primary]')[1]).toHaveAttribute(
      'data-primary',
      'Contacts'
    )
  })

  it('should display Alan permissions because it matches the route param', () => {
    const { container } = render(<DataPermissions />)
    expect(container.querySelector('[data-primary]')).toHaveAttribute(
      'data-primary',
      'Alan'
    )
  })

  it('should render a spinner when query is loading and has not been loaded', () => {
    isQueryLoading.mockReturnValue(true)
    hasQueryBeenLoaded.mockReturnValue(false)
    const { queryByTestId } = render(<DataPermissions />)
    expect(queryByTestId('Spinner')).toBeInTheDocument()
  })

  it('should render Permissions.failedRequest when query status is failed', () => {
    useQuery.mockRestore()
    useQuery.mockReturnValueOnce({ fetchStatus: 'failed' })
    useQuery.mockReturnValueOnce({ fetchStatus: 'failed' })
    const { queryByText } = render(<DataPermissions />)
    expect(queryByText('Permissions.failedRequest')).toBeInTheDocument()
  })
})
