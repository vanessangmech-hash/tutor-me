"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type UserPlan = "free" | "student" | "professional"

export interface User {
  name: string
  email: string
  avatar: string
  plan: UserPlan
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string, plan?: UserPlan) => Promise<void>
  signup: (name: string, email: string, password: string, plan: UserPlan) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Check localStorage on mount for persistent login
  useEffect(() => {
    const savedUser = localStorage.getItem("tutorme_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, password: string, plan: UserPlan = "free") => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    const newUser: User = {
      name: email.split("@")[0],
      email,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      plan
    }
    
    setUser(newUser)
    localStorage.setItem("tutorme_user", JSON.stringify(newUser))
  }

  const signup = async (name: string, email: string, password: string, plan: UserPlan) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    const newUser: User = {
      name,
      email,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      plan
    }
    
    setUser(newUser)
    localStorage.setItem("tutorme_user", JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("tutorme_user")
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
