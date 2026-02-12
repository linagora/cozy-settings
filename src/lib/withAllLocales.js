import withLocales from 'twake-i18n/dist/withLocales'

const dictRequire = lang => {
  const cozyClientLocales = require(`cozy-client/dist/models/doctypes/locales/${lang}.json`)
  const cozySettingsLocales = require(`../locales/${lang}.json`)
  return { CozyPermissions: cozyClientLocales, ...cozySettingsLocales }
}

/**
 * @function
 * @description HOC to provide locales from CozyClient and from the application to components.
 * @param  {Function} Component - Component that need translations from CozyClient
 * @returns {Function} - Component that will receive translations from CozyClient and CozySettings
 */
export default withLocales(dictRequire)
