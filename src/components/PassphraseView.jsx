import React from 'react'

import { useQuery, hasQueryBeenLoaded } from 'cozy-client'
import Spinner from 'cozy-ui/transpiled/react/Spinner'

import Page from '@/components/Page'
import PassphraseForm from '@/components/PassphraseForm'
import { buildSettingsInstanceQuery } from '@/lib/queries'

const PassphraseView = ({ onPassphraseSimpleSubmit, passphrase }) => {
  const instanceQuery = buildSettingsInstanceQuery()
  const instanceResult = useQuery(
    instanceQuery.definition,
    instanceQuery.options
  )

  return (
    <Page narrow fullHeight>
      {hasQueryBeenLoaded(instanceResult) ? (
        <PassphraseForm {...passphrase} onSubmit={onPassphraseSimpleSubmit} />
      ) : (
        <Spinner
          className="u-pos-fixed-s"
          middle
          size="xxlarge"
          loadingType="loading"
        />
      )}
    </Page>
  )
}

export default PassphraseView
