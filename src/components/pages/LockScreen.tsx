import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useI18n } from 'twake-i18n'

import { getFlagshipMetadata, isFlagshipApp } from 'cozy-device-helper'
import flag from 'cozy-flags'
import { useWebviewIntent, WebviewService } from 'cozy-intent'
import FaceId from 'cozy-ui/transpiled/react/Icons/FaceId'
import Fingerprint from 'cozy-ui/transpiled/react/Icons/Fingerprint'
import Password from 'cozy-ui/transpiled/react/Icons/Password'
import Swap from 'cozy-ui/transpiled/react/Icons/Swap'
import List from 'cozy-ui/transpiled/react/List'

import Page from '@/components/Page'
import PageTitle from '@/components/PageTitle'
import { BiometryDeniedDialog } from '@/components/dialogs/BiometryDeniedDialog'
import { PinCodeDialog } from '@/components/dialogs/PinCodeDialog'
import { MenuItemSwitch } from '@/components/menu/MenuItemSwitch'
import logger from '@/lib/logger'

const handleChange = async (
  dispatch: React.Dispatch<React.SetStateAction<boolean>>,
  setting: 'biometryLock' | 'autoLock' | 'PINLock',
  webviewIntent?: WebviewService,
  params?: Record<string, unknown>
): Promise<boolean | null | undefined> => {
  if (!webviewIntent) return

  const res = await webviewIntent.call('toggleSetting', setting, params)

  typeof res === 'boolean'
    ? dispatch(res)
    : logger.error(
        `Error while calling toggleSetting('${setting}'), returned value is null or undefined."`
      )

  return res
}

export const LockScreen = (): JSX.Element => {
  const { t } = useI18n()
  const webviewIntent = useWebviewIntent()
  const flagshipMetadata = getFlagshipMetadata()
  const [pinModalVisible, setPinModalVisible] = useState(false)
  const [biometryDeniedDialogVisible, setBiometryDeniedDialogVisible] =
    useState(false)
  const [biometryEnabled, setBiometry] = useState(
    Boolean(flagshipMetadata.settings_biometryEnabled)
  )
  const [pinCodeEnabled, setPinCode] = useState(
    Boolean(flagshipMetadata.settings_PINEnabled)
  )
  const [autoLockEnabled, setAutoLock] = useState(
    Boolean(flagshipMetadata.settings_autoLockEnabled)
  )
  const biometryAvailable = Boolean(flagshipMetadata.biometry_available)
  const biometryAuthorisationDenied = Boolean(
    flagshipMetadata.biometry_authorisation_denied
  )
  const showBiometryOption = biometryAvailable || biometryAuthorisationDenied
  const biometryType = flagshipMetadata.biometry_type

  const onBiometryLock = (): void => {
    const doOnBiometryLock = async (): Promise<void> => {
      if (!webviewIntent) return

      // We don't want to use local state here as on first access the authorisation
      // can be denied from the OS dialog and then the authorization would be
      // updated during the app's lifecycle (which is not the case when editing
      // OS settings)
      const isBiometryDenied = await webviewIntent.call('isBiometryDenied')

      if (isBiometryDenied) {
        return setBiometryDeniedDialogVisible(true)
      }

      if (!biometryEnabled && flagshipMetadata.platform?.OS === 'android')
        await webviewIntent.call('setFlagshipUI', {
          bottomOverlay: 'rgba(0,0,0,0.5)',
          topOverlay: 'rgba(0,0,0,0.5)'
        })

      const value = await handleChange(
        setBiometry,
        'biometryLock',
        webviewIntent
      )

      value && setAutoLock(true)

      if (!biometryEnabled && flagshipMetadata.platform?.OS === 'android')
        await webviewIntent.call('setFlagshipUI', {
          bottomOverlay: 'transparent',
          topOverlay: 'transparent'
        })
    }

    doOnBiometryLock().catch(onrejected =>
      logger.error(
        `Error while calling onBiometryLock(), see error:`,
        onrejected
      )
    )
  }

  const onPinCodeLock = async (pinCode?: string): Promise<void> => {
    if (!pinCodeEnabled && !pinCode) return setPinModalVisible(true)

    const value = await handleChange(
      setPinCode,
      'PINLock',
      webviewIntent,
      pinCode ? { pinCode } : undefined
    )

    value && setAutoLock(true)

    pinCode && setPinModalVisible(false)
  }

  const onAutoLock = (): void =>
    void handleChange(setAutoLock, 'autoLock', webviewIntent)

  return isFlagshipApp() || flag('settings.flagship-mode') ? (
    <Page withoutMargin>
      <PageTitle>{t('LockScreenView.title')}</PageTitle>

      <nav>
        <List>
          <MenuItemSwitch
            checked={autoLockEnabled}
            icon={Swap}
            onClick={onAutoLock}
            primary={t('Nav.primary_lock_switch')}
          />

          {showBiometryOption && (
            <MenuItemSwitch
              primary={
                biometryType === 'Biometrics'
                  ? t('Nav.primary_biometry_android')
                  : biometryType === 'TouchID'
                  ? t('Nav.primary_biometry_touchid')
                  : biometryType === 'FaceID'
                  ? t('Nav.primary_biometry_faceid')
                  : t('Nav.primary_biometry')
              }
              icon={biometryType === 'FaceID' ? FaceId : Fingerprint}
              onClick={onBiometryLock}
              checked={biometryEnabled && !biometryAuthorisationDenied}
            />
          )}

          <MenuItemSwitch
            checked={pinCodeEnabled}
            icon={Password}
            onClick={(): void => void onPinCodeLock()}
            primary={t('Nav.primary_pin_switch')}
          />
        </List>
      </nav>

      {pinModalVisible && (
        <PinCodeDialog
          setPinCode={(pinCode): void => void onPinCodeLock(pinCode)}
          setModalVisible={setPinModalVisible}
        />
      )}

      {biometryDeniedDialogVisible && (
        <BiometryDeniedDialog
          setModalVisible={setBiometryDeniedDialogVisible}
        />
      )}
    </Page>
  ) : (
    <Navigate to=".." />
  )
}
