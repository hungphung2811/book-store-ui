import { createContext, useContext, useEffect, useState } from 'react'
import { api, currentSession, onSessionChange } from './api'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(currentSession())
  useEffect(() => onSessionChange(setSession), [])
  const value = { user: session ? { username: session.username } : null, login: api.login, logout: api.logout }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
