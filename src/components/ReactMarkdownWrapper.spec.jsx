import { render } from '@testing-library/react'
import React from 'react'

import ReactMarkdownWrapper from '@/components/ReactMarkdownWrapper'

describe('ReactMarkdownWrapper', () => {
  it('should open links in a new tab without leaking the opener', () => {
    const { getByRole } = render(
      <ReactMarkdownWrapper source="[Twake](https://twake.app)" />
    )

    const link = getByRole('link', { name: 'Twake' })
    expect(link.getAttribute('href')).toBe('https://twake.app')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('should render blank-line separated text and emphasis as paragraphs', () => {
    const { container, getByText } = render(
      <ReactMarkdownWrapper source={'First\n\nSent to __me@example.com__'} />
    )

    expect(container.querySelectorAll('p').length).toBe(2)
    expect(getByText('me@example.com').tagName).toBe('STRONG')
  })
})
