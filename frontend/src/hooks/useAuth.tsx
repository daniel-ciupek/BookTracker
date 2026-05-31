import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'
import type { AuthUser } from '../types/auth'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(() => !!authApi.getToken())

  useEffect(() => {
    const token = authApi.getToken()
    if (!token) return
    authApi
      .me(token)
      .then(setUser)
      .catch(() => authApi.clearToken())
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await authApi.login(email, password)
    authApi.setToken(token)
    setUser(u)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { token, user: u } = await authApi.register(name, email, password)
    authApi.setToken(token)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    const token = authApi.getToken()
    if (token) await authApi.logout(token)
    authApi.clearToken()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (data: { name?: string; email?: string }) => {
    const token = authApi.getToken()!
    const updated = await authApi.updateProfile(data, token)
    setUser(updated)
  }, [])

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const token = authApi.getToken()!
      await authApi.changePassword(currentPassword, newPassword, token)
    },
    [],
  )

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateProfile, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
