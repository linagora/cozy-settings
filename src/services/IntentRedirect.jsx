import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const DEFAULT_PATH = '/profile'

// The step comes from the query string of the REDIRECT intent: only accept a
// relative in-app path (letters, digits, '-', '_', '.' and single slashes), so
// that a crafted value such as '\evil.example' or '/evil.example' can't make
// the router leave the app (CVE-2025-68470, CVE-2026-53669).
const SAFE_STEP = /^[A-Za-z0-9_-][A-Za-z0-9_.-]*(\/[A-Za-z0-9_.-]+)*\/?$/

export const getRedirectPath = step =>
  step && SAFE_STEP.test(step) && !step.split('/').includes('..')
    ? `/${step}`
    : DEFAULT_PATH

export const IntentRedirect = () => {
  const { search } = useLocation()
  const step = new URLSearchParams(search).get('step')

  return <Navigate to={getRedirectPath(step)} />
}

export default IntentRedirect
