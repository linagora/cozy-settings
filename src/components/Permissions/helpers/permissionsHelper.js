import PERMISSIONS_ICONS from '../../../config/permissionsIcons.json'

export const displayPermissions = verbs => {
  return !verbs || (verbs.length > 1 && verbs.includes('GET'))
    ? 'Permissions.readAndWrite'
    : verbs.length === 1 && verbs.includes('GET')
      ? 'Permissions.read'
      : 'Permissions.write'
}

export const getPermissionIconName = type => {
  return PERMISSIONS_ICONS[type] || 'Fallback'
}

export const completePermission = (apps, konnectors) => {
  const hiddenSlugs = ['home', 'store', 'settings']
  const permissionsToDisplay = {}
  if (apps?.data?.length > 0 || konnectors?.data?.length > 0) {
    const slugs = [
      ...apps.data.filter(({ slug }) => !hiddenSlugs.includes(slug)),
      ...konnectors.data
    ]

    for (const { slug, permissions } of slugs) {
      Object.values(permissions).map(({ type }) => {
        if (!permissionsToDisplay[type]) {
          permissionsToDisplay[type] = []
        }
        permissionsToDisplay[type].push(slug)
      })
    }
  }
  return permissionsToDisplay
}

export const getPermissionsVerbsByType = (permissions, type) => {
  let verbs
  const permissionsArray = Object.entries(permissions)
  for (let i = 0; i < permissionsArray.length; i++) {
    if (permissionsArray[i][1].type === type) {
      verbs = permissionsArray[i][1].verbs
    }
  }
  return verbs
}

export const filterPermissions = (remoteDoctypes, matchingQueryResult) => {
  let limitedRightAccess = []
  let exitRights = []
  if (remoteDoctypes && matchingQueryResult?.data?.permissions) {
    const permissions = Object.entries(matchingQueryResult.data.permissions)
    for (let i = 0; i < permissions.length; i++) {
      if (remoteDoctypes.includes(permissions[i][1].type)) {
        exitRights.push(permissions[i])
      } else {
        limitedRightAccess.push(permissions[i])
      }
    }
  }
  return { limitedRightAccess, exitRights }
}

export const sortPermissionsByName = (completePermission, permissions, t) => {
  return permissions
    .map(([name, value]) => {
      const type = value.type
      const perm = t('CozyPermissions.' + type)
      return completePermission(name, perm, value, type)
    })
    .sort((a, b) => {
      return a.title.localeCompare(b.title)
    })
}

export const completeAppPermission = (
  name,
  permission,
  { description, verbs },
  type
) => {
  const completedPermission = {
    name,
    type,
    title: permission
  }
  if (description) {
    completedPermission.description = description
  }
  if (verbs) {
    completedPermission.verbs = verbs
  }
  return completedPermission
}

export const sortDataByDate = queryResult => {
  return queryResult.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )
}

export const filterRemoteRequests = (remoteRequests, slugName) => {
  if (remoteRequests.data?.length > 0) {
    return remoteRequests.data.filter(
      data => data?.cozyMetadata?.createdByApp === slugName
    )
  }
}
