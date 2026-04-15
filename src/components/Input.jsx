import React from 'react'

import Chip from 'cozy-ui/transpiled/react/Chips'
import Switch from 'cozy-ui/transpiled/react/Switch'
import Typography from 'cozy-ui/transpiled/react/Typography'
import UIInput from 'cozy-ui/transpiled/react/legacy/Input'

import Field from '@/components/Field'

const Input = ({
  name,
  type = 'text',
  placeholder = '',
  value,
  submitting,
  tag,
  errors,
  onChange,
  onBlur,
  readOnly
}) => {
  if (readOnly) {
    if (value) {
      return (
        <div className="u-pv-half u-h-2 u-flex u-flex-items-center">
          <Typography className="u-mr-half" variant="button">
            {value}
          </Typography>
          {!!tag && (
            <Chip variant="ghost" color="warning" size="small" label={tag} />
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div className="u-pos-relative">
      <UIInput
        type={type}
        placeholder={placeholder}
        defaultValue={value}
        value={undefined}
        name={name}
        onChange={onChange && (e => onChange(name, e.target.value))}
        onBlur={onBlur && (e => onBlur(name, e.target.value))}
        className={errors && errors.length !== 0 ? 'u-error' : ''}
        aria-busy={submitting}
        readOnly={readOnly}
      />
    </div>
  )
}

const SwitchCheckBox = ({ name, value, onChange }) => (
  <span>
    <Switch
      id={`set-${name.replace(' ', '_')}-toggle`}
      checked={!!value}
      color="primary"
      onChange={(ev, checked) => onChange(name, checked)}
    />
  </span>
)

const SwitchOrInput = props => {
  return (
    <Field {...props}>
      {props.type === 'checkbox' ? (
        <SwitchCheckBox {...props} />
      ) : (
        <Input {...props} />
      )}
    </Field>
  )
}

export default SwitchOrInput
