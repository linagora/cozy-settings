import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from 'twake-i18n'

import Button from 'cozy-ui/transpiled/react/Buttons'
import { ConfirmDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import ChatIcon from 'cozy-ui/transpiled/react/Icons/Chat'
import DriveIcon from 'cozy-ui/transpiled/react/Icons/Drive'
import MailIcon from 'cozy-ui/transpiled/react/Icons/Mail'
import Typography from 'cozy-ui/transpiled/react/Typography'

const DeleteSection = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [currentPopup, setCurrentPopup] = useState(0)

  const handleClick = () => {
    setCurrentPopup(1)
  }

  const handleContinue = () => {
    if (currentPopup < 4) {
      setCurrentPopup(currentPopup + 1)
    } else {
      setCurrentPopup(0)
      navigate('delete')
    }
  }

  const handleClose = () => {
    setCurrentPopup(0)
  }

  const popupData = [
    {
      icon: ChatIcon,
      title: t('DeleteAccount.popup.chat.conversations.title'),
      description: t('DeleteAccount.popup.chat.conversations.description')
    },
    {
      icon: ChatIcon,
      title: t('DeleteAccount.popup.chat.groupChat.title'),
      description: t('DeleteAccount.popup.chat.groupChat.description')
    },
    {
      icon: DriveIcon,
      title: t('DeleteAccount.popup.drive.title'),
      description: t('DeleteAccount.popup.drive.description')
    },
    {
      icon: MailIcon,
      title: t('DeleteAccount.popup.mail.title'),
      description: t('DeleteAccount.popup.mail.description')
    }
  ]

  const renderPopup = () => {
    if (currentPopup === 0) return null

    const { icon: Icon, title, description } = popupData[currentPopup - 1]

    return (
      <ConfirmDialog
        open
        title=""
        content={
          <div className="u-flex u-flex-column u-flex-items-center u-mt-2 u-mb-2-half">
            <div className="u-mb-1">
              <Icon width="36" height="36" />
            </div>
            <Typography variant="h3" className="u-mb-1">
              {title}
            </Typography>
            <Typography variant="body1">{description}</Typography>
          </div>
        }
        actions={
          <>
            <Button
              label={t('DeleteAccount.popup.deleteLater')}
              variant="primary"
              size="large"
              onClick={handleClose}
            />
            <Button
              label={t('DeleteAccount.popup.continue')}
              color="primary"
              variant="text"
              size="large"
              className="u-mh-1-half"
              onClick={handleContinue}
            />
          </>
        }
        onClose={handleClose}
      />
    )
  }

  return (
    <div className="u-mt-2">
      <Typography variant="h5" gutterBottom>
        {t('DeleteAccount.title')}
      </Typography>
      <Typography variant="body1">{t('DeleteAccount.label')}</Typography>
      <Button
        className="u-mt-1"
        variant="secondary"
        color="error"
        label={t('DeleteAccount.button.label')}
        onClick={handleClick}
      />
      {renderPopup()}
    </div>
  )
}

export { DeleteSection }
