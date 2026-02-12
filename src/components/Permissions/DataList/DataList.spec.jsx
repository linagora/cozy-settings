import { render } from '@testing-library/react'
import React from 'react'

import { useQuery, isQueryLoading } from 'cozy-client'
import { BreakpointsProvider } from 'cozy-ui/transpiled/react/providers/Breakpoints'

import DataList from './DataList'

jest.mock('twake-i18n/dist/withLocales', () => () => Component => () => (
  <Component
    t={(text, { smart_count } = {}) =>
      smart_count ? `${text}${smart_count}` : text
    }
  />
))

jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual('react-router-dom'),
    Link: ({ narrow, children }) => (
      <div data-testid="page" data-narrow={narrow}>
        {children}
      </div>
    )
  }
})

jest.mock('cozy-client')

jest.mock('@/components/Page', () => {
  // eslint-disable-next-line react/display-name
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

jest.mock('cozy-ui/transpiled/react/Icon', () => {
  // eslint-disable-next-line react/display-name
  return () => <div data-testid="Icon"></div>
})

jest.mock('cozy-ui/transpiled/react/ListItemText', () => {
  // eslint-disable-next-line react/display-name
  return ({ primary, secondary }) => (
    <div
      data-testid="ListItemText"
      data-primary={primary}
      data-secondary={secondary}
    ></div>
  )
})

describe('DataList', () => {
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
          permissions: {},
          slug: 'alan',
          name: 'Alan'
        }
      ]
    }
    useQuery.mockReturnValueOnce(queryResultApps)
    useQuery.mockReturnValueOnce(queryResultKonnectors)
  })

  it('should display sorted permissions names when query is not loading', () => {
    isQueryLoading.mockReturnValue(false)
    const { queryAllByTestId } = render(
      <BreakpointsProvider>
        <DataList />
      </BreakpointsProvider>
    )
    expect(queryAllByTestId('ListItemText')[0]).toHaveAttribute(
      'data-primary',
      'CozyPermissions.io.cozy.apps'
    )
    expect(queryAllByTestId('ListItemText')[1]).toHaveAttribute(
      'data-primary',
      'CozyPermissions.io.cozy.files'
    )
    expect(queryAllByTestId('ListItemText')[2]).toHaveAttribute(
      'data-primary',
      'CozyPermissions.io.cozy.files.*'
    )
  })

  it('should display number of applications when query is not loading', () => {
    isQueryLoading.mockReturnValue(false)
    const { queryAllByTestId } = render(
      <BreakpointsProvider>
        <DataList />
      </BreakpointsProvider>
    )
    expect(queryAllByTestId('ListItemText')[0]).toHaveAttribute(
      'data-secondary',
      'Permissions.numberOfApplications1'
    )
    expect(queryAllByTestId('ListItemText')[1]).toHaveAttribute(
      'data-secondary',
      'Permissions.numberOfApplications1'
    )
    expect(queryAllByTestId('ListItemText')[2]).toHaveAttribute(
      'data-secondary',
      'Permissions.numberOfApplications1'
    )
  })

  it('should display permissions icons when query is not loading', () => {
    isQueryLoading.mockReturnValue(false)
    const { queryAllByTestId } = render(
      <BreakpointsProvider>
        <DataList />
      </BreakpointsProvider>
    )
    expect(queryAllByTestId('Icon').length).toEqual(6)
  })

  it('should render Permissions.failedRequest when query status is failed', () => {
    useQuery.mockReset()
    useQuery.mockReturnValue({ fetchStatus: 'failed' })
    const { queryByText } = render(
      <BreakpointsProvider>
        <DataList />
      </BreakpointsProvider>
    )
    expect(queryByText('Permissions.failedRequest')).toBeInTheDocument()
  })
})
