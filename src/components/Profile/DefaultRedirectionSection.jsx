import React from 'react'
import { useI18n } from 'twake-i18n'

import { useClient, useQuery, useMutation } from 'cozy-client'
import { isFlagshipApp } from 'cozy-device-helper'
import { useWebviewIntent } from 'cozy-intent'

import {
  formatOptions,
  getSelectedOption,
  formatDefaultRedirection,
  shouldDisableDefaultRedirectionSnackbar,
  disableDefaultRedirectionSnackbar
} from './helpers'

import Select from '@/components/Select'
import {
  buildSettingsInstanceQuery,
  buildAppsQuery,
  buildHomeSettingsQuery
} from '@/lib/queries'

const DefaultRedirectionSection = () => {
  const { t } = useI18n()
  const webviewIntent = useWebviewIntent()
  const client = useClient()
  const { mutate, mutationStatus } = useMutation()

  const appsQuery = buildAppsQuery()
  const appsResult = useQuery(appsQuery.definition, appsQuery.options)

  const homeSettingsQuery = buildHomeSettingsQuery()
  const homeSettingsResult = useQuery(
    homeSettingsQuery.definition,
    homeSettingsQuery.options
  )

  const apps = appsResult.data || []
  const homeSettings =
    (homeSettingsResult.data && homeSettingsResult.data[0]) || {}

  const options = formatOptions(apps, t)

  const instanceQuery = buildSettingsInstanceQuery()
  const { data: instance } = useQuery(
    instanceQuery.definition,
    instanceQuery.options
  )

  const fieldProps = {
    title: t('ProfileView.default_redirection.title'),
    label: t(`ProfileView.default_redirection.label`),
    submitting: mutationStatus === 'loading',
    saved: mutationStatus === 'loaded',
    errors:
      mutationStatus === 'failed' ? ['ProfileView.infos.server_error'] : []
  }

  const selectedSlug = getSelectedOption(
    instance.default_redirection,
    options,
    t
  )

  const onChangeSelection = sel => {
    const newDefaultRedirection = formatDefaultRedirection(sel.value)
    mutate({
      _rev: instance.meta.rev,
      ...instance,
      attributes: {
        ...instance.attributes,
        default_redirection: newDefaultRedirection
      }
    })

    if (
      shouldDisableDefaultRedirectionSnackbar(
        instance.default_redirection,
        homeSettings
      )
    ) {
      disableDefaultRedirectionSnackbar(client, homeSettings)
    }

    if (isFlagshipApp()) {
      webviewIntent.call('setDefaultRedirection', newDefaultRedirection)
    }
  }

  return (
    <Select
      name="default_redirection"
      options={options.map(app => {
        return {
          value: app.slug,
          label: app.name
        }
      })}
      fieldProps={fieldProps}
      value={selectedSlug}
      onChange={onChangeSelection}
      isSearchable={!isFlagshipApp()}
    />
  )
}

export default DefaultRedirectionSection
