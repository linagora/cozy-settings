import React, { useState } from 'react'
import { useI18n } from 'twake-i18n'

import Button from 'cozy-ui/transpiled/react/Buttons'
import Icon from 'cozy-ui/transpiled/react/Icon'
import BottomIcon from 'cozy-ui/transpiled/react/Icons/Bottom'
import RightIcon from 'cozy-ui/transpiled/react/Icons/Right'
import Stack from 'cozy-ui/transpiled/react/Stack'
import TextField from 'cozy-ui/transpiled/react/TextField'

const CreatePasswordHint = ({ value, onChange, sameAsPassword }) => {
  const { t } = useI18n()
  const [isCollapse, setCollapse] = useState(false)

  return (
    <Stack spacing="m">
      <Button
        label={t('PassphraseView.hint.title')}
        variant="text"
        onClick={() => setCollapse(!isCollapse)}
        startIcon={<Icon icon={isCollapse ? BottomIcon : RightIcon} />}
      />
      {isCollapse && (
        <>
          <TextField
            value={value}
            onChange={onChange}
            placeholder={t('PassphraseView.hint.placeholder')}
            name="hint"
            id="hint"
            variant="outlined"
            fullWidth
            error={sameAsPassword}
            helperText={
              sameAsPassword
                ? t('PassphraseView.hint.same_as_passphrase')
                : t('PassphraseView.hint.description')
            }
          />
        </>
      )}
    </Stack>
  )
}

export default CreatePasswordHint
