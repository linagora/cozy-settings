import { useQuery, isQueryLoading, hasQueryBeenLoaded } from 'cozy-client'
import { UseQueryReturnValue } from 'cozy-client/types/types'

import { buildAppsQueryBySlug, buildKonnectorsQueryBySlug } from '@/lib/queries'

interface useAppsOrKonnectorsBySlugReturns {
  isResultLoading: boolean
  hasQueryFailed: boolean
  result: UseQueryReturnValue | undefined
}

const useAppsOrKonnectorsBySlug = (
  slugName: string
): useAppsOrKonnectorsBySlugReturns => {
  const appsQuery = buildAppsQueryBySlug(slugName)
  const konnectorsQuery = buildKonnectorsQueryBySlug(slugName)

  const queryResultApps = useQuery(appsQuery.definition, appsQuery.options)
  const isNotAnApp = queryResultApps.fetchStatus === 'failed'

  const queryResultKonnectors = useQuery(konnectorsQuery.definition, {
    ...konnectorsQuery.options,
    enabled: isNotAnApp
  })

  const result = isNotAnApp ? queryResultKonnectors : queryResultApps

  return {
    isResultLoading: isQueryLoading(result) && !hasQueryBeenLoaded(result),
    hasQueryFailed: result.fetchStatus === 'failed',
    result
  }
}

export default useAppsOrKonnectorsBySlug
