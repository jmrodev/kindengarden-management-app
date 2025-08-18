"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X, Home, Users, BookOpen, MessageSquare, Baby, Calendar, Shield, FileText } from "lucide-react"
import Link from "next/link"
import { signOut } from "@/lib/actions"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: string
  userName: string
}

export function DashboardLayout({ children, userRole, userName }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from("user_profiles")
          .select(`
            *,
            user_roles (
              name,
              description
            )
          `)
          .eq("id", user.id)
          .single()

        setProfile(data)
      }
    }

    getProfile()
  }, [supabase])

  const getNavigationItems = () => {
    const baseItems = [{ href: "/dashboard", icon: Home, label: "Inicio" }]

    switch (userRole) {
      case "padre":
        return [
          ...baseItems,
          { href: "/dashboard/padre/hijos", icon: Baby, label: "Mis Hijos" },
          { href: "/dashboard/padre/asistencia", icon: Calendar, label: "Asistencia" },
          { href: "/dashboard/padre/comunicaciones", icon: MessageSquare, label: "Comunicaciones" },
          { href: "/dashboard/padre/solicitudes", icon: FileText, label: "Solicitudes" },
        ]
      case "maestro":
        return [
          ...baseItems,
          { href: "/dashboard/maestro/alumnos", icon: Users, label: "Mis Alumnos" },
          { href: "/dashboard/maestro/asistencia", icon: Calendar, label: "Asistencia" },
          { href: "/dashboard/maestro/actividades", icon: BookOpen, label: "Actividades" },
          { href: "/dashboard/maestro/comunicaciones", icon: MessageSquare, label: "Comunicaciones" },
        ]
      case "directivo":
      case "admin":
        return [
          ...baseItems,
          { href: "/dashboard/directivo/alumnos", icon: Users, label: "Alumnos" },
          { href: "/dashboard/directivo/personal", icon: Shield, label: "Personal" },
          { href: "/dashboard/directivo/inscripciones", icon: FileText, label: "Inscripciones" },
          { href: "/dashboard/directivo/comunicaciones", icon: MessageSquare, label: "Comunicaciones" },
          { href: "/dashboard/directivo/reportes", icon: BookOpen, label: "Reportes" },
        ]
      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "padre":
        return "Padre/Madre"
      case "maestro":
        return "Maestro/a"
      case "directivo":
        return "Personal Directivo"
      case "admin":
        return "Administrador"
      default:
        return role
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <h1 className="text-xl font-serif font-bold text-green-700">Jardín "Pequeños Exploradores"</h1>
              <p className="text-sm text-green-600">
                {getRoleDisplayName(userRole)} - {userName}
              </p>
            </div>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </form>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white/90 backdrop-blur-sm border-r border-green-200 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          <nav className="p-4 space-y-2 mt-4">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
