"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { insforge } from "@/lib/insforge"

export type UserPlan = "free" | "student" | "professional"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  plan: UserPlan
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, plan: UserPlan) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function mapInsforgeUser(insforgeUser: any, plan?: UserPlan): User {
  return {
    id: insforgeUser.id,
    name: insforgeUser.profile?.name || insforgeUser.email?.split("@")[0] || "User",
    email: insforgeUser.email,
    avatar: insforgeUser.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(insforgeUser.profile?.name || insforgeUser.email)}`,
    plan: (insforgeUser.metadata?.plan as UserPlan) || plan || "free",
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadCurrentUser = useCallback(async () => {
    try {
      const { data, error } = await insforge.auth.getCurrentUser()
      if (!error && data?.user) {
        setUser(mapInsforgeUser(data.user))
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCurrentUser()
  }, [loadCurrentUser])

  const login = async (email: string, password: string) => {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message || "Login failed")
    if (data?.user) {
      setUser(mapInsforgeUser(data.user))
    }
  }

  const signup = async (name: string, email: string, password: string, plan: UserPlan) => {
    const { data, error } = await insforge.auth.signUp({ email, password, name })
    if (error) throw new Error(error.message || "Signup failed")

    if (data?.requireEmailVerification) {
      throw new Error("Please check your email to verify your account before signing in.")
    }

    if (data?.user) {
      await insforge.auth.setProfile({ name, plan })
      setUser(mapInsforgeUser(data.user, plan))
    }
  }

  const logout = async () => {
    await insforge.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading, login, signup, logout }}>
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
