import { render } from '@testing-library/react'
import React from 'react'

import { Q, useQuery, isQueryLoading, hasQueryBeenLoaded } from 'cozy-client'
import { BreakpointsProvider } from 'cozy-ui/transpiled/react/providers/Breakpoints'

import AppList from './AppList'

import { TestI18n } from '@/test/AppLike'

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
  return ({ narrow, children }) => (
    <div data-testid="page" data-narrow={narrow}>
      {children}
    </div>
  )
})

jest.mock('@/components/PageTitle', () => {
  return ({ children }) => <div data-testid="page-title">{children}</div>
})

jest.mock('cozy-ui/transpiled/react/Spinner', () => {
  return ({ size }) => <div data-testid="Spinner" data-size={size}></div>
})

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

jest.mock('cozy-ui-plus/dist/AppIcon', () => {
  return () => <div data-testid="AppIcon"></div>
})

jest.mock('cozy-ui/transpiled/react/ListItemText', () => {
  return ({ primary, secondary }) => (
    <div
      data-testid="ListItemText"
      data-primary={primary}
      data-secondary={secondary}
    ></div>
  )
})

describe('AppList', () => {
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
          permissions: {},
          slug: 'home',
          name: 'Home'
        },
        {
          permissions: {},
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
            apps: {
              type: 'io.cozy.apps',
              description:
                'Required by the cozy-bar to display the icons of the apps',
              verbs: ['GET']
            }
          },
          slug: 'alan',
          name: 'Alan'
        }
      ]
    }
    isQueryLoading.mockReturnValue(true)
    hasQueryBeenLoaded.mockReturnValue(true)
    Q.mockReturnValue({ getById: () => 'kfrf' })
    useQuery.mockReturnValueOnce(queryResultApps)
    useQuery.mockReturnValueOnce(queryResultKonnectors)
    useQuery.mockReturnValueOnce(queryResultApps)
    useQuery.mockReturnValueOnce(queryResultKonnectors)
  })
  it('should display appName when query has been loaded', () => {
    hasQueryBeenLoaded.mockReturnValue(true)
    const { container } = render(
      <BreakpointsProvider>
        <TestI18n>
          <AppList />
        </TestI18n>
      </BreakpointsProvider>
    )
    expect(container).toMatchSnapshot()
  })

  it('should render a spinner when query is loading and has not been loaded', () => {
    isQueryLoading.mockReturnValue(true)
    hasQueryBeenLoaded.mockReturnValue(false)
    const { queryByTestId } = render(
      <BreakpointsProvider>
        <TestI18n>
          <AppList />
        </TestI18n>
      </BreakpointsProvider>
    )
    expect(queryByTestId('Spinner')).toBeTruthy()
  })

  it('should display sorted app and konnector names when query is not loading', () => {
    isQueryLoading.mockReturnValue(false)
    const { getAllByTestId, container } = render(
      <BreakpointsProvider>
        <TestI18n>
          <AppList />
        </TestI18n>
      </BreakpointsProvider>
    )
    expect(container).toMatchSnapshot()
    expect(getAllByTestId('ListItemText')[1]).toHaveAttribute(
      'data-primary',
      'Contacts'
    )
    expect(getAllByTestId('ListItemText')[0]).toHaveAttribute(
      'data-primary',
      'Alan'
    )
  })

  it('should not display Home, Settings and Store when query is not loading', () => {
    isQueryLoading.mockReturnValue(false)
    const { queryByText } = render(
      <BreakpointsProvider>
        <TestI18n>
          <AppList />
        </TestI18n>
      </BreakpointsProvider>
    )
    expect(queryByText('Home')).toBeFalsy
    expect(queryByText('Settings')).toBeFalsy
    expect(queryByText('Store')).toBeFalsy
  })

  it('should render Permissions.failedRequest when query status is failed', () => {
    useQuery.mockReset()
    useQuery.mockReturnValue({ fetchStatus: 'failed' })
    const { queryByText } = render(
      <BreakpointsProvider>
        <TestI18n>
          <AppList />
        </TestI18n>
      </BreakpointsProvider>
    )
    expect(queryByText('The request has failed')).toBeTruthy()
  })
})
