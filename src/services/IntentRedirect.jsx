import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export const IntentRedirect = () => {
  const { search } = useLocation()
  const step = new URLSearchParams(search).get('step')

  return <Navigate to={step ? `/${step}` : '/profile'} />
}

export default IntentRedirect
