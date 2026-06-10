import React, { createContext, useState, useContext, useEffect } from 'react'

export type UserRole = 'guest' | 'client' | 'admin'

export interface User {
  id: number
  username: string
  email: string
  full_name: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isClient: boolean
  isGuest: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_USERS = [
  { id: 1, username: 'guest', password: 'guest', email: 'guest@octofish.ru', full_name: 'Гость', role: 'guest' as UserRole },
  { id: 2, username: 'client', password: 'client', email: 'client@octofish.ru', full_name: 'Иван Петров', role: 'client' as UserRole },
  { id: 3, username: 'admin', password: 'admin', email: 'admin@octofish.ru', full_name: 'Администратор', role: 'admin' as UserRole },
]

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('octofish_current_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = async (username: string, password: string) => {
    const demoUser = DEMO_USERS.find(u => u.username === username && u.password === password)
    if (demoUser) {
      const { password: _, ...userWithoutPassword } = demoUser
      setUser(userWithoutPassword as User)
      localStorage.setItem('octofish_current_user', JSON.stringify(userWithoutPassword))
      return
    }
    
    const registeredUsers = JSON.parse(localStorage.getItem('octofish_users') || '[]')
    const registeredUser = registeredUsers.find((u: any) => u.username === username && u.password === password)
    if (registeredUser) {
      const userData = {
        id: Date.now(),
        username: registeredUser.username,
        email: registeredUser.email,
        full_name: registeredUser.full_name,
        role: registeredUser.role as UserRole,
      }
      setUser(userData)
      localStorage.setItem('octofish_current_user', JSON.stringify(userData))
      return
    }
    
    throw new Error('Неверный логин или пароль')
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('octofish_current_user')
  }

  const isAdmin = user?.role === 'admin'
  const isClient = user?.role === 'client'
  const isGuest = !user || user?.role === 'guest'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isAdmin, isClient, isGuest }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
