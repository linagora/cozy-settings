import classNames from 'classnames'
import React, { useState, useEffect, useRef } from 'react'
import { useI18n } from 'twake-i18n'

import Icon from 'cozy-ui/transpiled/react/Icon'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import CheckIcon from 'cozy-ui/transpiled/react/Icons/Check'
import CopyIcon from 'cozy-ui/transpiled/react/Icons/Copy'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { Media, Bd, Img } from 'cozy-ui/transpiled/react/deprecated/Media'
import { useAlert } from 'cozy-ui/transpiled/react/providers/Alert'
import { useTheme } from 'cozy-ui/transpiled/react/styles'
import { useCozyTheme } from 'cozy-ui-plus/dist/providers/CozyTheme'

import styles from '@/styles/fields.styl'

import ReactMarkdownWrapper from '@/components/ReactMarkdownWrapper'

const absoluteStyle = {
  position: 'absolute',
  top: '0.5rem',
  right: 0
}

const StatusIcon = ({
  submitting,
  saved,
  className,
  absolute,
  copyable,
  value,
  onCopy
}) => {
  const { t } = useI18n()
  const { isLight } = useCozyTheme()
  const theme = useTheme()
  const { showAlert } = useAlert()
  const [showCopyIcon, setShowCopyIcon] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    if (saved && copyable) {
      setShowCopyIcon(false)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        setShowCopyIcon(true)
      }, 2000)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [saved, copyable])

  const handleCopy = async () => {
    if (value && onCopy) {
      onCopy(value)
    } else if (value) {
      try {
        await navigator.clipboard.writeText(value)
        showAlert({
          message: t('Input.copied', 'Copied to clipboard'),
          type: 'success'
        })
      } catch (err) {
        console.error('Could not copy text: ', err)
        showAlert({
          message: t('Input.copy_failed', 'Failed to copy to clipboard'),
          type: 'error'
        })
      }
    }
  }

  return (
    <span className={className} style={absolute && absoluteStyle}>
      {submitting && (
        <Spinner
          noMargin
          className={classNames(styles['set-field-loading'], 'u-mr-half')}
        />
      )}
      {saved && !showCopyIcon && (
        <IconButton
          size="small"
          className="u-mr-half"
          style={{
            color: isLight
              ? theme.palette.text.secondary
              : theme.palette.text.primary,
            zIndex: 1
          }}
          disabled
        >
          <Icon
            icon={CheckIcon}
            className={classNames(styles['set-field-saved'], 'u-valid')}
          />
        </IconButton>
      )}
      {!submitting && (!saved || showCopyIcon) && copyable && value && (
        <IconButton
          onClick={handleCopy}
          size="small"
          color="primary"
          className="u-mr-half"
          style={{
            color: isLight
              ? theme.palette.text.secondary
              : theme.palette.text.primary,
            zIndex: 1
          }}
        >
          <Icon icon={CopyIcon} />
        </IconButton>
      )}
    </span>
  )
}

const Field = ({
  className,
  type,
  title,
  label,
  submitting,
  saved,
  errors,
  children,
  copyable,
  value,
  onCopy
}) => {
  const { t } = useI18n()

  return (
    <div className={className}>
      <Typography variant="h5">{title}</Typography>
      <div>
        <Typography variant="body1" component="div" gutterBottom>
          {type === 'checkbox' ? (
            <Media>
              <Bd>
                <ReactMarkdownWrapper source={label} />
              </Bd>
              <Img>
                <StatusIcon
                  submitting={submitting}
                  saved={saved}
                  copyable={copyable}
                  value={value}
                  onCopy={onCopy}
                />
              </Img>
              <Img>{children}</Img>
            </Media>
          ) : (
            <>
              <ReactMarkdownWrapper source={label} />
              <div className="u-pos-relative">
                <StatusIcon
                  absolute
                  submitting={submitting}
                  saved={saved}
                  copyable={copyable}
                  value={value}
                  onCopy={onCopy}
                />
                {children}
              </div>
            </>
          )}
        </Typography>
      </div>
      {errors &&
        errors.length !== 0 &&
        errors.map((error, index) => (
          <Typography variant="body1" className="u-error" key={index}>
            {t(error)}
          </Typography>
        ))}
    </div>
  )
}

export default Field
