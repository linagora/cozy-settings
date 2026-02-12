import { render } from '@testing-library/react'
import React from 'react'
import { useI18n } from 'twake-i18n'

import withAllLocales from './withAllLocales'

describe('withAllLocales', () => {
  it('should provide translations from CozyClient and CozySettings', () => {
    // Given
    let MyComponent = () => {
      const { t } = useI18n()
      return (
        <div>
          <p>{t('Permissions.write')}</p>
          <p>{t('CozyPermissions.io.cozy.accounts')}</p>
        </div>
      )
    }
    const MyTranslatedComponent = withAllLocales(MyComponent)

    // When
    const { getByText } = render(<MyTranslatedComponent />)

    // Then
    expect(getByText('Write')).toBeTruthy()
    expect(getByText('Login details')).toBeTruthy()
  })
})
