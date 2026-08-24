import { render, screen } from '@testing-library/react'
import React from 'react'

import { useInstanceInfo } from 'cozy-client'

import { MatrixIdSection } from '@/components/Profile/MatrixIdSection'

jest.mock('cozy-client', () => ({
  useInstanceInfo: jest.fn()
}))

jest.mock('twake-i18n', () => ({
  useI18n: () => ({ t: key => key })
}))

jest.mock('@/components/Input', () => ({
  __esModule: true,
  default: ({ value }) => <input readOnly value={value} />
}))

describe('MatrixIdSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useInstanceInfo.mockReturnValue({ instance: { data: {} } })
  })

  it('should render the matrix id it is given', () => {
    render(<MatrixIdSection matrixId="@john.doe:twake.app" />)

    expect(screen.getByDisplayValue('@john.doe:twake.app')).toBeTruthy()
  })

  it('should render nothing when the instance has no matrix id', () => {
    const { container } = render(<MatrixIdSection />)

    expect(container).toBeEmptyDOMElement()
  })
})
