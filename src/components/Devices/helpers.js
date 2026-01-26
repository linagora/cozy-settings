import semver from 'semver'

import flag from 'cozy-flags'
import DeviceBrowserIcon from 'cozy-ui/transpiled/react/Icons/DeviceBrowser'
import LaptopIcon from 'cozy-ui/transpiled/react/Icons/Laptop'
import PhoneIcon from 'cozy-ui/transpiled/react/Icons/Phone'

import {
  DISPLAYED_CLIENTS,
  COZY_DESKTOP_SOFTWARE_ID
} from '@/lib/deviceConfigurationHelper'

const deviceKindToIcon = {
  mobile: PhoneIcon,
  browser: DeviceBrowserIcon
}

export const getDeviceIcon = device => {
  return deviceKindToIcon[device.client_kind] || LaptopIcon
}

const isCozyDesktopApp = device =>
  device.software_id === COZY_DESKTOP_SOFTWARE_ID

export const canConfigureDevice = device =>
  isCozyDesktopApp(device) &&
  (device.software_version
    ? semver.gte(device.software_version, '3.32.0-beta.3')
    : false)

/**
 * Get subtitle translation key with interpolation value
 * @param {number} deviceCount Number of connected devices
 * @returns array with the translation key and an object of interpolation value
 */
export const getSubtitle = deviceCount => {
  const flagValue = flag('cozy.oauthclients.max')

  if (flagValue !== null && flagValue >= 0) {
    return [
      'DevicesView.header.subtitle',
      { smart_count: deviceCount, limit: flagValue }
    ]
  }

  return [
    'DevicesView.header.subtitle_without_flag',
    { smart_count: deviceCount }
  ]
}

export const isNeverDisplayedDevice = device => {
  return device?.software_id === 'io.cozy.cloudery'
}

export const isDefaultDisplayedDevice = device => {
  return (
    DISPLAYED_CLIENTS.includes(device.client_kind) &&
    !device.pending &&
    !isNeverDisplayedDevice(device)
  )
}

export const isExpertDisplayedDevice = device => {
  return !isNeverDisplayedDevice(device)
}
