import React, { createContext, useContext, useState } from 'react'

const ImportsContext = createContext(null)

export const ImportsProvider = ({ children }) => {
  const [enabled, setEnabled] = useState(false)

  const value = {
    enabled,
    setEnabled
  }

  return (
    <ImportsContext.Provider value={value}>{children}</ImportsContext.Provider>
  )
}

export const useImports = () => {
  const ctx = useContext(ImportsContext)
  if (!ctx) {
    throw new Error('useImports must be used within an ImportsProvider')
  }
  return ctx
}
