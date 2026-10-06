import { render } from '@testing-library/react'
import React from 'react'
import { useI18n } from 'twake-i18n'

import withAllLocales, { dictRequire } from './withAllLocales'

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

  describe('dictRequire', () => {
    const enDoctypes = require('cozy-client/dist/models/doctypes/locales/en.json')
    const frDoctypes = require('cozy-client/dist/models/doctypes/locales/fr.json')

    it('should use the doctypes translations of the language when they exist', () => {
      const dict = dictRequire('fr')

      expect(dict.CozyPermissions).toEqual(frDoctypes)
      expect(dict.Permissions).toEqual(
        require('../locales/fr.json').Permissions
      )
    })

    it.each(['es', 'de', 'it'])(
      'should fall back to the English doctypes translations for %s and keep the app translations',
      lang => {
        jest.isolateModules(() => {
          jest.doMock(
            `cozy-client/dist/models/doctypes/locales/${lang}.json`,
            () => {
              throw new Error(`Cannot find module '${lang}.json'`)
            },
            { virtual: true }
          )
          const {
            dictRequire: isolatedDictRequire
          } = require('./withAllLocales')

          const dict = isolatedDictRequire(lang)

          expect(dict.CozyPermissions).toEqual(enDoctypes)
          expect(dict.Permissions).toEqual(
            require(`../locales/${lang}.json`).Permissions
          )
          expect(dict.ProfileView.locale[lang]).toBeTruthy()
        })
        jest.dontMock(`cozy-client/dist/models/doctypes/locales/${lang}.json`)
      }
    )
  })
})
