import React from 'react'
import { useDispatch } from 'react-redux'
import { useI18n } from 'twake-i18n'

import { useQuery, useMutation } from 'cozy-client'
import { isFlagshipApp } from 'cozy-device-helper'

import { SET_LANG } from '@/actions'
import Select from '@/components/Select'
import { useSetLang } from '@/hooks/useSetLang'
import { buildSettingsInstanceQuery } from '@/lib/queries'

const LANG_OPTIONS = ['en', 'fr', 'ru', 'vi']

const LanguageSection = () => {
  const { t } = useI18n()
  const dispatch = useDispatch()
  const { mutate, mutationStatus } = useMutation({
    onSuccess: data => {
      dispatch({ type: SET_LANG, lang: data.locale })
    }
  })

  const instanceQuery = buildSettingsInstanceQuery()
  const { data: instance } = useQuery(
    instanceQuery.definition,
    instanceQuery.options
  )

  const fieldProps = {
    title: t('ProfileView.locale.title'),
    label: t(`ProfileView.locale.label`),
    submitting: mutationStatus === 'loading',
    saved: mutationStatus === 'loaded',
    errors:
      mutationStatus === 'failed' ? ['ProfileView.infos.server_error'] : []
  }

  const selectedLocale = instance.locale

  const handleChange = sel => {
    mutate({
      _rev: instance.meta.rev,
      ...instance,
      attributes: {
        ...instance.attributes,
        locale: sel.value
      }
    })
  }

  // Flagship App side-effect to set the locale
  useSetLang(selectedLocale)

  return (
    <Select
      name="locale"
      options={LANG_OPTIONS.map(lang => {
        return {
          value: lang,
          label: t(`ProfileView.locale.${lang}`)
        }
      })}
      fieldProps={fieldProps}
      value={{
        value: selectedLocale,
        label: t(`ProfileView.locale.${selectedLocale}`, { _: '' })
      }}
      onChange={handleChange}
      isSearchable={!isFlagshipApp()}
    />
  )
}

export default LanguageSection
