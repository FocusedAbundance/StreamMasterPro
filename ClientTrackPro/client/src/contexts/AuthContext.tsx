"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type SubscriptionTier = "free" | "streamer" | "mogul"

export interface User {
  id: string
  email: string
  username: string
  isVerified: boolean
  subscriptionTier: SubscriptionTier
  subscriptionEnds: Date | null
  isYearlySubscription: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => void
  verifyEmail: (code: string) => Promise<boolean>
  resendVerificationCode: () => Promise<void>
  updateSubscription: (tier: SubscriptionTier, isYearly: boolean) => Promise<void>
  cancelSubscription: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Convert subscription end date string back to Date object
        if (parsedUser.subscriptionEnds) {
          parsedUser.subscriptionEnds = new Date(parsedUser.subscriptionEnds)
        }
        setUser(parsedUser)
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful login
      const mockUser: User = {
        id: "user-123",
        email,
        username: email.split("@")[0],
        isVerified: true,
        subscriptionTier: "free",
        subscriptionEnds: null,
        isYearlySubscription: false,
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, username: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful registration
      const mockUser: User = {
        id: "user-" + Date.now(),
        email,
        username,
        isVerified: false,
        subscriptionTier: "free",
        subscriptionEnds: null,
        isYearlySubscription: false,
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const verifyEmail = async (code: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call to verify the code
      // For demo purposes, we'll simulate a successful verification if code is "123456"
      if (code === "123456" && user) {
        const updatedUser = { ...user, isVerified: true }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
        return true
      }
      return false
    } catch (error) {
      console.error("Email verification failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerificationCode = async () => {
    // In a real app, this would trigger sending a new verification code
    console.log("Resending verification code to:", user?.email)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const updateSubscription = async (tier: SubscriptionTier, isYearly: boolean) => {
    if (!user) return

    setIsLoading(true)
    try {
      // Calculate subscription end date
      const now = new Date()
      const subscriptionEnds = new Date(now)
      if (isYearly) {
        subscriptionEnds.setFullYear(subscriptionEnds.getFullYear() + 1)
      } else {
        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1)
      }

      const updatedUser = {
        ...user,
        subscriptionTier: tier,
        subscriptionEnds,
        isYearlySubscription: isYearly,
      }

      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    } catch (error) {
      console.error("Subscription update failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const cancelSubscription = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const updatedUser = {
        ...user,
        subscriptionTier: "free",
        subscriptionEnds: null,
        isYearlySubscription: false,
      }

      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    } catch (error) {
      console.error("Subscription cancellation failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    verifyEmail,
    resendVerificationCode,
    updateSubscription,
    cancelSubscription,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
