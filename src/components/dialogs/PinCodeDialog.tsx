import React, {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState
} from 'react'
import InputMask from 'react-input-mask'
import { useI18n } from 'twake-i18n'

import Button from 'cozy-ui/transpiled/react/Buttons'
import { Dialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import TextField from 'cozy-ui/transpiled/react/TextField'
import Typography from 'cozy-ui/transpiled/react/Typography'

interface PinCodeDialogProps {
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  setPinCode: (pinCode: string) => void
}

const validatePinCode = (pinCode: string): boolean =>
  pinCode.replace(/_/g, '').length === 4

export const PinCodeDialog = ({
  setPinCode,
  setModalVisible
}: PinCodeDialogProps): JSX.Element => {
  const [confirmValue, setConfirmValue] = useState('')
  const [error, setError] = useState('')
  const [flowStep, setFlowStep] = useState<'initial' | 'confirm'>('initial')
  const [initialValue, setInitialValue] = useState('')
  const onCancel = (): void => setModalVisible(false)
  const inputRef = useRef<HTMLInputElement>()
  const { t } = useI18n()

  const handleChange = (
    event: ChangeEvent<HTMLInputElement> | KeyboardEvent
  ): void => {
    if ('value' in event.target) {
      flowStep === 'initial'
        ? setInitialValue(event.target.value)
        : setConfirmValue(event.target.value)
    }

    if ('key' in event && flowStep === 'initial') {
      validatePinCode(initialValue) && setFlowStep('confirm')
      inputRef.current?.blur()
    }

    if ('key' in event && flowStep === 'confirm')
      validatePinCode(initialValue) && trySetPinCode()
  }

  const trySetPinCode = (): void => {
    initialValue !== confirmValue
      ? setError(t('LockScreenView.confirm_pin_error'))
      : setPinCode(initialValue)
  }

  useEffect(() => {
    flowStep === 'confirm' && inputRef.current?.focus()
  }, [flowStep])

  return (
    <Dialog
      open
      onClose={onCancel}
      size="small"
      title={t(
        `LockScreenView.${
          flowStep === 'initial' ? 'choose' : 'confirm'
        }_pin_title`
      )}
      actions={
        <>
          <Button
            onClick={onCancel}
            variant="secondary"
            label={t(
              `LockScreenView.${
                flowStep === 'initial' ? 'choose' : 'confirm'
              }_pin_cancel`
            )}
          />
          <Button
            onClick={(): void =>
              flowStep === 'initial' ? setFlowStep('confirm') : trySetPinCode()
            }
            label={t(
              `LockScreenView.${
                flowStep === 'initial' ? 'choose_pin_next' : 'confirm_pin_next'
              }`
            )}
            disabled={
              flowStep === 'initial'
                ? !validatePinCode(initialValue)
                : !validatePinCode(confirmValue)
            }
          />
        </>
      }
      content={
        <>
          <Typography className="u-mb-1" variant="body1">
            {t(
              `LockScreenView.${
                flowStep === 'initial' ? 'choose' : 'confirm'
              }_pin_body`
            )}
          </Typography>

          <InputMask
            alwaysShowMask
            mask="9999"
            maskPlaceholder="_"
            onChange={handleChange}
            value={flowStep === 'initial' ? initialValue : confirmValue}
          >
            {(): JSX.Element => (
              <TextField
                inputRef={inputRef}
                autoFocus
                error={Boolean(error)}
                fullWidth
                helperText={error}
                label={t('LockScreenView.choose_pin_label')}
                variant="outlined"
                inputProps={{
                  inputMode: 'numeric',
                  onKeyPress: event =>
                    event.key === 'Enter' && handleChange(event)
                }}
              />
            )}
          </InputMask>
        </>
      }
    />
  )
}
