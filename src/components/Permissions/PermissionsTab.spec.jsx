import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { BreakpointsProvider } from 'cozy-ui/transpiled/react/providers/Breakpoints'

import PermissionsTab from './PermissionsTab'

jest.mock('twake-i18n/dist/withLocales', () => {
  return () => Component => {
    const t = text => text
    const match = { params: { page: 'slug' } }
    return () => <Component match={match} t={t} />
  }
})
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => {
  return {
    useParams: () => ({ page: 'slug' }),
    useNavigate: () => mockNavigate
  }
})

jest.mock('cozy-client')
jest.mock('@/components/PageTitle', () => {
  return ({ children }) => <div data-testid="pageTitle">{children}</div>
})
jest.mock(
  'cozy-ui/transpiled/react/Tabs',
  () =>
    ({ value, onChange, children }) =>
      (
        <button
          value={value}
          onClick={event => onChange(event, 'data')}
          data-testid="tabs"
        >
          {children}
        </button>
      )
)

jest.mock(
  'cozy-ui/transpiled/react/Tab',
  () =>
    ({ value, label, href, id, 'aria-controls': ariaControls }) =>
      (
        <div
          data-testid="tab"
          value={value}
          label={label}
          href={href}
          id={id}
          aria-controls={ariaControls}
        ></div>
      )
)

jest.mock('./AppList/AppList', () => {
  return () => <div data-testid="AppList"></div>
})

jest.mock('./DataList/DataList', () => {
  return () => <div data-testid="DataList"></div>
})

describe('PermissionsTab', () => {
  it('should match snapshot', () => {
    const { container } = render(
      <BreakpointsProvider>
        <PermissionsTab />
      </BreakpointsProvider>
    )
    expect(container).toMatchSnapshot()
  })
  it('should display AppList when Application Tab is selected', () => {
    const { queryByTestId } = render(
      <BreakpointsProvider>
        <PermissionsTab />
      </BreakpointsProvider>
    )
    expect(queryByTestId('AppList')).toBeTruthy()
  })

  it('should display DataList when Data Tab is selected', () => {
    const { getByTestId } = render(
      <BreakpointsProvider>
        <PermissionsTab />
      </BreakpointsProvider>
    )
    const tabs = getByTestId('tabs')
    fireEvent.click(tabs, { event: 'event' })
    expect(mockNavigate).toHaveBeenCalledWith('/permissions/data')
  })
})
