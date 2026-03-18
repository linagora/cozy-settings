export const sendDeleteAccountRequest = async client => {
  return await client
    .getStackClient()
    .fetchJSON('POST', '/settings/instance/deletion')
}

export const sendForceDeleteAccountRequest = async client => {
  return await client
    .getStackClient()
    .fetchJSON('DELETE', '/settings/instance/deletion/force')
}
