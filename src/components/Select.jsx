import React from 'react'
import { translate } from 'twake-i18n'

import SelectBox from 'cozy-ui/transpiled/react/SelectBox'

import Field from '@/components/Field'

const makeAriaLiveMessages = t => ({
  guidance: ({ context, isSearchable }) => {
    if (context === 'menu') return t('Accessibility.select_guidance_menu')
    return isSearchable
      ? t('Accessibility.select_guidance_input')
      : t('Accessibility.select_guidance_input_not_searchable')
  },
  onChange: ({ label }) => t('Accessibility.select_option_selected', { label }),
  onFocus: ({ label, options, focused, isSelected }) =>
    t(
      isSelected
        ? 'Accessibility.select_option_current'
        : 'Accessibility.select_option_focused',
      {
        label,
        index: options.indexOf(focused) + 1,
        total: options.length
      }
    ),
  onFilter: ({ inputValue, resultsMessage }) =>
    inputValue
      ? t('Accessibility.select_results_filtered', {
          results: resultsMessage,
          term: inputValue
        })
      : resultsMessage
})

export default translate()(props => {
  const { fieldProps, t, ...restProps } = props
  return (
    <Field {...fieldProps}>
      <SelectBox
        {...restProps}
        ariaLiveMessages={makeAriaLiveMessages(t)}
        screenReaderStatus={({ count }) =>
          t('Accessibility.select_results', { smart_count: count })
        }
        fullwidth
      />
    </Field>
  )
})
