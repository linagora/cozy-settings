import React from 'react'
import { useI18n } from 'twake-i18n'

import { Button, ButtonLink } from 'cozy-ui/transpiled/react/deprecated/Button'

export const ClaudyAction = ({ action, iconSrc, url, onActionClick }) => {
  const { t } = useI18n()
  return (
    <div className="coz-claudy-menu-action-description">
      <div className="coz-claudy-menu-action-description-header">
        <img className="coz-claudy-menu-action-icon" src={iconSrc} />
        <p className="coz-claudy-menu-action-title">
          {t(`claudy.actions.${action.slug}.title`)}
        </p>
      </div>
      <div className="coz-claudy-menu-action-description-content">
        <p className="coz-claudy-menu-action-description-text">
          {t(`claudy.actions.${action.slug}.description`)}
        </p>
        {url ? (
          <ButtonLink
            href={url}
            target={action.link.type === 'external' ? '_blank' : '_parent'}
            className="coz-claudy-menu-action-description-button"
            onClick={onActionClick}
          >
            {t(`claudy.actions.${action.slug}.button`)}
          </ButtonLink>
        ) : (
          <Button
            className="coz-claudy-menu-action-description-button"
            disabled
            title={`App ${action.link.appSlug} not found`}
          >
            {t(`claudy.actions.${action.slug}.button`)}
          </Button>
        )}
      </div>
    </div>
  )
}

export default ClaudyAction
