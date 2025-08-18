"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export function AuthGuard({ children, allowedRoles, redirectTo = "/auth/login" }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push(redirectTo)
          return
        }

        // If no specific roles required, just check if user is authenticated
        if (!allowedRoles || allowedRoles.length === 0) {
          setIsAuthorized(true)
          setIsLoading(false)
          return
        }

        // Check user role
        const { data: profile } = await supabase
          .from("user_profiles")
          .select(`
            *,
            user_roles (
              name
            )
          `)
          .eq("id", user.id)
          .single()

        if (!profile || !profile.user_roles) {
          router.push(redirectTo)
          return
        }

        const userRole = profile.user_roles.name
        if (allowedRoles.includes(userRole)) {
          setIsAuthorized(true)
        } else {
          router.push("/dashboard") // Redirect to appropriate dashboard
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router, allowedRoles, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
