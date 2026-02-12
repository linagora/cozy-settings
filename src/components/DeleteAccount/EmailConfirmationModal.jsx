import React from 'react'
import ReactMarkdown from 'react-markdown'
import { useI18n } from 'twake-i18n'

import { useQuery } from 'cozy-client'
import Button from 'cozy-ui/transpiled/react/Buttons'
import { IllustrationDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Icon from 'cozy-ui/transpiled/react/Icon'
import Typography from 'cozy-ui/transpiled/react/Typography'

import EmailIllustration from '@/assets/icons/email-illustration.svg'
import { buildSettingsInstanceQuery } from '@/lib/queries'

/**
 * @param {string} onClose - Callback when the user performs an action on the modal
 */
const EmailConfirmationModal = ({ onClose }) => {
  const { t } = useI18n()

  const instanceQuery = buildSettingsInstanceQuery()
  const { data: instance } = useQuery(
    instanceQuery.definition,
    instanceQuery.options
  )

  return (
    <IllustrationDialog
      open
      size="small"
      title={
        <div className="u-flex u-flex-column u-flex-items-center">
          <Icon icon={EmailIllustration} width={96} height={96} />
          <Typography variant="h3" className="u-mt-1">
            {t('DeleteAccount.modal.email_confirmation.title')}
          </Typography>
        </div>
      }
      content={
        <ReactMarkdown
          className="u-ta-center"
          source={t('DeleteAccount.modal.email_confirmation.description', {
            email: instance.email
          })}
          renderers={{
            paragraph: props => <span className="u-mv-0">{props.children}</span>
          }}
        />
      }
      actions={
        <Button
          fullWidth
          label={t(
            'DeleteAccount.modal.email_confirmation.button.submit.label'
          )}
          onClick={onClose}
        />
      }
      onClose={onClose}
    />
  )
}

export default EmailConfirmationModal
