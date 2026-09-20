import React, { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ceylonstay_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    persist(data)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    persist(data)
    return data
  }, [])

  const loginWithGoogle = useCallback(async (idToken) => {
    const { data } = await api.post('/auth/google', { idToken })
    persist(data)
    return data
  }, [])

  const loginWithFacebook = useCallback(async (accessToken) => {
    const { data } = await api.post('/auth/facebook', { accessToken })
    persist(data)
    return data
  }, [])

  function persist(data) {
    const userData = {
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    }
    localStorage.setItem('ceylonstay_token', data.token)
    localStorage.setItem('ceylonstay_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = useCallback(() => {
    localStorage.removeItem('ceylonstay_token')
    localStorage.removeItem('ceylonstay_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, loginWithFacebook, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}