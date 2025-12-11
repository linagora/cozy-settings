import React from 'react'

import Select from '@/components/Select'

const ImportsProviderSelect = ({
  providerOptions,
  providerValue,
  providerFieldProps,
  onChange
}) => {
  return (
    <Select
      name="provider"
      options={providerOptions}
      fieldProps={providerFieldProps}
      value={providerValue}
      onChange={sel => {
        onChange(sel ? sel.value : '')
      }}
      isSearchable={false}
    />
  )
}

export default ImportsProviderSelect
