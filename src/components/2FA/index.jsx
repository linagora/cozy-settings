import React, { useState } from 'react'
import { useI18n } from 'twake-i18n'

import { useQuery, useMutation } from 'cozy-client'

import Activate2FA from '@/components/2FA/Activate2FA'
import Desactivate2FA from '@/components/2FA/Desactivate2FA'
import Input from '@/components/Input'
import { buildSettingsInstanceQuery } from '@/lib/queries'

const TwoFA = () => {
  const { t } = useI18n()

  const instanceQuery = buildSettingsInstanceQuery()
  const { data: instance } = useQuery(
    instanceQuery.definition,
    instanceQuery.options
  )

  const { mutate } = useMutation()

  const [isActivationModalOpen, setActivationModalOpen] = useState(false)
  const [isDesactivationModalOpen, setDesactivationModalOpen] = useState(false)

  const openActivationModal = () => {
    setActivationModalOpen(true)
  }

  const closeActivationModal = () => {
    setActivationModalOpen(false)
  }

  const openDesactivationModal = () => {
    setDesactivationModalOpen(true)
  }
  const closeDesactivationModal = () => {
    setDesactivationModalOpen(false)
  }

  const onActivation = () => {
    mutate({
      _rev: instance.meta.rev,
      ...instance,
      attributes: {
        ...instance.attributes,
        auth_mode: 'two_factor_mail'
      }
    })
  }

  const onDesactivation = () => {
    mutate({
      _rev: instance.meta.rev,
      ...instance,
      attributes: {
        ...instance.attributes,
        auth_mode: 'basic'
      }
    })
  }

  const isTwoFactorEnabled = instance.auth_mode === 'two_factor_mail'

  return (
    <div>
      <Input
        name="two_fa"
        type="checkbox"
        title={t('ProfileView.twofa.title.activate')}
        label={t('ProfileView.twofa.label', {
          link: 'https://support.cozy.io/article/114-doubleauthentification'
        })}
        value={isTwoFactorEnabled}
        onChange={
          isTwoFactorEnabled ? openDesactivationModal : openActivationModal
        }
      />
      {isActivationModalOpen && (
        <Activate2FA
          onActivation={onActivation}
          closeModal={closeActivationModal}
        />
      )}
      {isDesactivationModalOpen && (
        <Desactivate2FA
          onDesactivation={onDesactivation}
          closeModal={closeDesactivationModal}
        />
      )}
    </div>
  )
}

export default TwoFA
