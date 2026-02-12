import classNames from 'classnames'
import React, { useMemo, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useI18n } from 'twake-i18n'

import { isQueryLoading, useQuery } from 'cozy-client'
import flag from 'cozy-flags'
import MuiButton from 'cozy-ui/transpiled/react/Button'
import Icon from 'cozy-ui/transpiled/react/Icon'
import SyncIcon from 'cozy-ui/transpiled/react/Icons/Sync'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import Alerter from 'cozy-ui/transpiled/react/deprecated/Alerter'
import { Media, Img, Bd } from 'cozy-ui/transpiled/react/deprecated/Media'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell
} from 'cozy-ui/transpiled/react/deprecated/Table'
import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'

import tableStyles from '@/styles/table.styl'

import { DevicesEmpty } from '@/components/Devices/DevicesEmpty'
import DevicesModaleConfigureView from '@/components/Devices/DevicesModaleConfigureView'
import DevicesModaleCreateOAuthClient from '@/components/Devices/DevicesModaleCreateOAuthClient'
import { DevicesModaleRevokeView } from '@/components/Devices/DevicesModaleRevokeView'
import { DevicesMoreMenu } from '@/components/Devices/DevicesMoreMenu'
import {
  getDeviceIcon,
  canConfigureDevice,
  getSubtitle,
  isDefaultDisplayedDevice,
  isExpertDisplayedDevice,
  isNeverDisplayedDevice
} from '@/components/Devices/helpers'
import Page from '@/components/Page'
import { PageHeader } from '@/components/PageHeader'
import { PremiumLink } from '@/components/Premium/PremiumLink'
import { buildDevicesQuery } from '@/lib/queries'

const DevicesView = () => {
  const { t, f, lang } = useI18n()
  const navigate = useNavigate()
  const { deviceId } = useParams()
  const location = useLocation()
  const { isMobile } = useBreakpoints()

  const [deviceToConfigure, setDeviceToConfigure] = useState(null)
  const [deviceToRevoke, setDeviceToRevoke] = useState(null)
  const [isCreateOAuthClientModalOpen, setIsCreateOAuthClientModalOpen] =
    useState(false)

  const devicesQuery = buildDevicesQuery()
  const { data, hasMore, fetchMore, fetchStatus } = useQuery(
    devicesQuery.definition,
    devicesQuery.options
  )

  const isExpertMode = flag('settings.devices.expert')

  const devices = useMemo(
    () =>
      Array.isArray(data)
        ? data
            .filter(device => {
              if (isNeverDisplayedDevice(device)) return false
              return isExpertMode
                ? isExpertDisplayedDevice(device)
                : isDefaultDisplayedDevice(device)
            })
            .sort((a, b) => {
              return a.client_name.localeCompare(b.client_name, lang, {
                sensitivity: 'base',
                numeric: true
              })
            })
        : [],
    [data, isExpertMode, lang]
  )

  const isFetching = useMemo(
    () => isQueryLoading({ fetchStatus }) || hasMore,
    [fetchStatus, hasMore]
  )

  const onDeviceConfigurationCanceled = () => {
    if (deviceId) {
      navigate(location.pathname.replace(`/${deviceId}`, ''))
    }
    setDeviceToConfigure(null)
  }
  const onDeviceConfigured = () => {
    if (deviceId) {
      navigate(location.pathname.replace(`/${deviceId}`, ''))
    }
    setDeviceToConfigure(null)
  }

  useMemo(() => {
    if (fetchStatus === 'failed') {
      Alerter.error(t('DevicesView.load_error'))
    } else if (hasMore) {
      fetchMore()
    } else if (deviceId && !isFetching) {
      const device = devices.find(d => d.id === deviceId)
      if (device != null && deviceToConfigure == null) {
        setDeviceToConfigure(device)
      } else if (device == null) {
        Alerter.error(t('DevicesView.device_load_error'))
      }
    }
  }, [
    fetchStatus,
    hasMore,
    deviceId,
    isFetching,
    t,
    fetchMore,
    devices,
    deviceToConfigure
  ])

  const hasUnlimitedDevices = flag('cozy.oauthclients.max') === -1

  return (
    <Page
      withoutVerticalMargin={isMobile}
      fullHeight
      className="u-flex u-flex-column u-pb-3 u-mt-1-half-s"
    >
      <PageHeader
        title={t('DevicesView.header.title')}
        subtitle={!isFetching ? t(...getSubtitle(devices.length)) : null}
        actions={
          <>
            {isExpertMode && (
              <MuiButton
                variant="outlined"
                color="primary"
                className="u-mr-half"
                onClick={() => {
                  setIsCreateOAuthClientModalOpen(true)
                }}
              >
                {t('DevicesView.create_oauth_client')}
              </MuiButton>
            )}

            {!hasUnlimitedDevices ? (
              <PremiumLink
                variant="secondary"
                label={t('DevicesView.header.subscribe')}
                fullWidth={false}
              />
            ) : null}
          </>
        }
      />

      {isCreateOAuthClientModalOpen ? (
        <DevicesModaleCreateOAuthClient
          onClose={() => {
            setIsCreateOAuthClientModalOpen(false)
          }}
        />
      ) : null}

      {isFetching ? (
        <Spinner
          className="u-pos-fixed-s"
          middle
          size="xxlarge"
          loadingType="loading"
        />
      ) : devices.length === 0 ? (
        <DevicesEmpty />
      ) : (
        <Table className={tableStyles['coz-table']}>
          {deviceToRevoke != null ? (
            <DevicesModaleRevokeView
              cancelAction={() => {
                setDeviceToRevoke(null)
              }}
              onDeviceRevoked={() => {
                setDeviceToRevoke(null)
              }}
              device={deviceToRevoke}
            />
          ) : null}
          {deviceToConfigure != null ? (
            <DevicesModaleConfigureView
              cancelAction={onDeviceConfigurationCanceled}
              onDeviceConfigured={onDeviceConfigured}
              device={deviceToConfigure}
            />
          ) : null}
          <TableHead>
            <TableRow>
              <TableHeader className={tableStyles['set-table-name']}>
                {t('DevicesView.head_name')}
              </TableHeader>
              <TableHeader
                className={classNames(
                  tableStyles['coz-table-header'],
                  tableStyles['set-table-date']
                )}
              >
                {t('DevicesView.head_sync')}
              </TableHeader>
              <TableHeader
                className={classNames(
                  tableStyles['coz-table-header'],
                  tableStyles['set-table-actions']
                )}
              >
                {t('DevicesView.head_actions')}
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody className={tableStyles['set-table-devices']}>
            {devices.map(device => (
              <TableRow
                key={device.id}
                className={tableStyles['set-table-row']}
              >
                <TableCell
                  className={classNames(
                    tableStyles['set-table-name'],
                    tableStyles['coz-table-primary']
                  )}
                >
                  <Media>
                    <Img>
                      <Icon icon={getDeviceIcon(device)} size={32} />
                    </Img>
                    <Bd className="u-ml-1">
                      <span className={tableStyles['set-table-info-name']}>
                        {device.client_name}
                        {device.pending && (
                          <span className="u-ml-half">
                            {t('DevicesView.pending')}
                          </span>
                        )}
                      </span>
                      {isMobile && (
                        <span className={tableStyles['set-table-info-date']}>
                          <Icon
                            icon={SyncIcon}
                            size={8}
                            color="var(--secondaryTextColor)"
                          />
                          {device.synchronized_at
                            ? f(
                                device.synchronized_at,
                                t('DevicesView.sync_date_format')
                              )
                            : '-'}
                        </span>
                      )}
                    </Bd>
                    {isMobile && (
                      <DevicesMoreMenu
                        device={device}
                        onRevoke={() => {
                          setDeviceToRevoke(device)
                        }}
                        onConfigure={() => {
                          setDeviceToConfigure(device)
                        }}
                        isMobile
                      />
                    )}
                  </Media>
                </TableCell>
                <TableCell className={tableStyles['set-table-date']}>
                  {device.synchronized_at
                    ? f(
                        device.synchronized_at,
                        t('DevicesView.sync_date_format')
                      )
                    : '-'}
                </TableCell>
                <TableCell className={tableStyles['set-table-actions']}>
                  <>
                    <MuiButton
                      color="primary"
                      onClick={() => {
                        if (isNeverDisplayedDevice(device)) return
                        setDeviceToRevoke(device)
                      }}
                      disabled={isNeverDisplayedDevice(device)}
                    >
                      {t('DevicesView.revoke')}
                    </MuiButton>
                    {canConfigureDevice(device) ? (
                      <MuiButton
                        color="primary"
                        onClick={() => {
                          setDeviceToConfigure(device)
                        }}
                      >
                        {t('DevicesView.configure')}
                      </MuiButton>
                    ) : null}
                  </>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Page>
  )
}

export { DevicesView }
