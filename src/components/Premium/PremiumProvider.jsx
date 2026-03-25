import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo
} from 'react'

import { useInstanceInfo } from 'cozy-client'
import {
  buildPremiumLink,
  arePremiumLinksEnabled
} from 'cozy-client/dist/models/instance'
import { isFlagshipApp } from 'cozy-device-helper'
import flag from 'cozy-flags'
import { useWebviewIntent } from 'cozy-intent'

const PremiumContext = createContext()

const usePremium = () => useContext(PremiumContext)

const PremiumProvider = ({ children }) => {
  const instance = useInstanceInfo()
  const premiumLink = buildPremiumLink(instance)
  const webviewIntent = useWebviewIntent()
  const [hasIAP, setIAP] = useState(false)
  const [isIapLoaded, setIapLoaded] = useState(false)

  useEffect(() => {
    const fetchIapAvailability = async () => {
      const isAvailable =
        (await webviewIntent?.call('isAvailable', 'iap')) ?? false
      const isEnabled = !!flag('flagship.iap.enabled')
      setIAP(isAvailable && isEnabled)
      setIapLoaded(true)
    }

    if (isFlagshipApp()) {
      fetchIapAvailability()
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIapLoaded(true)
    }
  }, [webviewIntent])

  const canOpenPremiumLink =
    arePremiumLinksEnabled(instance) && (!isFlagshipApp() || hasIAP)

  const premiumData = useMemo(
    () => ({
      isLoaded: (instance.isLoaded && isIapLoaded) ?? false,
      hasIAP,
      canOpenPremiumLink,
      premiumLink
    }),
    [canOpenPremiumLink, hasIAP, instance.isLoaded, isIapLoaded, premiumLink]
  )

  return (
    <PremiumContext.Provider value={premiumData}>
      {children}
    </PremiumContext.Provider>
  )
}

export { PremiumProvider, usePremium }
