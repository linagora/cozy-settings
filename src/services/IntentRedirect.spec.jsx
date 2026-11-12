import { getRedirectPath } from './IntentRedirect'

describe('getRedirectPath', () => {
  it('should redirect to the profile without a step', () => {
    expect(getRedirectPath(null)).toBe('/profile')
    expect(getRedirectPath('')).toBe('/profile')
  })

  it('should redirect to the in-app path of the step', () => {
    expect(getRedirectPath('storage')).toBe('/storage')
    expect(getRedirectPath('profile/password')).toBe('/profile/password')
    expect(getRedirectPath('connectedDevices/abc-123')).toBe(
      '/connectedDevices/abc-123'
    )
    expect(getRedirectPath('permissions/slug/drive/')).toBe(
      '/permissions/slug/drive/'
    )
  })

  it('should ignore a step that could leave the app', () => {
    expect(getRedirectPath('\\evil.example')).toBe('/profile')
    expect(getRedirectPath('/\\evil.example')).toBe('/profile')
    expect(getRedirectPath('/evil.example')).toBe('/profile')
    expect(getRedirectPath('//evil.example')).toBe('/profile')
    expect(getRedirectPath('storage//evil.example')).toBe('/profile')
    expect(getRedirectPath('https://evil.example')).toBe('/profile')
    expect(getRedirectPath('javascript:alert(1)')).toBe('/profile')
    expect(getRedirectPath('profile/../../evil')).toBe('/profile')
    expect(getRedirectPath('storage?x=1')).toBe('/profile')
  })
})
